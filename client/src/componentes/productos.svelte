<script>
    import {onMount} from "svelte";
    import axios from "axios";
    import Accordion, {Panel, Header, Content} from "@smui-extra/accordion";
    import Button, {Label} from "@smui/button";
    import Dialog, { Title, Actions } from '@smui/dialog';
    import Autocomplete from '@smui-extra/autocomplete';
    import Textfield from '@smui/textfield';


    const url = "https://pos-svelte-server.vercel.app"
    //const url= "http://localhost:3000"
    
    let productos = [];
    let nombresProductos = [];
    let preciosProductos =[];

    let nuevoProducto = {nombre: "", precio: 0};
    let productoModificado = {nombre: "", precio: 0};

    async function editarProducto(producto, productoModificado){
        const response = await axios.patch(url+"/productos/"+producto._id, productoModificado)
        await obtenerProductos();
    }

    async function eliminarProducto(id){
        const response = await axios.delete(url+"/productos/"+id)
        await obtenerProductos();
    }

    async function obtenerProductos(){
        const response = await axios.get(url+"/productos")
        productos = response.data;
        for(let i = 0; i < productos.length; i++){
            nombresProductos= [...nombresProductos, productos[i].nombre];
            preciosProductos = [...preciosProductos, productos[i].precio]
        }
    }

    onMount(async ()=>{
        await obtenerProductos()
    })
    let openDialog = false;
    let openEditar = false;
    

    async function crearProducto(){
        console.log(nuevoProducto)
        const response = await axios.post(url+"/productos", nuevoProducto)
        await obtenerProductos();
    }

</script>


<div class="contenedorAcordeon">
<Accordion>
{#each productos as producto}
    <Panel>
        <Header>Producto: {producto.nombre}</Header>
        <Content> Nombre: {producto.nombre} <br> Precio: {producto.precio}</Content>
        <Dialog bind:open={openEditar} id="ediarPopup">
            <Title>Editar Producto</Title>
            <Content id="textoDialogo">
                <Label>
                    <h3>Nombre:</h3>
                </Label>
                <Textfield variant="outlined" bind:value={productoModificado.nombre} label="Nombre" type="text" />
                <Label>
                    <h3>Precio:</h3>
                </Label>
                <Textfield variant="outlined" bind:value={productoModificado.precio} label="Precio" type="number" input$min="0.01" input$max="1000000"/>
            </Content>
            
            <Actions>
                <Button on:click={()=>editarProducto(producto, productoModificado)} variant="raised">
                    <Label>Guardar</Label>
                </Button>
                <Button variant="raised">
                    <Label>Cancelar</Label>
                </Button>
            </Actions>
        </Dialog>
        <Button on:click = {() => openEditar=true}>
            <Label>Editar</Label>
        </Button>
        <Button on:click = {() => eliminarProducto(producto._id) }>
            <Label>Eliminar</Label>
        </Button>
    </Panel>
{/each}
</Accordion>

<Dialog bind:open={openDialog} id="dialogoPopup">
    <Title>Crear nuevo producto</Title>
    <Content id="textoDialogo">
        <Label>
            <h3>Nombre:</h3>
        </Label>
        <Textfield variant="outlined" bind:value={nuevoProducto.nombre} label="Nombre" type="text" />
        <Label>
            <h3>Precio:</h3>
        </Label>
        <Textfield variant="outlined" bind:value={nuevoProducto.precio} label="Precio" type="number" input$min="0.01" input$max="1000000"/>
    </Content>
    
    <Actions>
        <Button on:click={crearProducto} variant="raised">
            <Label>Guardar</Label>
        </Button>
        <Button variant="raised">
            <Label>Cancelar</Label>
        </Button>
    </Actions>
</Dialog>

<Button on:click={()=> openDialog=true} variant= "raised" id="botonCrearProducto">
    <Label>Crear producto</Label>
</Button>
</div>

<style>
    :global(#textoDialogo){
        text-align: center;
        margin: 5px 0px 100px 5px
    }

    :global(#botonCrearProducto){
        margin: 2px 0px 100px 0px ;
    }


</style>