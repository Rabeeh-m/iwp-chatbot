from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import KnowledgeEntry


@api_view(['GET'])
@permission_classes([AllowAny])
def list_knowledge_public(request):
    entries = KnowledgeEntry.objects.filter(is_active=True)
    category = request.query_params.get('category')
    if category:
        entries = entries.filter(category=category)
    return Response([{
        'id': str(e.id),
        'title': e.title,
        'content': e.content,
        'category': e.category
    } for e in entries])


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_knowledge(request):
    if request.method == 'GET':
        entries = KnowledgeEntry.objects.all()
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(entries, request)
        results = [{
            'id': str(e.id),
            'title': e.title,
            'content': e.content,
            'category': e.category,
            'is_active': e.is_active,
            'created_at': e.created_at
        } for e in page]
        return paginator.get_paginated_response(results)
    elif request.method == 'POST':
        entry = KnowledgeEntry.objects.create(
            title=request.data.get('title', ''),
            content=request.data.get('content', ''),
            category=request.data.get('category', 'general'),
            keywords=request.data.get('keywords', []),
            is_active=request.data.get('is_active', True)
        )
        return Response({'id': str(entry.id), 'message': 'Created'}, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def knowledge_detail(request, entry_id):
    try:
        entry = KnowledgeEntry.objects.get(id=entry_id)
        if request.method == 'PATCH':
            for field in ['title', 'content', 'category', 'keywords', 'is_active']:
                if field in request.data:
                    setattr(entry, field, request.data[field])
            entry.save()
            return Response({'message': 'Updated'})
        elif request.method == 'DELETE':
            entry.delete()
            return Response({'message': 'Deleted'})
    except KnowledgeEntry.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
