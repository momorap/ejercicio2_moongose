import express from "express";
const router = express.Router();
import Product from '../models/Product.js';
// Crear producto
router.post('/', async (req, res, next) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

// Listar productos con filtros, paginación, búsqueda y sort
router.get('/', async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, sortBy = 'price', order = 'asc', page = 1, limit = 10 } = req.query;
    const filtro = {};

    if (search) filtro.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice)
      filtro.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };

    const productos = await Product.find(filtro)
      .populate('category', 'name')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filtro);
    res.json({ total, page: Number(page), limit: Number(limit), productos });
  } catch (error) {
    next(error);
  }
});

// Obtener por ID
router.get('/:id', async (req, res, next) => {
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
router.put('/:id', async (req, res, next) => {
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
router.delete('/:id', async (req, res, next) => {
  try {
    const eliminado = await Product.findByIdAndDelete(req.params.id);
    if (!eliminado) throw new Error('Producto no encontrado');
    res.json({ mensaje: 'Eliminado con éxito', eliminado });
  } catch (error) {
    next(error);
  }
});


export default router;