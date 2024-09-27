const mongoose = require("mongoose")

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    precio: {
        type: Number,
        required: true
    }
})

const ProductoModel = mongoose.model("productos", ProductoSchema);
module.exports = ProductoModel