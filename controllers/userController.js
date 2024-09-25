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
    const { role } = req.body;
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.role = role; 
        await user.save();

        return res.status(200).json({ message: 'Rol actualizado', user });
    } catch (error) {
        console.error('Error al actualizar el rol:', error); // Agrega este log
        return res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
    }
};






module.exports = {
    getUser,
    updateUserRole
};
