const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Token = require('../models/Token');

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
    const { name, firstName, lastName, dateOfBirth, phoneNumber, email, password, role } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Asignar el rol predeterminado si no se envía en la solicitud
        const userRole = role || 'comprador';

        // Crear un nuevo usuario con los datos adicionales
        const user = new User({
            name,
            firstName,
            lastName,
            dateOfBirth,
            phoneNumber,
            email,
            password,
            role: userRole,
        });

        // Guardar el nuevo usuario en la base de datos
        await user.save();

        // Generar un token JWT para el nuevo usuario
        const token = generateToken(user);

        // Guardar el token en la base de datos
        await Token.create({ token, user: user._id });

        // Responder con los detalles del usuario y el token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
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
        // Buscar al usuario por su correo electrónico
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si la contraseña coincide
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT para el usuario autenticado
        const token = generateToken(user);

        // Guardar el token en la base de datos
        await Token.create({ token, user: user._id });

        // Responder con el token y la información del usuario
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Cerrar sesión
const logoutUser = async (req, res) => {
    try {
        // Obtener el token del encabezado de autorización
        const token = req.headers.authorization.split(' ')[1];

        // Eliminar el token de la base de datos
        await Token.findOneAndDelete({ token });

        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

module.exports = { registerUser, authUser, logoutUser };





