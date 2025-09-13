import {Router}from 'express'
import Prestamo from '../models/Prestamo.js'


const router = Router()
const prestamos = [];
//función para enviar un renderizado al frontend 
//añadimos función que renderizar los prestamos registrados en la base de datos
router.get('/', async (req, res) => {
  try {
    const prestamos = await Prestamo.find().sort({ fechaCreacion: -1 });
    console.log('Préstamos encontrados', prestamos);
    res.render('index', { prestamos });
  } catch (error) {
    console.error('Error al obtener préstamos', error);
    res.status(500).send("Error al cargar los préstamos");
  }
})

//formulario 1
router.get('/prestamo', (req, res) => res.render('prestamo'))

// 👉 Ruta POST: recibe los datos y guarda en MongoDB
router.post("/guardar-prestamo", async (req, res) => {
  try {
    const { nombre, documento, monto, interes, dias } = req.body;

    const total = parseFloat(monto) + (monto * interes / 100);
    const cuotaDiaria = total / dias;

    // Crear y guardar en MongoDB
    const nuevoPrestamo = new Prestamo({
      nombre,
      documento,
      monto,
      interes,
      dias,
      total,
      cuotaDiaria
    });

    await nuevoPrestamo.save();

    res.send(`<h2>Préstamo registrado correctamente</h2>
              <p><a href="/registrar-pago/${documento}">Registrar pagos</a></p>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al guardar préstamo");
  }
});

// 👉 Ruta GET: formulario para registrar pagos
router.get("/registrar-pago/:documento", async (req, res) => {
  const prestamo = await Prestamo.findOne({ documento: req.params.documento });
  if (!prestamo) return res.status(404).send("Préstamo no encontrado");
  res.render("pagos", { prestamo });
});

// 👉 Ruta POST: guardar pago en el préstamo
router.post("/registrar-pago/:documento", async (req, res) => {
  try {
    const prestamo = await Prestamo.findOne({ documento: req.params.documento });
    if (!prestamo) return res.status(404).send("Préstamo no encontrado");

    const { dia, montoPagado } = req.body;
    prestamo.pagos.push({ dia, montoPagado });
    await prestamo.save();

    res.send(`<h2>Pago registrado</h2>
              <p><a href="/registrar-pago/${prestamo.documento}">Registrar otro pago</a></p>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al registrar pago");
  }
});

// Ruta para ver todos los préstamos
router.get("/prestamos", async (req, res) => {
  try {
    const prestamos = await Prestamo.find().sort({ fechaCreacion: -1 });
    res.render("index", { prestamos });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cargar los préstamos");
  }
});

//formulario 2
router.get('/pago', (req, res) => res.render('pagos'))



export default router
