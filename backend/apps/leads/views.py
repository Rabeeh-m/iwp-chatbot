from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import Lead, ConversationSummary, AdminNote, LeadScoreEvent
from apps.chat.models import ChatSession, ChatMessage


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def create_admin_setup(request):
    # Temporary setup - anyone can create/update admin
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if user exists
        user = User.objects.filter(username=username).first()
        if user:
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            return Response({'message': 'Admin account updated successfully'}, status=status.HTTP_200_OK)
        else:
            user = User.objects.create_superuser(username=username, email=email, password=password)
            user.is_staff = True
            user.save()
            return Response({'message': 'Admin account created successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful', 'username': user.username})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_me(request):
    return Response({
        'username': request.user.username,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_conversations = ChatSession.objects.count()
    total_leads = Lead.objects.count()
    hot_leads = Lead.objects.filter(qualification_level='hot').count()
    warm_leads = Lead.objects.filter(qualification_level='warm').count()
    cold_leads = Lead.objects.filter(qualification_level='cold').count()
    
    today = timezone.now().date()
    new_leads_today = Lead.objects.filter(created_at__date=today).count()
    
    leads_awaiting_followup = Lead.objects.filter(
        Q(lead_status='new') | Q(lead_status='contact_pending')
    ).count()
    
    consultations_requested = Lead.objects.filter(consultation_requested=True).count()
    
    recent_conversations = []
    for session in ChatSession.objects.all()[:5]:
        lead = getattr(session, 'lead', None)
        recent_conversations.append({
            'session_id': session.public_session_id,
            'name': lead.full_name if lead else 'Anonymous',
            'qualification': lead.qualification_level if lead else 'cold',
            'last_activity': session.last_activity_at,
            'message_count': session.message_count
        })
    
    return Response({
        'total_conversations': total_conversations,
        'total_leads': total_leads,
        'hot_leads': hot_leads,
        'warm_leads': warm_leads,
        'cold_leads': cold_leads,
        'new_leads_today': new_leads_today,
        'leads_awaiting_followup': leads_awaiting_followup,
        'consultations_requested': consultations_requested,
        'conversion_rate': 0,
        'recent_conversations': recent_conversations
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_logs(request):
    sessions = ChatSession.objects.all().order_by('-last_activity_at')
    
    search = request.query_params.get('search', '')
    if search:
        sessions = sessions.filter(
            Q(public_session_id__icontains=search) |
            Q(lead__full_name__icontains=search) |
            Q(lead__phone_number__icontains=search)
        )
    
    qualification = request.query_params.get('qualification')
    if qualification in ['hot', 'warm', 'cold']:
        sessions = sessions.filter(lead__qualification_level=qualification)
    
    status_filter = request.query_params.get('status')
    if status_filter in ['active', 'completed', 'abandoned']:
        sessions = sessions.filter(status=status_filter)
    
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(sessions, request)
    
    results = []
    for session in page:
        try:
            lead = session.lead
        except:
            lead = None
        try:
            summary = session.summary
            summary_status = summary.generation_status
        except:
            summary_status = 'pending'
        results.append({
            'session_id': session.public_session_id,
            'visitor_name': lead.full_name if lead else 'Anonymous',
            'mobile_number': lead.phone_number if lead else '',
            'wedding_location': lead.wedding_location if lead else '',
            'wedding_date': lead.wedding_date if lead else '',
            'lead_score': lead.lead_score if lead else 0,
            'qualification_level': lead.qualification_level if lead else 'cold',
            'conversation_status': session.status,
            'start_time': session.created_at,
            'last_activity': session.last_activity_at,
            'message_count': session.message_count,
            'summary_status': summary_status
        })
    
    return paginator.get_paginated_response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_log_detail(request, session_id):
    try:
        session = ChatSession.objects.get(public_session_id=session_id)
        messages = session.messages.all()
        try:
            lead = session.lead
        except:
            lead = None
        try:
            summary = session.summary
        except:
            summary = None
        
        return Response({
            'session': {
                'session_id': session.public_session_id,
                'status': session.status,
                'created_at': session.created_at,
                'last_activity_at': session.last_activity_at,
                'source_url': session.source_url,
            },
            'messages': [{
                'id': str(m.id),
                'role': m.role,
                'content': m.content,
                'created_at': m.created_at,
                'metadata': m.metadata
            } for m in messages],
            'lead': {
                'id': str(lead.id) if lead else None,
                'full_name': lead.full_name if lead else '',
                'phone_number': lead.phone_number if lead else '',
                'email': lead.email if lead else '',
                'wedding_location': lead.wedding_location if lead else '',
                'wedding_date': lead.wedding_date if lead else '',
                'wedding_type': lead.wedding_type if lead else '',
                'guest_count': lead.guest_count if lead else '',
                'budget_range_text': lead.budget_range_text if lead else '',
                'required_services': lead.required_services if lead else [],
                'lead_score': lead.lead_score if lead else 0,
                'qualification_level': lead.qualification_level if lead else 'cold',
                'lead_status': lead.lead_status if lead else 'new',
                'consultation_requested': lead.consultation_requested if lead else False,
            } if lead else None,
            'summary': {
                'summary_text': summary.summary_text if summary else '',
                'recommended_next_action': summary.recommended_next_action if summary else '',
                'generation_status': summary.generation_status if summary else 'pending',
            } if summary else None,
            'score_events': [{
                'factor': e.scoring_factor,
                'points': e.points_awarded,
                'explanation': e.explanation,
                'created_at': e.created_at
            } for e in lead.score_events.all()] if lead else []
        })
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def lead_detail(request, lead_id):
    try:
        lead = Lead.objects.get(id=lead_id)
        if request.method == 'GET':
            return Response({
                'id': str(lead.id),
                'full_name': lead.full_name,
                'phone_number': lead.phone_number,
                'email': lead.email,
                'wedding_location': lead.wedding_location,
                'wedding_date': lead.wedding_date,
                'wedding_type': lead.wedding_type,
                'guest_count': lead.guest_count,
                'budget_range_text': lead.budget_range_text,
                'required_services': lead.required_services,
                'additional_requirements': lead.additional_requirements,
                'lead_score': lead.lead_score,
                'qualification_level': lead.qualification_level,
                'lead_status': lead.lead_status,
                'assigned_to': lead.assigned_to.username if lead.assigned_to else None,
                'follow_up_at': lead.follow_up_at,
                'notes': [{'id': str(n.id), 'note': n.note, 'author': n.author.username if n.author else None, 'created_at': n.created_at} for n in lead.notes.all()]
            })
        elif request.method == 'PATCH':
            for field in ['lead_status', 'qualification_level', 'assigned_to', 'follow_up_at', 'lost_reason', 'consultation_outcome']:
                if field in request.data:
                    setattr(lead, field, request.data[field])
            lead.save()
            return Response({'message': 'Lead updated'})
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_lead_note(request, lead_id):
    try:
        lead = Lead.objects.get(id=lead_id)
        note = AdminNote.objects.create(
            lead=lead,
            author=request.user,
            note=request.data.get('note', '')
        )
        return Response({'message': 'Note added', 'id': str(note.id)}, status=status.HTTP_201_CREATED)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leads_list(request):
    leads = Lead.objects.all()
    
    status_filter = request.query_params.get('status')
    if status_filter:
        leads = leads.filter(lead_status=status_filter)
    
    qualification = request.query_params.get('qualification')
    if qualification:
        leads = leads.filter(qualification_level=qualification)
    
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(leads, request)
    
    results = [{
        'id': str(l.id),
        'full_name': l.full_name,
        'phone_number': l.phone_number,
        'wedding_location': l.wedding_location,
        'lead_score': l.lead_score,
        'qualification_level': l.qualification_level,
        'lead_status': l.lead_status,
        'created_at': l.created_at,
        'assigned_to': l.assigned_to.username if l.assigned_to else None
    } for l in page]
    
    return paginator.get_paginated_response(results)
