const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Token = require('../models/Token');

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userRole = role || 'comprador';
        const user = new User({ name, email, password, role: userRole });
        await user.save();

        // Generar un token JWT con el role del usuario
        const token = generateToken(user);

        // Guardar el token en la base de datos
        await Token.create({ token, user: user._id });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Iniciar sesión
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado' });
        }
        
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }
        

        const token = generateToken(user);

        // Guardar el token en la base de datos
        await Token.create({ token, user: user._id });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};



// Cerrar sesión
const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        await Token.findOneAndDelete({ token }); // Elimina el token de la base de datos
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed' });
    }
};




module.exports = { registerUser, authUser, logoutUser };




