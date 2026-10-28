from django.urls import path
from . import views

urlpatterns = [
    path('admin/auth/login/', views.admin_login, name='admin_login'),
    path('admin/auth/logout/', views.admin_logout, name='admin_logout'),
    path('admin/auth/me/', views.admin_me, name='admin_me'),
    path('admin/auth/create-admin/', views.create_admin_setup, name='create_admin_setup'),
    path('admin/dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('admin/chat-logs/', views.chat_logs, name='chat_logs'),
    path('admin/chat-logs/<str:session_id>/', views.chat_log_detail, name='chat_log_detail'),
    path('admin/leads/', views.leads_list, name='leads_list'),
    path('admin/leads/<uuid:lead_id>/', views.lead_detail, name='lead_detail'),
    path('admin/leads/<uuid:lead_id>/notes/', views.add_lead_note, name='add_lead_note'),
]
