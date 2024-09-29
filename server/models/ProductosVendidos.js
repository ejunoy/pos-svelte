const mongoose = require('mongoose');
const moment = require('moment-timezone');

const productoVendidoSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true },
    fecha: { 
        type: Date, 
        default: () => moment().toDate()
    },
});

module.exports = mongoose.model('productosvendidos', productoVendidoSchema);