const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequenceValue: { type: Number, default: 0 }
});

// Usar la verificación para evitar sobrescribir el modelo
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

module.exports = Counter;

