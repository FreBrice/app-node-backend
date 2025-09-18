// Funciones auxiliares para cálculos de préstamos

/**
 * Calcula el total y cuota diaria de un préstamo
 * @param {number} monto - Monto principal del préstamo
 * @param {number} interes - Porcentaje de interés
 * @param {number} dias - Número de días del préstamo
 * @returns {Object} - Objeto con total y cuotaDiaria
 */
export const calcularPrestamo = (monto, interes, dias) => {
    const montoFloat = parseFloat(monto);
    const interesFloat = parseFloat(interes);
    const diasInt = parseInt(dias);
    
    if (montoFloat <= 0 || interesFloat < 0 || diasInt <= 0) {
        throw new Error('Valores inválidos para el cálculo');
    }
    
    const total = montoFloat + (montoFloat * interesFloat / 100);
    const cuotaDiaria = total / diasInt;
    
    return {
        total: Math.round(total * 100) / 100,
        cuotaDiaria: Math.round(cuotaDiaria * 100) / 100
    };
};

/**
 * Calcula estadísticas de un préstamo
 * @param {Object} prestamo - Objeto préstamo de MongoDB
 * @returns {Object} - Estadísticas calculadas
 */
export const calcularEstadisticas = (prestamo) => {
    const totalPagado = prestamo.pagos.reduce((sum, pago) => sum + pago.montoPagado, 0);
    const saldoPendiente = prestamo.total - totalPagado;
    const diasPagados = prestamo.pagos.length;
    const diasPendientes = prestamo.dias - diasPagados;
    const porcentajePagado = (totalPagado / prestamo.total) * 100;
    
    return {
        totalPagado: Math.round(totalPagado * 100) / 100,
        saldoPendiente: Math.round(saldoPendiente * 100) / 100,
        diasPagados,
        diasPendientes,
        porcentajePagado: Math.round(porcentajePagado * 100) / 100,
        estaCompleto: totalPagado >= prestamo.total
    };
};

/**
 * Formatea números a moneda
 * @param {number} valor - Valor a formatear
 * @param {string} moneda - Código de moneda (default: EUR)
 * @returns {string} - Valor formateado
 */
export const formatearMoneda = (valor, moneda = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: moneda
    }).format(valor);
};

/**
 * Formatea fecha a string legible
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Valida si un día de pago ya existe
 * @param {Array} pagos - Array de pagos existentes
 * @param {number} dia - Día a validar
 * @returns {boolean} - True si el día ya existe
 */
export const validarDiaDuplicado = (pagos, dia) => {
    return pagos.some(pago => pago.dia === parseInt(dia));
};

/**
 * Calcula el cronograma de pagos ideal
 * @param {number} total - Total del préstamo
 * @param {number} dias - Días del préstamo
 * @param {number} cuotaDiaria - Cuota diaria
 * @returns {Array} - Array con cronograma
 */
export const generarCronograma = (total, dias, cuotaDiaria) => {
    const cronograma = [];
    let saldoPendiente = total;
    
    for (let dia = 1; dia <= dias; dia++) {
        const pago = dia === dias ? saldoPendiente : cuotaDiaria;
        saldoPendiente -= pago;
        
        cronograma.push({
            dia,
            cuotaEsperada: Math.round(pago * 100) / 100,
            saldoDespues: Math.round(saldoPendiente * 100) / 100
        });
    }
    
    return cronograma;
};