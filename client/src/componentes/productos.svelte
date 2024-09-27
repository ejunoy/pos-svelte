<script>
    import {onMount} from "svelte";
    import axios from "axios";
    import Accordion, {Panel, Header, Content} from "@smui-extra/accordion";
    import Button, {Label} from "@smui/button";
    import Dialog, { Title, Actions } from '@smui/dialog';
    import Autocomplete from '@smui-extra/autocomplete';
    import Textfield from '@smui/textfield';


    //const url = "https://pos-svelte-sable.vercel.app"
    const url= "http://localhost:3000"
    
    let productos = [];
    let nombresProductos = [];
    let preciosProductos =[];

    let nuevoProducto = {nombre: "", precio: 0}

    onMount(async ()=>{
        const response = await axios.get(url+"/productos")
        productos = response.data;
        for(let i = 0; i < productos.length; i++){
            nombresProductos= [...nombresProductos, productos[i].nombre];
            preciosProductos = [...preciosProductos, productos[i].precio]
        }
    })
    let openDialog = false;
    

    async function crearProducto(){
        console.log(nuevoProducto)
        const response = await axios.post(url+"/productos", nuevoProducto)
    }

</script>


<div class="contenedorAcordeon">
<Accordion>
{#each productos as producto}
    <Panel>
        <Header>Producto: {producto.nombre}</Header>
        <Content> Nombre: {producto.nombre} <br> Precio: {producto.precio}</Content>
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