const mongoose = require('mongoose');
const Counter = require('./counter'); // Importa el modelo Counter

const productSchema = new mongoose.Schema({
    productId: { // Campo para el ID incremental
        type: Number,
        unique: true,
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sellerName: {
        type: String,
        required: true,
    },
    sellerFirstName: {
        type: String,
        required: true,
    },
    sellerLastName: {
        type: String,
        default: '', // No es obligatorio
    },
    sellerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    sellerClabe: {
        type: String,
        validate: {
            validator: function(v) {
                return v == null || v.length === 18; // Solo valida si se proporciona y debe tener 18 dígitos
            },
            message: 'La CLABE debe tener 18 dígitos.',
        },
        required: true // Marca como requerido si deseas que siempre se ingrese al crear un producto
    },
    rating: {
        type: Number,
        default: 5
    },
    images: { 
        type: [String], 
        validate: {
            validator: function(array) {
                return array.length <= 5;  
            },
            message: 'Solo se permiten hasta 5 imágenes'
        }
    }
}, {
    timestamps: true
});

// Middleware para establecer el ID incremental
productSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counterDoc = await Counter.findById('productId');
        if (!counterDoc) {
            const newCounter = new Counter({ _id: 'productId', sequenceValue: 1 });
            await newCounter.save();
            this.productId = 1;
        } else {
            counterDoc.sequenceValue += 1;
            await counterDoc.save();
            this.productId = counterDoc.sequenceValue;
        }
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);

