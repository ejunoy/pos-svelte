const mongoose = require("mongoose")

const CuentaSchema = new mongoose.Schema({
    productos:{type: [mongoose.Schema.Types.ObjectId], ref:"ProductosCuenta", required: true},
    propina: {type:Number, required: false}
})
const CuentaModelo = mongoose.model("cuentas", CuentaSchema);
module.exports = CuentaModelo