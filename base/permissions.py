from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Group


class IsAdminUserCustom(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='administrador').exists()

# Permiso: solo planificador (grupo planificador)
class IsPlannerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='planificador').exists()

# Permiso: solo lectura para usuarios comunes, acceso total para admin/planificador
class ReadOnlyOrAdminOrPlanner(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.user.groups.filter(name__in=['administrador', 'planificador']).exists():
            return True
        return False

# Función para crear los grupos si no existen (llamar desde ready() en apps.py)
def create_default_groups():
    for group_name in ['administrador', 'planificador']:
        Group.objects.get_or_create(name=group_name)
