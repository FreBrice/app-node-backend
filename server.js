import app from './src/app.js';
import connectDB from './src/config/database.js';

// Configuración del puerto
const PORT = process.env.PORT || 4000;

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('🚀 ========================================');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 URL local: http://localhost:${PORT}`);
            console.log('🚀 ========================================');
            console.log('📋 Rutas disponibles:');
            console.log('📋   GET  /                    - Lista de préstamos');
            console.log('📋   GET  /prestamo           - Nuevo préstamo');
            console.log('📋   POST /guardar-prestamo   - Guardar préstamo');
            console.log('📋   GET  /registrar-pago/:id - Registrar pago');
            console.log('📋   GET  /pago               - Formulario pago');
            console.log('📋   GET  /health             - Estado del servidor');
            console.log('📋   GET  /info               - Información de la API');
            console.log('🚀 ========================================');
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Iniciar el servidor
startServer();