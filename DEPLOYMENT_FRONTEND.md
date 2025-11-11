# 🚀 INSTRUCCIONES PARA DESPLEGAR EL FRONTEND EN RENDER

## PASO 1: Crear Static Site en Render

1. Ve a tu Dashboard de Render: https://dashboard.render.com/
2. Haz clic en **"New +"** → Selecciona **"Static Site"**

## PASO 2: Conectar el Repositorio

1. Conecta tu repositorio de GitHub: **ManuelAlex18/Generador-de-Horarios-2.0**
2. Render detectará automáticamente el repositorio

## PASO 3: Configuración del Static Site

### **Name (Nombre del servicio)**
```
generador-de-horarios-frontend
```
(O el nombre que prefieras)

### **Branch (Rama)**
```
main
```

### **Root Directory (Directorio raíz)**
```
frontend
```
⚠️ **MUY IMPORTANTE**: Esto le dice a Render que el código del frontend está en la carpeta `frontend/`

### **Build Command (Comando de compilación)**
```
npm install && npm run build
```
Este comando:
- Instala todas las dependencias de Node.js
- Compila el proyecto de React/Vite para producción

### **Publish Directory (Directorio de publicación)**
```
dist
```
Este es el directorio donde Vite coloca los archivos compilados

## PASO 4: Environment Variables (Variables de entorno)

⚠️ **NO necesitas agregar variables de entorno en Render** porque:
- El archivo `.env.production` ya contiene `VITE_API_URL`
- Vite usa este archivo automáticamente en el build de producción

## PASO 5: Create Static Site

1. Revisa que toda la configuración esté correcta
2. Haz clic en **"Create Static Site"**
3. Render comenzará a:
   - Clonar tu repositorio
   - Ejecutar `npm install && npm run build`
   - Desplegar los archivos estáticos

⏱️ El proceso tarda **2-5 minutos aproximadamente**

## PASO 6: Obtener la URL del Frontend

Una vez desplegado, Render te dará una URL como:
```
https://generador-de-horarios-frontend.onrender.com
```

## PASO 7: Actualizar CORS en el Backend

Después de obtener la URL del frontend:

1. Ve a tu servicio de **Backend** en Render
2. Ve a **"Environment"** (en el menú lateral)
3. Busca la variable `CORS_ALLOWED_ORIGINS`
4. Actualízala para incluir la URL del frontend:
   ```
   http://localhost:5173,https://generador-de-horarios-frontend.onrender.com
   ```
5. Guarda los cambios
6. Render **redesplegará automáticamente** el backend

## PASO 8: Verificar el Deployment

1. Abre la URL de tu frontend en el navegador
2. Intenta hacer login o usar la aplicación
3. Verifica que se comunique correctamente con el backend

---

## 🔧 TROUBLESHOOTING

### Si el build falla:

**Error: "Cannot find module"**
- Solución: Verifica que `package.json` esté en la carpeta `frontend/`
- Verifica que el Root Directory sea `frontend`

**Error: "Build command failed"**
- Solución: Prueba el build localmente:
  ```bash
  cd frontend
  npm install
  npm run build
  ```

### Si el frontend carga pero no se conecta al backend:

**Error: "CORS policy error"**
- Solución: Verifica que agregaste la URL del frontend en `CORS_ALLOWED_ORIGINS` del backend
- Verifica que la URL no tenga barra al final (/) 

**Error: "Network Error" o "Failed to fetch"**
- Solución: Verifica que `.env.production` tenga la URL correcta del backend
- Asegúrate de hacer commit y push del archivo `.env.production`

---

## ✅ CHECKLIST

Antes de crear el Static Site, verifica:

- [ ] `.env.production` tiene la URL correcta del backend
- [ ] Hiciste commit y push de `.env.production` a GitHub
- [ ] El backend está funcionando correctamente en Render
- [ ] Root Directory configurado como `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

Después de desplegar:

- [ ] Obtuviste la URL del frontend
- [ ] Actualizaste `CORS_ALLOWED_ORIGINS` en el backend
- [ ] El frontend carga correctamente
- [ ] Puedes hacer login y usar la aplicación

---

## 📝 NOTAS IMPORTANTES

1. **Free Tier de Render para Static Sites**:
   - 100 GB de ancho de banda por mes
   - Builds ilimitados
   - HTTPS automático
   - No se "duerme" como los servicios web

2. **Actualizaciones**:
   - Cada vez que hagas push a GitHub, Render redesplega automáticamente
   - El frontend usa los archivos `.env.production` en el build

3. **URLs**:
   - Backend: https://generador-de-horarios-backend.onrender.com
   - Frontend: https://generador-de-horarios-frontend.onrender.com (después de desplegar)

---

¡Buena suerte! 🚀
