const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { updateUserRole } = require('../controllers/userController');

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
router.put('/update-role/:userId', protect, updateUserRole);




module.exports = router;
