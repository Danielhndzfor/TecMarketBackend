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
    sellerName: {
        type: String,
        required: true,
    },
    sellerFirstName: {
        type: String,  // Cambiado de sellerLastName1 a sellerFirstName
        required: true,
    },
    sellerLastName: {
        type: String,  // Cambiado de sellerLastName2 a sellerLastName
        default: '', // No es obligatorio
    },
    sellerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
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


module.exports = mongoose.model('Product', productSchema);