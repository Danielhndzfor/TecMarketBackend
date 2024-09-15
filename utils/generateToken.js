const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,  // Incluye el rol en el payload del token
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',  // El token expira en 1 hora
        }
    );
};

module.exports = generateToken;



