const ProductoModel = require("./models/Productos.js") 
const CuentaModel = require("./models/Cuentas.js")
const ProductoCuentaModel = require("./models/ProductosCuenta.js")

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ProductoCuentaModelo = require("./models/ProductosCuenta.js");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: ['http://localhost:5174','http://localhost:5173', "https://pos-svelte-client.vercel.app"]
}));
app.use(express.json());

mongoose.connect("mongodb+srv://emiliojunoy:Madeinmexico2001@cluster0.p7jiu.mongodb.net/POS?retryWrites=true&w=majority&appName=Cluster0");

app.get("/", (req, res) => {
    res.json("hola");
});

//Funcionalidades de productos
app.get("/productos", async (req, res) => {
    try {
        const productos = await ProductoModel.find({});
        res.json(productos);
    } catch (err) {
        res.json(err);
    }
});

app.post("/productos", async (req,res)=>{
    const body = req.body;
    const nombre = body.nombre;
    const precio = body.precio;
    try{
        const nuevoProducto = new ProductoModel({
            nombre:nombre,
            precio:precio
        })
        await nuevoProducto.save();
        res.json(nuevoProducto);
    }catch(err){
        res.json("El producto ya existe")
    }
})

app.delete("/productos/:id", async (req, res) => {
    const id = req.params.id;
    const objectId = new mongoose.Types.ObjectId(id);
    try {
        const deletedProduct = await ProductoModel.findByIdAndDelete(id);
        const productosCuenta = await ProductoCuentaModel.find({producto: objectId });
        const deletedProductosCuenta =await ProductoCuentaModel.deleteMany({ producto: objectId });
        for(let productoCuenta of productosCuenta){
            await CuentaModel.updateMany(
                { productos: productoCuenta._id },
                { $pull: { productos: productoCuenta._id} }
            );
        }
        res.json(deletedProduct);
    } catch (err) {
        res.json(err);
    }
});

app.patch("/productos/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    try {
        const updatedProduct = await ProductoModel.findByIdAndUpdate(id, body);
        res.json(updatedProduct);
    } catch (err) {
        res.json("El producto ya existe");
    }
});


//Funcionalidades de ProductosCuenta
app.get("/productosCuenta", async (req, res) => {
    try {
        const ProductosCuenta = await ProductoCuentaModel.find({});
        res.json(ProductosCuenta);
    } catch (err) {
        res.json(err);
    }
});

app.post("/productosCuenta/:id", async (req, res) => {
    const productoId = req.params.id;
    const cantidad = req.body.cantidad;
    try {
        const nuevoProductoCuenta = new ProductoCuentaModel({
            producto: productoId,
            cantidad: cantidad
        });
        const producto = await ProductoModel.findById(productoId);
        nuevoProductoCuenta.save();
        res.json({productoCuenta:nuevoProductoCuenta,producto:producto});
    }catch(err){
        res.json(err)
    }
});

app.delete("/productosCuenta/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const deletedProduct = await ProductoCuentaModel.findByIdAndDelete(id);
        const objectId = new mongoose.Types.ObjectId(id);
        await CuentaModel.updateMany(
            { productos: objectId },
            { $pull: { productos: objectId } }
        );
        res.json(deletedProduct);
    } catch (err) {
        res.json(err);
    }
});

app.get("/productosCuenta/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const ProductoCuenta = await ProductoCuentaModel.findById(id);
        const productoId = ProductoCuenta.producto;
        const producto = await ProductoModel.findById(productoId)
        
        res.json({id:id,  producto: producto, cantidad: ProductoCuenta.cantidad});
    } catch (err) {
        res.json(err);
    }
});

app.patch("/productosCuenta/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const cantidad = body.cantidad;
    try {
        await ProductoCuentaModel.findByIdAndUpdate(id, {cantidad: cantidad});
        const updatedProduct = await ProductoCuentaModel.findById(id);
        res.json(updatedProduct);
    } catch (err) {
        res.json(err);
    }
});


//Funcionalidades de Cuentas
app.get("/cuentas", async (req,res)=>{
    try {
        const cuentas = await CuentaModel.find({});
        res.json(cuentas)
    }catch(err){
        res.json(err)
    }
})

app.post("/cuentas", async (req,res)=>{
    const body = req.body;
    const productos = body.productos;
    const propina = body.propina;
    try{
        const nuevaCuenta = new CuentaModel({
            productos: productos,  
            propina: propina
        })
        await nuevaCuenta.save();
        res.json(nuevaCuenta);
    }catch(err){
        res.json(err)
    }
});

app.delete("/cuentas/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const cuenta = await CuentaModel.findById(id);
        const productos = cuenta.productos;
        const deletedCuenta = await CuentaModel.findByIdAndDelete(id);
        for(let producto of productos){
            await ProductoCuentaModel.findByIdAndDelete(producto._id);
        }
        res.json(deletedCuenta);
    } catch (err) {
        res.json(err);
    }
});

app.patch("/cuentas/:id/:idProducto", async (req, res) => {
    const id = req.params.id;
    const idProducto = req.params.idProducto;
    const body = req.body;
    const propina = body.propina;
    try {
        const cuenta = await CuentaModel.findById(id);
        const productos = cuenta.productos;
        await CuentaModel.findByIdAndUpdate(id, {productos: [...productos,idProducto]});
        res.json(cuenta);
    } catch (err) {
        res.json(err);
    }
    
});

app.listen(3000, () => {
    console.log("Server is running");
});