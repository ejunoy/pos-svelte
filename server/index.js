const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: ['http://localhost:8080', "https://pos-svelte-server.vercel.app"]
}));
app.use(express.json());

mongoose.connect("mongodb+srv://emiliojunoy:Madeinmexico2001@cluster0.p7jiu.mongodb.net/POS?retryWrites=true&w=majority&appName=Cluster0");


app.get("/", (req, res) => {
    res.json("hola");
});

app.listen(3000, () => {
    console.log("Server is running");
});