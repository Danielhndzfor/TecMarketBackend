const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');

const protect = async (req, res, next) => {
    let token;

    // Revisamos si el token está en el header `Authorization` con formato `Bearer token`
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraemos el token eliminando la palabra 'Bearer'
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token con JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verificamos si el token es válido en la base de datos
            const storedToken = await Token.findOne({ token });
            if (!storedToken) {
                return res.status(401).json({ message: 'Invalid Token' });
            }

            // Buscamos al usuario excluyendo la contraseña
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Continuamos con la siguiente función
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Invalid Token' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
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


