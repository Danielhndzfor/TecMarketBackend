const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nombreNegocio: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    clabe: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{18}$/.test(v);
            },
            message: props => `${props.value} no es una CLABE válida. Debe tener 18 dígitos.`,
        },
        required: true,
    },
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
