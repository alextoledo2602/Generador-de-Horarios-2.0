import os
import django
from django.core.asgi import get_asgi_application

# Esta línea debe estar primero
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Inicializa Django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter

application = ProtocolTypeRouter({
    "http": get_asgi_application()
})