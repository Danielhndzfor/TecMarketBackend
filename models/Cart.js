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
cartSchema.methods.calculateTotal = async function() {
    let total = 0;
    for (let item of this.items) {
        const product = await mongoose.model('Product').findById(item.product); // Obtener el producto
        total += product.price * item.quantity; // Sumar el precio del producto por la cantidad
    }
    return total;
};


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

