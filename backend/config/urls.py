from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/chat/', include('apps.chat.urls')),
    path('api/v1/', include('apps.leads.urls')),
    path('api/v1/', include('apps.knowledge.urls')),
    path('api/v1/admin/', include('apps.chatbot_settings.urls')),
    path('api/v1/admin/', include('apps.audit.urls')),
]
