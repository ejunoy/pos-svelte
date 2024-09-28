<script>
    import {onMount} from "svelte";
    import axios from "axios";
    import Accordion, {Panel, Header, Content} from "@smui-extra/accordion";
    import Button, {Label} from "@smui/button";
    import Dialog, { Title, Actions } from '@smui/dialog';
    import Textfield from '@smui/textfield';
    import IconButton, { Icon } from '@smui/icon-button';
    import {toast, Toaster} from 'svelte-french-toast';



    //const url = "https://pos-svelte-server.vercel.app"
    const url= "http://localhost:3000"
    
    let productos = [];
    let nombresProductos = [];
    let preciosProductos =[];
    let openPanels = [];

    let nuevoProducto = {nombre: "", precio: 0};
    let productoModificado = {nombre: "", precio: 0};


    function productoEliminado(){
        toast.success("El producto ha sido eliminado");
    }

    function productoCreado(){
        toast.success("El producto ha sido creado");
    }

    function errorProductoExiste(){
        toast.error("El producto ya existe");
    }

    function productoEditado(){
        toast.success("El producto ha sido editado");
    }

    async function editarProducto(producto, productoModificado){
        if(producto.nombre != productoModificado.nombre || producto.precio != productoModificado.precio){
            const response = await axios.patch(url+"/productos/"+producto._id, productoModificado)
            if(response.data==="El producto ya existe"){
                errorProductoExiste();
            }else{
                productoEditado();
            }
        }else{
            productoEditado();
        }
        await obtenerProductos();   
    }

    async function eliminarProducto(id){
        const response = await axios.delete(url+"/productos/"+id)
        productoEliminado();
        await obtenerProductos();
    }

    async function obtenerProductos(){
        const response = await axios.get(url+"/productos")
        productos = response.data;
        for(let i = 0; i < productos.length; i++){
            nombresProductos= [...nombresProductos, productos[i].nombre];
            preciosProductos = [...preciosProductos, productos[i].precio]
        }
        return productos
    }

    onMount(async ()=>{
        const productos =await obtenerProductos()
        for(let producto of productos){
            openPanels = [...openPanels, false]
        }
    })
    let openDialog = false;
    

    async function crearProducto(){
        const response = await axios.post(url+"/productos", nuevoProducto)
        console.log(response.data)
        if(response.data==="El producto ya existe"){
            errorProductoExiste();
        }else{
            productoCreado();
        }
        await obtenerProductos();
    }

</script>


<div class="contenedorAcordeon">

<Accordion>
    {#each productos as producto, index (producto._id)}
    <Panel>
        <Header>
            Producto: {producto.nombre}
            <IconButton slot="icon" toggle pressed={()=> openPanels[index]= !openPanels[index]}>
                <Icon class="material-icons" on>expand_less</Icon>
                <Icon class="material-icons">expand_more</Icon>
            </IconButton>
        </Header>
        <Content> 
            Nombre: {producto.nombre} <br> 
            Precio: {producto.precio} 
        </Content>

        {#if producto.isEditing}
            <Dialog bind:open={producto.isEditing} id="editarPopup">
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
                    <Button on:click={() => {
                        editarProducto(producto, productoModificado);
                        producto.isEditing = false;
                    }} variant="raised">
                        <Label>Guardar</Label>
                    </Button>
                    <Button on:click={() => producto.isEditing = false} variant="raised">
                        <Label>Cancelar</Label>
                    </Button>
                </Actions>
            </Dialog>
        {/if}

        <Button on:click={() => {
            productoModificado.nombre = producto.nombre;
            productoModificado.precio = producto.precio;

            producto.isEditing = true;
        }}>
            <Label>Editar</Label>
        </Button>
        <Button on:click={() => eliminarProducto(producto._id)}>
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
<Toaster/>

<style>
    :global(#textoDialogo){
        text-align: center;
        margin: 5px 0px 100px 5px
    }

    :global(#botonCrearProducto){
        margin: 2px 0px 100px 0px ;
    }


</style>