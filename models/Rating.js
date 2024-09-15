const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Referencia al producto
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al comprador
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
