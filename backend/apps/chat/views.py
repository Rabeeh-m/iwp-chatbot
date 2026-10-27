import uuid
import hashlib
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ChatSession, ChatMessage
from apps.leads.models import Lead, ConversationSummary, LeadScoreEvent
from apps.leads.utils import LeadScoringEngine, PhoneValidator
from apps.knowledge.models import KnowledgeEntry
from .ai_service import AIService
from .journey import LeadJourney


ai_service = AIService()
scoring_engine = LeadScoringEngine()


@api_view(['POST'])
@permission_classes([AllowAny])
def create_session(request):
    public_session_id = str(uuid.uuid4())
    visitor_token = str(uuid.uuid4())
    visitor_token_hash = hashlib.sha256(visitor_token.encode()).hexdigest()
    
    session = ChatSession.objects.create(
        public_session_id=public_session_id,
        visitor_token_hash=visitor_token_hash,
        source_url=request.data.get('source_url', ''),
        referrer_url=request.data.get('referrer_url', ''),
        campaign_data=request.data.get('campaign_data', {}),
    )
    
    Lead.objects.create(session=session)
    ConversationSummary.objects.create(session=session)
    
    return Response({
        'session_id': public_session_id,
        'visitor_token': visitor_token,
        'message': "Hi! I'm your wedding planning assistant from Indian Wedding Planners. How can I help you plan your dream wedding today?"
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        if session.last_activity_at:
            from datetime import timedelta
            if timezone.now() - session.last_activity_at > timedelta(minutes=10):
                session.status = 'ended'
                session.save()
                return Response({
                    'message': {
                        'id': str(uuid.uuid4()),
                        'role': 'assistant',
                        'content': 'Session ended due to inactivity. Please start a new session.',
                        'created_at': timezone.now()
                    },
                    'session_id': session.public_session_id,
                    'session_ended': True
                })
        
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_message
        )
        session.message_count += 1
        session.last_activity_at = timezone.now()
        session.save()
        
        update_lead_from_conversation(session, user_message)
        LeadJourney.process_answer(session, user_message)
        # Mark consultation if user confirms
        try:
            lead_c = Lead.objects.get(session=session)
            msg_l = user_message.lower().strip()
            if msg_l in ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay'] or 'thank' in msg_l:
                if not lead_c.consultation_requested:
                    lead_c.consultation_requested = True
                if not lead_c.callback_requested:
                    lead_c.callback_requested = True
                lead_c.save()
                try:
                    from apps.chat.views import recalculate_lead_score
                    recalculate_lead_score(lead_c)
                except Exception:
                    pass
        except Exception:
            pass
        next_question = LeadJourney.get_next_question(session)
        
        if next_question and not LeadJourney.is_journey_complete(session):
            assistant_msg = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=next_question,
                metadata={'provider': 'journey'}
            )
            session.message_count += 1
            session.last_activity_at = timezone.now()
            session.save()
            update_lead_from_conversation(session, user_message)
            return Response({
                'message': {
                    'id': str(assistant_msg.id),
                    'role': 'assistant',
                    'content': next_question,
                    'created_at': assistant_msg.created_at
                },
                'session_id': session.public_session_id
            })
        
        try:
            lead = Lead.objects.get(session=session)
        except:
            lead = None
        
        update_lead_from_conversation(session, user_message)
        if lead:
            lead.refresh_from_db()
        
        history = list(session.messages.all().order_by('created_at'))
        messages_for_ai = []
        lead_context = ""
        if lead:
            lead_context = f"Lead details: Name={lead.full_name}, Phone={lead.phone_number}, Location={lead.wedding_location}, Date={lead.wedding_date}, Guests={lead.guest_count}, Budget={lead.budget_range_text}, Services={lead.required_services}. "
        messages_for_ai.append({'role': 'system', 'content': lead_context + "You are IWP wedding assistant for Indian Wedding Planners. Use ALL collected details. NEVER ask for name/phone/location/date/guests/budget/services again. If user is rude/complains, stay polite and redirect to helping with wedding planning. Correct facts: Founded 2013 by Anant Khandelwal, Jaipur HQ (34 Sangram Colony, C-Scheme, Jaipur 302001) + Mumbai office. Website: https://www.indianweddingplanners.in/. Phone/WhatsApp: +91 94143 66666. Email: info@indianweddingplanners.in. Always share full working links. Be brief (1-2 lines)."})
        for msg in history[-15:]:
            messages_for_ai.append({'role': msg.role, 'content': msg.content})
        
        knowledge_entries = KnowledgeEntry.objects.filter(is_active=True)[:3]
        context = {
            'knowledge': [{'title': k.title, 'content': k.content} for k in knowledge_entries]
        }
        
        ai_response, provider = ai_service.generate_response(messages_for_ai, context)
        if not ai_response:
            if lead and lead.wedding_location:
                ai_response = f"Great! We'll help with your {lead.wedding_location} wedding."
            else:
                ai_response = "How can I help with your wedding plans?"
        
        assistant_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=ai_response,
            metadata={'provider': provider}
        )
        session.message_count += 1
        session.last_activity_at = timezone.now()
        session.save()
        
        update_lead_from_conversation(session, user_message)
        
        return Response({
            'message': {
                'id': str(assistant_msg.id),
                'role': 'assistant',
                'content': ai_response,
                'created_at': assistant_msg.created_at
            },
            'session_id': session.public_session_id
        })
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Something went wrong'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def update_lead_from_conversation(session, message):
    try:
        lead = Lead.objects.get(session=session)
        updated = False
        import re
        phone_pattern = re.findall(r'(\+91[\-\s]?\d{10}|\b[6-9]\d{9}\b)', message)
        if phone_pattern and not lead.phone_number:
            normalized = PhoneValidator.normalize_phone(phone_pattern[0])
            if normalized:
                lead.phone_number = normalized
                lead.contact_details_collected = True
                updated = True
        name = str(lead.full_name or '').strip().lower()
        if (not name or name in ['hi', 'hello', 'hey', 'namaste']) and LeadJourney.is_valid_name(message) and not LeadJourney.is_phone(message):
            if message.strip().lower() not in ['gujarat', 'india', 'kerala']:
                lead.full_name = message.strip().title()
                updated = True
        msg_lower = message.lower()
        cities = ['kochi', 'trivandrum', 'thiruvananthapuram', 'kannur', 'alleppey', 'wayanad', 'jaipur', 'udaipur', 'goa', 'jodhpur', 'mumbai', 'delhi']
        if any(c in msg_lower for c in cities):
            for c in cities:
                if c in msg_lower:
                    if c == 'kochi': lead.wedding_location = 'Kochi'
                    elif c == 'trivandrum' or c == 'thiruvananthapuram': lead.wedding_location = 'Trivandrum'
                    else: lead.wedding_location = c.title()
                    updated = True
                    break
        if not lead.wedding_location and msg_lower.strip() == 'kerala':
            lead.wedding_location = 'Kerala'
            updated = True
        # Detect consultation/callback requests
        if any(x in msg_lower for x in ['call me', 'call you', 'schedule', 'consultation', 'talk to', 'reach out']):
            if not lead.consultation_requested:
                lead.consultation_requested = True
                updated = True
            if not lead.callback_requested:
                lead.callback_requested = True
                updated = True
        if msg_lower.strip() in ['yes'] and lead.consultation_requested is False:
            # If in context of confirmation, mark it
            pass
        if updated:
            lead.save()
            recalculate_lead_score(lead)
        else:
            # Still recalc to be safe
            recalculate_lead_score(lead)
    except Exception:
        pass


def _get_scoring_engine():
    """Build a scoring engine from admin-configured ScoringConfig (with fallback)."""
    try:
        from apps.chatbot_settings.models import ScoringConfig
        config = ScoringConfig.objects.first()
        if not config:
            return scoring_engine
        weights = {
            'wedding_date': config.wedding_date_points,
            'wedding_location': config.wedding_location_points,
            'budget': config.budget_points,
            'services': config.services_points,
            'guest_count': config.guest_count_points,
            'phone': config.phone_points,
            'consultation_request': config.consultation_request_points,
            'full_name': LeadScoringEngine.DEFAULT_WEIGHTS['full_name'],
        }
        thresholds = {
            'hot': config.hot_threshold,
            'warm': config.warm_threshold,
        }
        return LeadScoringEngine(weights=weights, thresholds=thresholds)
    except Exception:
        return scoring_engine


def recalculate_lead_score(lead):
    lead_data = {
        'wedding_date': lead.wedding_date,
        'wedding_location': lead.wedding_location,
        'budget_min': lead.budget_min,
        'budget_max': lead.budget_max,
        'budget_range_text': lead.budget_range_text,
        'required_services': lead.required_services,
        'guest_count': lead.guest_count,
        'phone_number': lead.phone_number,
        'full_name': lead.full_name,
        'email': lead.email,
        'callback_requested': lead.callback_requested or lead.consultation_requested,
        'consultation_requested': lead.consultation_requested or lead.callback_requested,
    }
    engine = _get_scoring_engine()
    score, qualification, factors = engine.calculate_score(lead_data)
    lead.lead_score = score
    lead.qualification_level = qualification
    # Update status based on completeness
    try:
        if lead.phone_number and lead.full_name and lead.wedding_location and lead.required_services and len(lead.required_services) > 0:
            if lead.lead_status == 'new':
                lead.lead_status = 'contact_pending'
    except Exception:
        pass
    lead.save()
    for factor_name, factor_data in factors.items():
        if factor_data['points'] > 0:
            LeadScoreEvent.objects.update_or_create(
                lead=lead,
                scoring_factor=factor_name,
                defaults={
                    'points_awarded': factor_data['points'],
                    'explanation': factor_data['reason'],
                }
            )
    LeadScoreEvent.objects.filter(lead=lead).exclude(
        scoring_factor__in=[name for name, data in factors.items() if data['points'] > 0]
    ).delete()


@api_view(['GET'])
@permission_classes([AllowAny])
def get_session(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        if session.last_activity_at:
            from datetime import timedelta
            if timezone.now() - session.last_activity_at > timedelta(minutes=10):
                session.status = 'ended'
                session.save()
        messages = session.messages.all()
        return Response({
            'session_id': session.public_session_id,
            'status': session.status,
            'created_at': session.created_at,
            'messages': [{'id': str(m.id), 'role': m.role, 'content': m.content, 'created_at': m.created_at} for m in messages]
        })
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def end_session(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        session.status = 'ended'
        session.ended_at = timezone.now()
        session.save()
        return Response({'message': 'Session ended successfully'})
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_history(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        messages = session.messages.all().order_by('created_at')
        return Response({
            'session_id': session.public_session_id,
            'messages': [{'id': str(m.id), 'role': m.role, 'content': m.content, 'created_at': m.created_at, 'metadata': m.metadata} for m in messages]
        })
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def consent(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        consent_given = request.data.get('consent', False)
        if hasattr(session, 'consent_status'):
            session.consent_status = bool(consent_given)
        if hasattr(session, 'consent_timestamp'):
            session.consent_timestamp = timezone.now() if consent_given else None
        session.save()
        return Response({'message': 'Consent updated successfully', 'consent': consent_given})
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
