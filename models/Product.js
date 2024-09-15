const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        default: 5
    },
    images: { 
        type: [String],  // Arreglo de rutas de imágenes
        validate: {
            validator: function(array) {
                return array.length <= 5;  // Máximo 5 imágenes
            },
            message: 'Solo se permiten hasta 5 imágenes'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);


