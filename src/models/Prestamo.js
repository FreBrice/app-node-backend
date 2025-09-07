import mongoose from "mongoose";

//definir esquema del préstamo
const PrestamoSchema = new mongoose.Schema({
    documento:{type: String, required: true, unique: true},
    nombre:{type: String, required: true},
    monto:{type: Number, required: true},
    interes:{type: Number, required: true},
    dias:{type: Number, required: true},
    total:{type: Number, required: true},
    cuotaDiaria:{type: Number, required: true},
    fechaCreacion:{type: Number, required: true},
    pagos:[
        {
            dia: Number,
            montoPagado: Number,
            fecha: { type: Date, default: Date.now}
        }
    ]
});
console.log(PrestamoSchema)
export default mongoose.model("prestamo", PrestamoSchema);