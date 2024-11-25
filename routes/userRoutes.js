const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { updateUserRole, updateUserToSeller, updateSellerToUser, getAllUsers, updateUser, countTotalUsers, countSellers, countBuyers, countUsersToday, countUsersThisWeek, countUsersThisMonth } = require('../controllers/userController');

// Ruta para obtener el usuario actual
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta para obtener todos los usuarios
router.get('/users', protect, getAllUsers);

// Ruta para actualizar un usuario
router.put('/update-user/:id', protect, updateUser); // Agregar middleware si es necesario

// Ruta para actualizar el rol del usuario
router.put('/update-role/:userId', protect, updateUserRole);

// Ruta para cambiar el rol a vendedor y agregar la CLABE interbancaria
router.post('/soy-vendedor', protect, updateUserToSeller)

// Ruta para cambiar el rol a comprador
router.post('/soy-comprador/:id', protect, updateSellerToUser);

// Ruta para contar el número de usuarios
router.get('/total', protect, countTotalUsers);

// Ruta para contar el número de vendedores
router.get('/sellers', protect, countSellers);

// Ruta para contar el número de compradores
router.get('/buyers', protect, countBuyers);

// Ruta para contar el número de usuarios registrados hoy
router.get('/today', protect, countUsersToday);

// Ruta para contar el número de usuarios registrados esta semana
router.get('/this-week', protect, countUsersThisWeek);

// Ruta para contar el número de usuarios registrados este mes
router.get('/this-month', protect, countUsersThisMonth);


module.exports = router;
