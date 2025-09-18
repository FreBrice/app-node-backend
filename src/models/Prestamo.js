import mongoose from "mongoose";

const PrestamoSchema = new mongoose.Schema({
    documento: {
        type: String, 
        required: [true, 'El documento es requerido'],
        unique: true,
        trim: true,
        minlength: [5, 'El documento debe tener al menos 5 caracteres']
    },
    nombre: {
        type: String, 
        required: [true, 'El nombre es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    monto: {
        type: Number, 
        required: [true, 'El monto es requerido'],
        min: [0, 'El monto debe ser mayor a 0']
    },
    interes: {
        type: Number, 
        required: [true, 'El interés es requerido'],
        min: [0, 'El interés no puede ser negativo'],
        max: [100, 'El interés no puede ser mayor a 100%']
    },
    dias: {
        type: Number, 
        required: [true, 'Los días son requeridos'],
        min: [1, 'Debe ser al menos 1 día']
    },
    total: {
        type: Number, 
        required: true,
        min: [0, 'El total debe ser mayor a 0']
    },
    cuotaDiaria: {
        type: Number, 
        required: true,
        min: [0, 'La cuota diaria debe ser mayor a 0']
    },
    fechaCreacion: {
        type: Date, 
        default: Date.now,
        required: true
    },
    pagos: [{
        dia: {
            type: Number,
            required: [true, 'El día es requerido'],
            min: [1, 'El día debe ser mayor a 0']
        },
        montoPagado: {
            type: Number,
            required: [true, 'El monto pagado es requerido'],
            min: [0, 'El monto pagado debe ser mayor a 0']
        },
        fecha: { 
            type: Date, 
            default: Date.now 
        }
    }],
    estado: {
        type: String,
        enum: ['activo', 'pagado', 'vencido'],
        default: 'activo'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
PrestamoSchema.index({ documento: 1 });
PrestamoSchema.index({ fechaCreacion: -1 });
PrestamoSchema.index({ estado: 1 });

// Virtual para calcular total pagado
PrestamoSchema.virtual('totalPagado').get(function() {
    return this.pagos.reduce((sum, pago) => sum + pago.montoPagado, 0);
});

// Virtual para calcular saldo pendiente
PrestamoSchema.virtual('saldoPendiente').get(function() {
    return this.total - this.totalPagado;
});

// Virtual para calcular días pagados
PrestamoSchema.virtual('diasPagados').get(function() {
    return this.pagos.length;
});

// Virtual para calcular días pendientes
PrestamoSchema.virtual('diasPendientes').get(function() {
    return this.dias - this.diasPagados;
});

// Método para verificar si el préstamo está completamente pagado
PrestamoSchema.methods.isCompleted = function() {
    return this.totalPagado >= this.total;
};

// Método para obtener el progreso del pago
PrestamoSchema.methods.getProgress = function() {
    return Math.min((this.totalPagado / this.total) * 100, 100);
};

// Middleware pre-save para actualizar estado
PrestamoSchema.pre('save', function(next) {
    if (this.isCompleted()) {
        this.estado = 'pagado';
    }
    next();
});

export default mongoose.model("Prestamo", PrestamoSchema);