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

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const {
        name,
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        email,
        password,
        role,
        businessName,
        description,
        category,
        clabe
    } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar datos básicos
        user.name = name;
        user.firstName = firstName;
        user.lastName = lastName || ''; // Si no se proporciona, se mantiene vacío
        user.dateOfBirth = dateOfBirth;
        user.phoneNumber = phoneNumber;
        user.email = email;

        // Solo actualizar la contraseña si se proporciona
        if (password) {
            user.password = password;
        }

        // Manejar el rol y datos específicos de vendedor
        user.role = role; // Actualizar rol
        if (role === 'vendedor') {
            user.businessName = businessName; // Este campo es obligatorio si el rol es 'vendedor'
            user.description = description; // Descripción opcional
            user.clabe = clabe; // Validar que tenga 18 dígitos
        } else {
            // Limpiar campos de vendedor si se cambia a comprador
            user.businessName = undefined; // Eliminar campo
            user.description = undefined; // Eliminar campo
            user.clabe = undefined; // Eliminar campo
        }

        user.category = category; // Asumimos que la categoría siempre se envía

        const updatedUser = await user.save();
        return res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
};


module.exports = {
    getUser,
    updateUserRole,
    updateUserToSeller,
    updateSellerToUser,
    updateUser,
};
