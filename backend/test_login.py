import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
os.environ['USE_SQLITE'] = 'True'
django.setup()

from django.test import Client

c = Client()
# Try login
resp = c.post('/api/v1/admin/auth/login/', {'username': 'admin', 'password': 'admin123'}, content_type='application/json')
print(resp.status_code)
print(resp.content)

token = resp.json().get('token')
me = c.get('/api/v1/admin/auth/me/', HTTP_AUTHORIZATION=f'Bearer {token}')
print(me.status_code)
print(me.content)
