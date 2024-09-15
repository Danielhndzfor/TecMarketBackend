// models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true, // Asegúrate de que el token sea único
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h', // El token expira en 1 hora
    },
});

module.exports = mongoose.model('Token', tokenSchema);
