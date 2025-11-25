# Guía de Despliegue en Render

## Configuración del Backend en Render

### 1. Crear un nuevo Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub

### 2. Configuración del Servicio

**Build & Deploy:**
- **Build Command:** `chmod +x render-install.sh && ./render-install.sh`
- **Start Command:** `gunicorn backend.wsgi:application`

**Environment:**
- **Python Version:** `3.12.0` (configurado en `runtime.txt`)

### 3. Variables de Entorno

Configura las siguientes variables de entorno en Render:

```
SECRET_KEY=<tu-secret-key-segura>
DEBUG=False
DATABASE_URL=<postgresql-url-de-render>
ALLOWED_HOSTS=<tu-dominio>.onrender.com
CORS_ALLOWED_ORIGINS=<url-frontend>
```

### 4. Base de Datos PostgreSQL

1. Crea una nueva base de datos PostgreSQL en Render
2. Copia la URL de conexión interna
3. Agrégala como variable de entorno `DATABASE_URL`

### 5. Despliegue

El despliegue se ejecutará automáticamente cuando:
- Hagas push a la rama `main`
- O manualmente desde el dashboard de Render

## Notas Importantes

- El script `render-install.sh` maneja la instalación de dependencias, Playwright, migraciones y archivos estáticos
- Playwright se instala sin dependencias del sistema para evitar problemas de permisos
- Si necesitas generar PDFs, asegúrate de que el plan de Render tenga suficientes recursos

## Solución de Problemas

### Error: "playwright: command not found"
- Verifica que `playwright` esté en `requirements.txt`
- Revisa los logs del build para asegurarte de que se instaló correctamente

### Error: "gunicorn: command not found"
- Verifica que `gunicorn` esté en `requirements.txt`
- Asegúrate de que el script `render-install.sh` no esté vacío

### Problemas con PDFs
- Playwright puede tener problemas con las dependencias del sistema en el plan gratuito
- Considera usar un plan pagado o alternativas como WeasyPrint
