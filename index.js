const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Importa la configuración de Multer
const upload = require('./middleware/multerConfig');

// Rutas
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const saleRoutes = require('./routes/saleRoutes');
const historyRoutes = require('./routes/historyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

// Cargar las variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Configuración de CORS
// Configura CORS
app.use(cors({
    origin: 'http://localhost:5173', // Cambia esto por el dominio de tu frontend
    credentials: true
}));

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sale', saleRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', upload.array('images', 5), productRoutes);  // Uso de Multer para imágenes
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', userRoutes);

// Ruta para servir las imágenes
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Middleware para manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
