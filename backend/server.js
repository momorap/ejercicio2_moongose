// 1. Requerir módulos
import express from 'express';
import mongoose from 'mongoose';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';

// 2. Crear app
const app = express();

// 3. Puerto y conexión
const PORT = process.env.PORT || 4000;
const DB_URI = 'mongodb+srv://belenasons_db_user:clase-27-10@clase-27-10.w5qns2w.mongodb.net/?appName=Clase-27-10';

// Middleware
app.use(express.json());

// 4. Conexión a BD
const conectarDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// ======================
// 🔹 CATEGORÍAS
// ======================
app.post('/api/categorias', async (req, res, next) => {
  try {
    const { name, description, parentCategory } = req.body;
    const nuevaCategoria = await Category.create({ name, description, parentCategory });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

app.get('/api/categorias', async (req, res, next) => {
  try {
    const categorias = await Category.find().populate('parentCategory', 'name');
    res.json(categorias);
  } catch (error) {
    next(error);
  }
});

// ======================
// 🔹 PRODUCTOS CRUDL
// ======================

// Crear producto
app.post('/api/productos', async (req, res, next) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

// Listar productos con filtros, paginación, búsqueda y sort
app.get('/api/productos', async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, sortBy = 'price', order = 'asc', page = 1, limit = 10 } = req.query;
    const filtro = {};

    if (search) filtro.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice)
      filtro.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };

    const productos = await Producto.find(filtro)
      .populate('category', 'name')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Producto.countDocuments(filtro);
    res.json({ total, page: Number(page), limit: Number(limit), productos });
  } catch (error) {
    next(error);
  }
});

// Obtener por ID
app.get('/api/productos/:id', async (req, res, next) => {
  try {
    const producto = await Product.findById(req.params.id).populate('category', 'name');
    if (!producto) throw new Error('Producto no encontrado');
    res.json(producto);
  } catch (error) {
    error.status = 404;
    next(error);
  }
});

// Actualizar
app.put('/api/productos/:id', async (req, res, next) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!producto) throw new Error('Producto no encontrado para actualizar');
    res.json(producto);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

// Eliminar (físico)
app.delete('/api/productos/:id', async (req, res, next) => {
  try {
    const eliminado = await Product.findByIdAndDelete(req.params.id);
    if (!eliminado) throw new Error('Producto no encontrado');
    res.json({ mensaje: 'Eliminado con éxito', eliminado });
  } catch (error) {
    next(error);
  }
});

// ======================
// 🔹 ERROR HANDLING
// ======================
app.use((req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: { message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined },
  });
});

// ======================
// 🔹 INICIO DEL SERVIDOR
// ======================
conectarDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
});
