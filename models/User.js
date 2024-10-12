const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true, // Primer apellido obligatorio
    },
    lastName: {
        type: String, // Segundo apellido opcional
        default: '', // No es requerido
    },
    dateOfBirth: {
        type: Date, // Fecha de nacimiento
        required: true,
    },
    phoneNumber: {
        type: String, // Número de teléfono en formato string para manejar distintos formatos internacionales
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10,15}$/.test(v); // Validar que contenga entre 10 y 15 dígitos
            },
            message: props => `${props.value} no es un número de teléfono válido. Debe contener entre 10 y 15 dígitos.`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['comprador', 'vendedor', 'admin'],
        default: 'comprador',
    },
    // Datos adicionales para los vendedores
    businessName: {
        type: String,
        required: function() {
            return this.role === 'vendedor'; // Solo es obligatorio si el rol es 'vendedor'
        },
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    clabe: {
        type: String,
        validate: {
            validator: function(v) {
                return v == null || v.length === 18; // Solo valida si se proporciona y debe tener 18 dígitos
            },
            message: 'La CLABE debe tener 18 dígitos.',
        }
    },
}, { timestamps: true }); // Agrega timestamps para createdAt y updatedAt automáticamente

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar un token JWT
userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// Encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

