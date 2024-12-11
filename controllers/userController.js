const Product = require('../models/Product');
const User = require('../models/User');

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
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
        console.error('Error al actualizar el rol:', error);
        return res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
    }
};

const updateUserToSeller = async (req, res) => {
    try {
        const { clabe, businessName, description, category } = req.body;

        // Validación de CLABE
        if (!clabe || clabe.length !== 18) {
            return res.status(400).json({ error: 'La CLABE debe tener 18 dígitos' });
        }

        // Validación de datos del negocio
        if (!businessName) {
            return res.status(400).json({ error: 'El nombre del negocio es requerido' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.role === 'vendedor') {
            return res.status(400).json({ error: 'Ya eres vendedor' });
        }

        user.role = 'vendedor';
        user.clabe = clabe;
        user.businessName = businessName;
        user.description = description;
        user.category = category;

        await user.save();
        return res.status(200).json({ message: 'Ahora eres vendedor', user });

    } catch (error) {
        console.error('Error al cambiar el rol a vendedor:', error);
        return res.status(500).json({ error: 'Error al cambiar el rol' });
    }
};

const updateSellerToUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.role === 'comprador') {
            return res.status(400).json({ error: 'Ya eres comprador' });
        }

        user.role = 'comprador';
        user.clabe = undefined;

        await Product.deleteMany({ seller: user._id });
        await user.save();

        return res.status(200).json({ message: 'Ahora eres comprador y se han eliminado tus productos de venta.', user });

    } catch (error) {
        console.error('Error al cambiar el rol a comprador:', error);
        return res.status(500).json({ error: 'Error al cambiar el rol' });
    }
};

// Obtener todos los usuarios (solo para administradores)
const getAllUsers = async (req, res) => {
    try {
        // Verificación de autenticación y rol
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        // Obtener todos los usuarios
        const users = await User.find();

        // Enviar la respuesta con los usuarios
        res.status(200).json({ users }); // Envuelve los usuarios en un objeto
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener todos los usuarios', error: error.message });
    }
};


const updateUser = async (req, res) => {
    const userId = req.params.id; // El ID del usuario se pasa como parámetro en la URL

    try {
        // Verifica si userId es un ObjectId válido de MongoDB
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        

        // Busca al usuario usando el _id
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualiza otros campos sin modificar _id
        user.name = req.body.name || user.name;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.email = req.body.email || user.email;

        // Solo actualizar la contraseña si se proporciona (y encriptarla)
        if (req.body.password) {
            user.password = req.body.password; // Asegúrate de encriptarla
        }

        user.role = req.body.role || user.role;
        if (user.role === 'vendedor') {
            user.businessName = req.body.businessName || user.businessName;
            user.description = req.body.description || user.description;
            user.clabe = req.body.clabe || user.clabe;
        } else {
            user.businessName = undefined;
            user.description = undefined;
            user.clabe = undefined;
        }

        user.category = req.body.category || user.category;

        // Guarda los cambios en el usuario
        const updatedUser = await user.save();
        return res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
};


// Función para contar la cantidad total de usuarios
const countTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.status(200).json({ totalUsers });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios', error: error.message });
    }
};

// Función para contar usuarios con rol de "vendedor"
const countSellers = async (req, res) => {
    try {
        const sellers = await User.countDocuments({ role: 'vendedor' });
        res.status(200).json({ sellers });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios con rol de vendedor', error: error.message });
    }
};

// Función para contar usuarios con rol de "comprador"
const countBuyers = async (req, res) => {
    try {
        const buyers = await User.countDocuments({ role: 'comprador' });
        res.status(200).json({ buyers });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios con rol de comprador', error: error.message });
    }
};

// Contar nuevos usuarios registrados hoy
const countUsersToday = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await User.countDocuments({ createdAt: { $gte: startOfDay } });
        res.json({ message: 'Usuarios registrados hoy', count });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios de hoy', error: error.message });
    }
};

// Contar nuevos usuarios registrados esta semana
const countUsersThisWeek = async (req, res) => {
    try {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const count = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
        res.json({ message: 'Usuarios registrados esta semana', count });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios de esta semana', error: error.message });
    }
};

// Contar nuevos usuarios registrados este mes
const countUsersThisMonth = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const count = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
        res.json({ message: 'Usuarios registrados este mes', count });
    } catch (error) {
        res.status(500).json({ message: 'Error al contar usuarios de este mes', error: error.message });
    }
};



module.exports = {
    getUser,
    updateUserRole,
    updateUserToSeller,
    updateSellerToUser,
    getAllUsers,
    updateUser,
    countTotalUsers,
    countSellers,
    countBuyers,
    countUsersToday,
    countUsersThisWeek,
    countUsersThisMonth,
};
