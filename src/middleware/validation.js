import { body, param, validationResult } from 'express-validator';

// Validaciones para préstamo
export const validatePrestamo = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('documento')
        .trim()
        .notEmpty()
        .withMessage('El documento es requerido')
        .isLength({ min: 5, max: 20 })
        .withMessage('El documento debe tener entre 5 y 20 caracteres')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('El documento solo puede contener letras y números'),
    
    body('monto')
        .isFloat({ gt: 0, max: 1000000 })
        .withMessage('El monto debe ser un número mayor a 0 y menor a 1,000,000'),
    
    body('interes')
        .isFloat({ min: 0, max: 100 })
        .withMessage('El interés debe estar entre 0 y 100'),
    
    body('dias')
        .isInt({ min: 1, max: 365 })
        .withMessage('Los días deben ser un número entero entre 1 y 365')
];

// Validaciones para pago
export const validatePago = [
    body('dia')
        .isInt({ min: 1 })
        .withMessage('El día debe ser un número entero mayor a 0'),
    
    body('montoPagado')
        .isFloat({ gt: 0 })
        .withMessage('El monto pagado debe ser mayor a 0')
];

// Validación de documento en parámetros
export const validateDocumento = [
    param('documento')
        .trim()
        .notEmpty()
        .withMessage('El documento es requerido')
        .isLength({ min: 5, max: 20 })
        .withMessage('Documento inválido')
];

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Para rutas de renderizado, devolver a la vista con errores
        if (req.route && req.route.path.includes('prestamo')) {
            return res.status(400).render('prestamo', {
                errors: errors.array(),
                formData: req.body
            });
        }
        
        // Para rutas de pago, devolver a la vista con errores
        if (req.route && req.route.path.includes('pago')) {
            return res.status(400).render('pagos', {
                errors: errors.array(),
                formData: req.body
            });
        }
        
        // Para API, devolver JSON
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    
    next();
};