import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prestamos';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`);
        // Manejo de eventos de conexión
        mongoose.connection.on('error', (err) => {
            console.error('❌ Error de MongoDB:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB desconectado');
        });
        
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

// Cerrar conexión cuando la app se cierre
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔒 Conexión a MongoDB cerrada');
    process.exit(0);
});

export default connectDB;