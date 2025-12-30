from django.apps import AppConfig


class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'

    def ready(self):
        # Crear grupos por defecto al iniciar la app
        from .permissions import create_default_groups
        create_default_groups()
