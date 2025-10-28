// 1. Requerir módulos
import express from "express";
import mongoose from 'mongoose';
import categoryRoutes from "./routes/routesCategory.js";
import productRoutes from "./routes/routesProduct.js";
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
// 🔹 CATEGORIA CRUDL
// ======================

app.use("/api/categoria",categoryRoutes);


// ======================
// 🔹 PRODUCTOS CRUDL
// ======================

app.use("/api/productos",productRoutes);
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
