from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.create_session, name='create_session'),
    path('sessions/<str:session_id>/', views.get_session, name='get_session'),
    path('sessions/<str:session_id>/messages/', views.send_message, name='send_message'),
    path('sessions/<str:session_id>/end/', views.end_session, name='end_session'),
    path('sessions/<str:session_id>/history/', views.get_history, name='get_history'),
    path('sessions/<str:session_id>/consent/', views.consent, name='consent'),
]
