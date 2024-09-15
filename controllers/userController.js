// controllers/userController.js

const User = require('../models/User');

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);  // `req.user` es el usuario autenticado
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verifica si el usuario que realiza la solicitud es un admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        // Actualiza el rol del usuario
        user.role = req.body.role;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUser,
    updateUserRole
};
