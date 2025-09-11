import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/prestamos');
        console.log('Base de datos mongoDB conectada', mongoose.connection.host);
    } catch (error) {
        console.error('Error al conectar a mongoDB', error.message);
        process.exit(1);
    }
}

export default connectDB;