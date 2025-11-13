# Guía de Despliegue en Render

## Problemas Resueltos

### 1. Exportación de PDF e Imágenes
**Problema**: Las funciones de exportación no funcionaban en Render porque:
- Faltaba PyMuPDF para convertir PDF a imagen
- Los navegadores de Playwright no estaban instalados

**Solución implementada**:
- ✅ Agregado `pymupdf==1.24.0` al `requirements.txt`
- ✅ Creado script `render-install.sh` que instala navegadores de Playwright
- ✅ Agregados logs detallados para debugging

## Configuración Necesaria en Render

### Backend (Web Service)

1. **Build Command**: 
   ```bash
   chmod +x render-install.sh && ./render-install.sh
   ```
   
2. **Start Command**:
   ```bash
   gunicorn backend.wsgi:application
   ```

3. **Environment Variables** (ya configuradas):
   - `DATABASE_URL` - PostgreSQL connection
   - `DJANGO_SUPERUSER_USERNAME`
   - `DJANGO_SUPERUSER_PASSWORD`
   - `DJANGO_SUPERUSER_EMAIL`
   - `SECRET_KEY`
   - `CORS_ALLOWED_ORIGINS`
   - `IS_PRODUCTION=True`

### Frontend (Static Site)

1. **Build Command**:
   ```bash
   npm install && npm run build
   ```

2. **Publish Directory**:
   ```
   dist
   ```

3. **Environment Variables**:
   - `VITE_API_URL=https://generador-de-horarios-backend.onrender.com`

## ¿Qué hace render-install.sh?

El script realiza 3 pasos críticos:

1. **Instala dependencias de Python** (`pip install -r requirements.txt`)
   - Incluye Django, Playwright, PyMuPDF, etc.

2. **Instala el navegador Chromium** (`playwright install chromium`)
   - Playwright SOLO instala el paquete Python, NO los navegadores
   - Este comando descarga Chromium (~150MB)

3. **Instala dependencias del sistema** (`playwright install-deps chromium`)
   - Instala librerías del sistema necesarias para Chromium (libfonts, etc.)

## Verificación

Después del despliegue, las exportaciones deberían funcionar:

### PDF Export
```
https://generador-de-horarios-backend.onrender.com/tasks/api/exportar-pdf-playwright/{schedule_id}/
```

### Imagen Export  
```
https://generador-de-horarios-backend.onrender.com/tasks/api/exportar-imagen-playwright/{schedule_id}/
```

Los logs en Render mostrarán:
```
===== EXPORTAR PDF: Schedule ID X =====
✅ Contexto construido exitosamente
✅ HTML renderizado exitosamente
🎭 Iniciando Playwright...
✅ PDF generado exitosamente
===== PDF EXPORTADO EXITOSAMENTE =====
```

## Nota Importante

Si Render muestra error al ejecutar `render-install.sh`, asegúrate de que:
1. El archivo tiene permisos de ejecución (`chmod +x`)
2. Usa formato Unix (LF, no CRLF)
3. La primera línea es exactamente `#!/bin/bash`

## Cambios Aplicados en este Commit

- ✅ Agregado PyMuPDF al requirements.txt
- ✅ Creado render-install.sh con instalación completa de Playwright
- ✅ Mejorado manejo de errores en views.py (funciones de exportación)
- ✅ Agregados logs detallados para debugging
