const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // ID del producto
        title: { type: String, required: true },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID del vendedor
        status: { type: String, default: 'pendiente' } // Estado del producto en la orden
    }],
    paymentMethod: { type: String, enum: ['efectivo', 'transferencia'], required: true },
    status: { type: String, default: 'pendiente' } // Estado general de la orden
}, { timestamps: true });

// Middleware para actualizar el estado de la orden
orderSchema.methods.updateOrderStatus = function () {
    const allCompleted = this.items.every(item => item.status === 'completado');
    this.status = allCompleted ? 'completado' : 'pendiente';
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;




