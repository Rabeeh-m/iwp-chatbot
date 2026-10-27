from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AuditLog


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs(request):
    logs = AuditLog.objects.all()[:50]
    return Response([{
        'id': str(l.id),
        'action': l.action,
        'entity_type': l.entity_type,
        'entity_id': l.entity_id,
        'administrator': l.administrator.username if l.administrator else None,
        'created_at': l.created_at
    } for l in logs])
