const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Asegúrate de importar jwt
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

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


// Ruta para actualizar el rol del usuario
router.put('/update-role/:userId', protect, async (req, res) => {  // Protege esta ruta para solo permitir cambios de rol con un token válido
    const { userId } = req.params;
    const { role } = req.body;

    // Validar que el rol es uno de los valores permitidos
    if (!['comprador', 'vendedor', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        // Generar un nuevo token con el nuevo rol
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Expiración del token
        });

        res.json({ message: 'User role updated successfully', token });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role' });
    }
});

module.exports = router;
