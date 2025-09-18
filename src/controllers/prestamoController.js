import Prestamo from '../models/Prestamo.js';
import { calcularPrestamo, calcularEstadisticas, validarDiaDuplicado } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Controlador para mostrar lista de préstamos
export const listarPrestamos = asyncHandler(async (req, res) => {
    const prestamos = await Prestamo.find()
        .sort({ fechaCreacion: -1 })
        .lean();
    
    console.log('Préstamos encontrados:', prestamos.length);
    res.render('index', { prestamos });
});

// Controlador para mostrar formulario de préstamo
export const mostrarFormularioPrestamo = (req, res) => {
    res.render('prestamo');
};

// Controlador para crear nuevo préstamo
export const crearPrestamo = asyncHandler(async (req, res) => {
    const { nombre, documento, monto, interes, dias } = req.body;

    // Verificar si ya existe un préstamo con el mismo documento
    const prestamoExistente = await Prestamo.findOne({ documento: documento.trim() });
    if (prestamoExistente) {
        return res.status(400).render('prestamo', {
            error: 'Ya existe un préstamo con este documento',
            formData: req.body
        });
    }

    // Calcular valores del préstamo
    const { total, cuotaDiaria } = calcularPrestamo(monto, interes, dias);

    // Crear y guardar nuevo préstamo
    const nuevoPrestamo = new Prestamo({
        nombre: nombre.trim(),
        documento: documento.trim(),
        monto: parseFloat(monto),
        interes: parseFloat(interes),
        dias: parseInt(dias),
        total,
        cuotaDiaria
    });

    await nuevoPrestamo.save();
    console.log('Nuevo préstamo creado:', nuevoPrestamo._id);

    // Respuesta simple para mantener compatibilidad con EJS actual
    res.send(`
        <h2>Préstamo registrado correctamente</h2>
        <p><strong>Cliente:</strong> ${nuevoPrestamo.nombre}</p>
        <p><strong>Documento:</strong> ${nuevoPrestamo.documento}</p>
        <p><strong>Monto:</strong> €${nuevoPrestamo.monto.toFixed(2)}</p>
        <p><strong>Total a pagar:</strong> €${nuevoPrestamo.total.toFixed(2)}</p>
        <p><strong>Cuota diaria:</strong> €${nuevoPrestamo.cuotaDiaria.toFixed(2)}</p>
        <div style="margin-top: 20px;">
            <a href="/registrar-pago/${nuevoPrestamo.documento}" style="background:#007BFF;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Registrar pagos</a>
            <a href="/" style="background:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;margin-left:10px;">Volver al inicio</a>
        </div>
    `);
});

// Controlador para mostrar formulario de registro de pago
export const mostrarFormularioPago = asyncHandler(async (req, res) => {
    const { documento } = req.params;
    
    const prestamo = await Prestamo.findOne({ documento }).lean();
    
    if (!prestamo) {
        return res.status(404).send(`
            <h2>Préstamo no encontrado</h2>
            <p>No se encontró un préstamo con el documento: ${documento}</p>
            <a href="/" style="background:#007BFF;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Volver al inicio</a>
        `);
    }

    // Calcular estadísticas del préstamo
    const estadisticas = calcularEstadisticas(prestamo);
    
    res.render('pagos', { 
        prestamo,
        estadisticas
    });
});

// Controlador para registrar nuevo pago
export const registrarPago = asyncHandler(async (req, res) => {
    const { documento } = req.params;
    const { dia, montoPagado } = req.body;
    
    const prestamo = await Prestamo.findOne({ documento });
    
    if (!prestamo) {
        return res.status(404).send(`
            <h2>Préstamo no encontrado</h2>
            <p>No se encontró un préstamo con el documento: ${documento}</p>
            <a href="/" style="background:#007BFF;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Volver al inicio</a>
        `);
    }

    const montoPagadoFloat = parseFloat(montoPagado);
    const diaInt = parseInt(dia);

    // Verificar que no se exceda el total del préstamo
    const totalPagado = prestamo.pagos.reduce((sum, pago) => sum + pago.montoPagado, 0);
    if (totalPagado + montoPagadoFloat > prestamo.total) {
        return res.status(400).render('pagos', {
            prestamo: prestamo.toObject(),
            error: `El monto pagado (€${montoPagadoFloat.toFixed(2)}) excede el saldo pendiente (€${(prestamo.total - totalPagado).toFixed(2)})`,
            formData: req.body,
            estadisticas: calcularEstadisticas(prestamo)
        });
    }

    // Verificar que no se repita el día
    if (validarDiaDuplicado(prestamo.pagos, diaInt)) {
        return res.status(400).render('pagos', {
            prestamo: prestamo.toObject(),
            error: `Ya existe un pago registrado para el día ${diaInt}`,
            formData: req.body,
            estadisticas: calcularEstadisticas(prestamo)
        });
    }

    // Agregar el pago
    prestamo.pagos.push({
        dia: diaInt,
        montoPagado: montoPagadoFloat,
        fecha: new Date()
    });

    await prestamo.save();
    console.log(`Pago registrado para documento ${documento}: €${montoPagadoFloat}`);

    // Calcular nuevas estadísticas después del pago
    const estadisticasActualizadas = calcularEstadisticas(prestamo);
    const estaCompleto = estadisticasActualizadas.estaCompleto;

    res.send(`
        <h2>Pago registrado exitosamente</h2>
        <div style="background:#e9f7ef;padding:15px;border-radius:5px;margin:20px 0;">
            <p><strong>Cliente:</strong> ${prestamo.nombre}</p>
            <p><strong>Día:</strong> ${diaInt}</p>
            <p><strong>Monto pagado:</strong> €${montoPagadoFloat.toFixed(2)}</p>
            <p><strong>Total pagado:</strong> €${estadisticasActualizadas.totalPagado.toFixed(2)}</p>
            <p><strong>Saldo pendiente:</strong> €${estadisticasActualizadas.saldoPendiente.toFixed(2)}</p>
            ${estaCompleto ? '<p style="color:green;font-weight:bold;">¡Préstamo completamente pagado! 🎉</p>' : ''}
        </div>
        <div style="margin-top: 20px;">
            ${!estaCompleto ? 
                `<a href="/registrar-pago/${prestamo.documento}" style="background:#007BFF;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Registrar otro pago</a>` : ''
            }
            <a href="/" style="background:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;margin-left:10px;">Ver todos los préstamos</a>
        </div>
    `);
});

// Controlador para ruta de respaldo de préstamos
export const redirigirPrestamos = (req, res) => {
    res.redirect('/');
};

// Controlador para formulario de pago genérico (sin préstamo específico)
export const mostrarFormularioPagoGenerico = (req, res) => {
    res.render('pagos', { 
        prestamo: null,
        estadisticas: null
    });
};