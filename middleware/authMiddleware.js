const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');

const protect = async (req, res, next) => {
    // Solo buscamos el token en el header Authorization
    let token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar que el token existe en la base de datos
        const storedToken = await Token.findOne({ token });
        if (!storedToken) return res.status(401).json({ message: 'Invalid Token' });

        // Obtener el usuario y excluir la contraseña
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'User not found' });

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token' });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized for this action' });
        }
    };
};

module.exports = { protect, authorizeRole };


