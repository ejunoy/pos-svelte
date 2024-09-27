const mongoose = require("mongoose");

const ProductoCuentaSchema = new mongoose.Schema({
    producto: {type: mongoose.Schema.Types.ObjectId, ref:"productos", required: true},
    cantidad: {type: Number, required: true},
})

const ProductoCuentaModelo = mongoose.model("productoscuentas", ProductoCuentaSchema);
module.exports = ProductoCuentaModelo