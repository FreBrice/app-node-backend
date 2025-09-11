import express from "express";
import morgan from "morgan";
//método de node para leer rutas absolutas
import {dirname, join} from 'path'
import { fileURLToPath } from "url";


import indexRoutes from './routes/index.js'
import connectDB from "./config/dataBase.js";

const app = express()
//ruta absoluta 
const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(__dirname, 'views')
app.set('views', join(__dirname, 'views'))
//configuracion para el puerto
app.set('port', process.env.PORT || 3000);
//método para ingresar HTML al servidor 
app.set('view engine', 'ejs')

//conectar a la base de datos
connectDB(); 

// Middleware para leer datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.json());

//index routes
app.use('/', indexRoutes)

app.listen(app.get('port'), () =>{
  console.log('servidor corriendo en puerto', app.get('port'));
})
