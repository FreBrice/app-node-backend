import { Router } from 'express';
import {
    listarPrestamos,
    mostrarFormularioPrestamo,
    crearPrestamo,
    mostrarFormularioPago,
    registrarPago,
    redirigirPrestamos,
    mostrarFormularioPagoGenerico
} from '../controllers/prestamoController.js';
import {
    validatePrestamo,
    validatePago,
    validateDocumento,
    handleValidationErrors
} from '../middleware/validation.js';

const router = Router();

// 🏠 RUTAS PRINCIPALES
// Ruta principal - Lista todos los préstamos
router.get('/', listarPrestamos);

// 💰 RUTAS DE PRÉSTAMOS
// Mostrar formulario para crear préstamo
router.get('/prestamo', mostrarFormularioPrestamo);

// Crear nuevo préstamo
router.post('/guardar-prestamo', 
    validatePrestamo, 
    handleValidationErrors, 
    crearPrestamo
);

// 💳 RUTAS DE PAGOS
// Mostrar formulario para registrar pagos (con préstamo específico)
router.get('/registrar-pago/:documento', 
    validateDocumento, 
    handleValidationErrors, 
    mostrarFormularioPago
);

// Registrar nuevo pago
router.post('/registrar-pago/:documento', 
    validateDocumento,
    validatePago,
    handleValidationErrors,
    registrarPago
);

// Formulario de pago genérico (sin préstamo específico)
router.get('/pago', mostrarFormularioPagoGenerico);

// 🔄 RUTAS DE COMPATIBILIDAD
// Ruta de respaldo para /prestamos -> redirige a /
router.get('/prestamos', redirigirPrestamos);

export default router;