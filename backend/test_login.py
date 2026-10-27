import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
os.environ['USE_SQLITE'] = 'True'
django.setup()

from django.contrib.auth.models import User
from django.test import Client

c = Client()
# Get CSRF
resp = c.get('/')
# Try login
resp = c.post('/api/v1/admin/auth/login/', {'username': 'admin', 'password': 'admin123'}, content_type='application/json')
print(resp.status_code)
print(resp.content)
