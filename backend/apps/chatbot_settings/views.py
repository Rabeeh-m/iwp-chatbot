from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ChatbotConfiguration, ScoringConfig


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def settings(request):
    if request.method == 'GET':
        configs = ChatbotConfiguration.objects.all()
        config_dict = {c.configuration_key: c.configuration_value for c in configs}
        try:
            scoring = ScoringConfig.objects.first()
            if not scoring:
                scoring = ScoringConfig.objects.create()
        except:
            scoring = ScoringConfig.objects.create()
        return Response({
            'settings': config_dict,
            'scoring': {
                'wedding_date_points': scoring.wedding_date_points,
                'wedding_location_points': scoring.wedding_location_points,
                'budget_points': scoring.budget_points,
                'services_points': scoring.services_points,
                'guest_count_points': scoring.guest_count_points,
                'phone_points': scoring.phone_points,
                'consultation_request_points': scoring.consultation_request_points,
                'hot_threshold': scoring.hot_threshold,
                'warm_threshold': scoring.warm_threshold,
            }
        })
    elif request.method == 'PATCH':
        for key, value in request.data.get('settings', {}).items():
            ChatbotConfiguration.objects.update_or_create(
                configuration_key=key,
                defaults={'configuration_value': str(value), 'updated_by': request.user}
            )
        if 'scoring' in request.data:
            scoring_data = request.data['scoring']
            scoring, created = ScoringConfig.objects.get_or_create(id=ScoringConfig.objects.first().id if ScoringConfig.objects.exists() else None)
            if not created and ScoringConfig.objects.count() == 0:
                scoring = ScoringConfig.objects.create()
            for k, v in scoring_data.items():
                setattr(scoring, k, v)
            scoring.save()
        return Response({'message': 'Settings updated'})
