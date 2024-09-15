const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    registerUser,
    authUser,
    logoutUser
} = require('../controllers/authController'); // Asegúrate de que el archivo sea correcto

// Ruta para el login
router.post('/login', authUser); // Usa la función `authUser` del controlador

// Ruta para el registro
router.post('/register', registerUser); // Usa la función `registerUser` del controlador

// Ruta para obtener los datos del usuario autenticado
router.get('/me', protect, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta para cerrar sesión
router.post('/logout', logoutUser); // Usa la función `logoutUser` del controlador

module.exports = router;



