#!/bin/bash

echo "🚀 Iniciando configuración de FLOC..."

# Create main project directory
echo "📁 Creando estructura de directorios..."
mkdir -p floc
cd floc

# Backend setup
echo "🐍 Configurando Backend..."
mkdir -p backend
cd backend

# Create requirements.txt
echo "📝 Creando requirements.txt..."
cat > requirements.txt << EOL
Flask==3.0.0
Flask-JWT-Extended==4.5.3
Flask-SQLAlchemy==3.1.1
Flask-Cors==4.0.0
python-dotenv==1.0.0
pycryptodome==3.19.0
gunicorn==21.2.0
EOL

# Setup Python virtual environment
echo "🔧 Configurando entorno virtual Python..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Return to root directory
cd ..

# Frontend setup
echo "⚛️ Configurando Frontend..."
mkdir -p frontend
cd frontend

# Create package.json with all necessary dependencies
echo "📝 Creando package.json..."
cat > package.json << EOL
{
  "name": "floc-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@tailwindcss/forms": "^0.5.7",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "clsx": "^2.0.0",
    "jose": "^5.1.3"
  }
}
EOL

# Install dependencies
echo "📦 Instalando dependencias de Node.js..."
npm install

# Create frontend directory structure
echo "📁 Creando estructura de archivos Frontend..."
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/dashboard
mkdir -p src/components/ui
mkdir -p src/lib

# Create necessary config files
echo "⚙️ Creando archivos de configuración..."
cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create .env.local
echo "⚙️ Configurando variables de entorno..."
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

cd ..

echo "✅ Configuración completada."
echo ""
echo "Para iniciar la aplicación:"
echo "1. Terminal Backend (desde la raíz del proyecto):"
echo "   cd backend && source venv/bin/activate && python app.py"
echo ""
echo "2. Terminal Frontend (desde la raíz del proyecto):"
echo "   cd frontend && npm run dev" 