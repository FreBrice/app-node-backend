// Middleware global para manejo de errores
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }

    // Error de duplicado (documento único)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        
        return res.status(400).render('prestamo', {
            error: `Ya existe un préstamo con el ${field}: ${value}`,
            formData: req.body || {}
        });
    }

    // Error de cast (ID inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Formato de ID inválido'
        });
    }

    // Error por defecto
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Middleware para rutas no encontradas
export const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// Función auxiliar para manejo de errores en controladores
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};