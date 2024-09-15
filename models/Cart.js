const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al comprador
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Referencia al producto
            quantity: { type: Number, required: true, min: 1 }, // Cantidad del producto
            // El campo 'price' se elimina ya que se obtendrá del modelo 'Product'
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, // Para registrar la última actualización
});

// Método para calcular el total del carrito
cartSchema.methods.calculateTotal = function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

