#!/bin/bash
# Script para instalar dependencias en Render

echo "🔧 Instalando dependencias de Python..."
pip install -r requirements.txt

echo "🎭 Instalando navegadores de Playwright..."
playwright install chromium

echo "📦 Instalando dependencias del sistema para Playwright..."
playwright install-deps chromium

echo "✅ Instalación completada"
