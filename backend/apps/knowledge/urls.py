from django.urls import path
from . import views

urlpatterns = [
    path('knowledge/', views.list_knowledge_public, name='knowledge_public'),
    path('admin/knowledge/', views.manage_knowledge, name='manage_knowledge'),
    path('admin/knowledge/<uuid:entry_id>/', views.knowledge_detail, name='knowledge_detail'),
]
