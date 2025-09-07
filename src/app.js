import express from "express";
//método de node para leer rutas absolutas
import {dirname, join} from 'path'
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import indexRoutes from './routes/index.js'

const app = express()
const PORT = 3000

//ruta absoluta 
const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(__dirname, 'views')
app.set('views', join(__dirname, 'views'))

//método para ingresar HTML al servidor 
app.set('view engine', 'ejs')

// Conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/prestamosDB")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error en conexión:", err));

// Middleware para leer datos de formularios
app.use(express.urlencoded({ extended: true }));


//index routes
app.use(indexRoutes)

app.listen(PORT)
console.log(`server on port ${PORT}`)