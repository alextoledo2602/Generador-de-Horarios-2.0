from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from base import views
from base.views import RegisterView, UserViewSet, CustomTokenObtainPairView, exportar_horario_pdf_playwright, exportar_horario_imagen_playwright

router = routers.DefaultRouter()
router.register(r'(?P<model_name>[^/.]+)', views.GenericModelViewSet, basename='generic')

admin_router = routers.DefaultRouter()
admin_router.register(r'users', UserViewSet, basename='user-admin')

urlpatterns = [
    path('api/v1/whoami/', views.whoami, name='whoami'),
    path('api/v1/calculate-balance/', views.calculate_balance, name='calculate_balance'),  # DEBE ir antes del router genérico
    path('api/v1/admin/', include(admin_router.urls)),  # Primero admin_router
    path('api/v1/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/exportar-pdf-playwright/<int:schedule_id>/', exportar_horario_pdf_playwright, name='exportar_horario_pdf_playwright'),
    path('api/exportar-imagen-playwright/<int:schedule_id>/', exportar_horario_imagen_playwright, name='exportar_horario_imagen_playwright'),
]
