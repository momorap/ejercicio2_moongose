import express from "express";
const router = express.Router();
import  Category from '../models/Category.js';
// ======================
// 🔹 CATEGORÍAS
// ======================
router.post('/', async (req, res, next) => {
  try {
    const { name, description, parentCategory } = req.body;
    const nuevaCategoria = await Category.create({ name, description, parentCategory });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const categorias = await Category.find().populate('parentCategory', 'name');
    res.json(categorias);
  } catch (error) {
    next(error);
  }
});

// Eliminar una categoría por ID
router.delete('/:id', async (req, res, next) => {
  try {
    const categoria = await Category.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada correctamente', categoria });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const categoria = await Category.findById(req.params.id);
    if (!categoria) throw new Error('Categoria no encontrado');
    res.json(categoria);
  } catch (error) {
    error.status = 404;
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const categoria = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!categoria) throw new Error('Categoria no encontrado para actualizar');
    res.json({ message: 'Categoría actualizada correctamente', categoria });
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

export default router;