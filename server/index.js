const ProductoModel = require("./models/Productos.js") 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: ['http://localhost:5174','http://localhost:5173', "https://pos-svelte-server.vercel.app"]
}));
app.use(express.json());

mongoose.connect("mongodb+srv://emiliojunoy:Madeinmexico2001@cluster0.p7jiu.mongodb.net/POS?retryWrites=true&w=majority&appName=Cluster0");


app.get("/", (req, res) => {
    res.json("hola");
});

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
        res.json(err)
    }
})

app.listen(3000, () => {
    console.log("Server is running");
});