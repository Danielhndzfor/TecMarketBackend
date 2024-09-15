const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al comprador
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Lista de productos favoritos
    createdAt: { type: Date, default: Date.now },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

