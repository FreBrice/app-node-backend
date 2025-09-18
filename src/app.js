import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas y middleware
import prestamoRoutes from './routes/prestamoRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Configurar dotenv
dotenv.config();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔧 CONFIGURACIÓN BÁSICA
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 🌐 MIDDLEWARES GLOBALES
// CORS - configuración básica
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Parser de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Headers de seguridad básicos
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// 🛣️ RUTAS
app.use('/', prestamoRoutes);

// 🏥 SALUD DE LA APLICACIÓN
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});

// 📊 RUTA DE INFORMACIÓN (útil para debugging)
app.get('/info', (req, res) => {
    res.json({
        app: 'Sistema de Gestión de Préstamos',
        version: '1.0.0',
        author: 'FreBrice',
        description: 'Backend para gestión de préstamos con Node.js y MongoDB',
        endpoints: {
            'GET /': 'Lista todos los préstamos',
            'GET /prestamo': 'Formulario para crear préstamo',
            'POST /guardar-prestamo': 'Crear nuevo préstamo',
            'GET /registrar-pago/:documento': 'Formulario para registrar pago',
            'POST /registrar-pago/:documento': 'Registrar nuevo pago',
            'GET /pago': 'Formulario de pago genérico',
            'GET /health': 'Estado de la aplicación'
        }
    });
});

// ❌ MANEJO DE ERRORES
// Middleware para rutas no encontradas
app.use(notFound);

// Middleware global de manejo de errores
app.use(errorHandler);

export default app;