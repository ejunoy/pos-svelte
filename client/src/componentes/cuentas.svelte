<script>
    import { onMount } from "svelte";
    import axios from "axios";
    import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
    import Button, { Label } from "@smui/button";
    import Dialog, { Title, Actions } from '@smui/dialog';
    import Textfield from '@smui/textfield';
    import IconButton, { Icon } from '@smui/icon-button';
    import Autocomplete from '@smui-extra/autocomplete';

    export let url;

    let cuentas = [];  // This will store all the cuentas
    let productosCuenta = {};  // This will store the product information per cuenta
    let openCuentas = [];  // Tracks which cuenta panels are open/closed
    let openProductosCuenta = {};  // Tracks which product panels are open/closed within each cuenta
    let productoModificado = { id: "", cantidad: 0 };  // Stores the product to be modified
    let productoAgregado = {id: "", nombre: "", cantidad:0 };  // Stores the product to be added
    let productos = [];
    let productosNombres = [];
    let productosPrecios = [];



    //Cobrar cuenta
    async function cobrarCuenta(cuenta) {
        const productos = cuenta.productos;
        let productosCobrados = [];
        let totalCuenta =0;
        for(let producto of productos){
            const response = await fetchProducto(producto);
            const productoCobrado = {nombre: response.producto.nombre, precio: response.producto.precio, cantidad: response.cantidad, total: response.producto.precio*response.cantidad}
            productosCobrados = [...productosCobrados, productoCobrado];
            totalCuenta += productoCobrado.total
            const responseVendido =await axios.post(url+"/productosVendidos", {producto:response.producto._id, cantidad: response.cantidad});
            console.log(responseVendido)
        }
        const win = window.open("", "", "height=700, width=400");
        win.document.write("<html><head><title>Recibo</title></head><body>");
        win.document.write("<h1 style='text-align: center;'>Recibo</h1>");

        // Start the table with centered text
        win.document.write("<table style='width: 100%; text-align: center; border-collapse: collapse;'>");

        // Add the table header
        win.document.write(`
        <thead>
            <tr>
            <th style='border-bottom: 1px solid black; padding: 10px;'>Producto</th>
            <th style='border-bottom: 1px solid black; padding: 10px;'>Cantidad</th>
            <th style='border-bottom: 1px solid black; padding: 10px;'>Precio</th>
            <th style='border-bottom: 1px solid black; padding: 10px;'>Total</th>
            </tr>
        </thead>
        <tbody>
        `);

        // Loop through productosCobrados and add a row for each product
        for (let producto of productosCobrados) {
            win.document.write(`
            <tr>
                <td style='padding: 10px;'>${producto.nombre}</td>
                <td style='padding: 10px;'>${producto.cantidad}</td>
                <td style='padding: 10px;'>$${producto.precio}</td>
                <td style='padding: 10px;'>$${producto.total}</td>
            </tr>
            `);
        }

        // Close the table body
        win.document.write("</tbody></table>");

        // Add a horizontal line to separate the total
        win.document.write("<hr style='margin: 20px 0;'>");

        // Display the total amount
        win.document.write(`
        <p style='text-align: right; font-weight: bold; font-size: 18px;'>
            Total productos:$${totalCuenta}<br>
            Propina: $${(cuenta.propina*0.01*totalCuenta).toFixed(2)}<br>
            Total: $${(totalCuenta + cuenta.propina*0.01*totalCuenta).toFixed(2)}
        </p>
        `);

        // Close the HTML
        win.document.write("</body></html>");
        win.document.close();
        win.print();
    }

    //Agregar propina 
    async function agregarPropina(cuentaId, propina) {
        const response = await axios.patch(url + "/cuentas/" + cuentaId, { propina: propina });
        return response.data
    }
    // Crear cuenta
    async function crearCuenta() {
        await axios.post(url + "/cuentas", {propina: 0});
        await actualizarCuentas(); // Re-fetch and update cuentas
    }

    // Eliminar cuenta
    async function eliminarCuenta(cuentaId) {
        await axios.delete(url + "/cuentas/" + cuentaId);
        await actualizarCuentas(); // Re-fetch and update cuentas
    }

    // Eliminar producto cuenta
    async function eliminarProductoCuenta(productoId) {
        await axios.delete(url + "/productosCuenta/" + productoId);
        await actualizarCuentas(); // Re-fetch and update cuentas
    }

    // Create productoCuenta
    async function agregarProducto(cuentaId, productoId, cantidad) {
        const response = await axios.post(url + "/productosCuenta/" + productoId, { cantidad: cantidad });
        const nuevoProductoCuenta = response.data.productoCuenta;
        await axios.patch(url + "/cuentas/" + cuentaId + "/" + nuevoProductoCuenta._id);
        await actualizarCuentas(); // Re-fetch and update cuentas
    }

    // Fetch all products
    async function fetchProductos() {
        const response = await axios.get(`${url}/productos`);
        return response.data;
    }

    // Fetch a single product by its ID
    async function fetchProducto(id) {
        const response = await axios.get(`${url}/productosCuenta/${id}`);
        return response.data;
    }

    // Modify a product's quantity by its ID
    async function modificarProducto(id, cantidad) {
        await axios.patch(`${url}/productosCuenta/${id}`, { cantidad });
        await actualizarCuentas(); // Re-fetch and update cuentas
    }

    // Fetch all cuentas
    async function fetchCuentas() {
        const response = await axios.get(`${url}/cuentas`);
        return response.data;
    }

    // Update cuentas and productosCuenta reactively
    async function actualizarCuentas() {
        cuentas = await fetchCuentas();
        productosCuenta = {};  // Reset productosCuenta

        for (let cuenta of cuentas) {
            let productos = [];
            for (let producto of cuenta.productos) {
                const response = await fetchProducto(producto);
                productos = [...productos, response];
            }
            productosCuenta = { ...productosCuenta, [cuenta._id]: productos };  // Trigger reactivity for productosCuenta
        }
    }

    // Fetch initial data on mount
    onMount(async () => {
        productos = await fetchProductos();
        productosNombres = productos.map(producto => producto.nombre);  // Map product names
        productosPrecios = productos.map(producto => producto.precio);  // Map product prices

        await actualizarCuentas();  // Fetch cuentas and update reactively

        // Initialize open state arrays for cuentas and their products
        openCuentas = Array(cuentas.length).fill(false);  // Initialize all cuenta accordions as closed
        for (let cuenta of cuentas) {
            let openProductos = Array(cuenta.productos.length).fill(false);  // Initialize all product accordions as closed
            openProductosCuenta = { ...openProductosCuenta, [cuenta._id]: openProductos };  // Trigger reactivity
        }
    });
</script>

<!-- UI for displaying cuentas -->
<div class="contenedorAcordeon">
    <Accordion>
        {#each cuentas as cuenta, index (cuenta._id)}
            <Panel>
                <Header>
                    <Label>Cuenta: {index + 1}</Label>
                    <IconButton
                        slot="icon"
                        toggle
                        pressed={() => {
                            openCuentas = [...openCuentas];  // Clone the array to trigger reactivity
                            openCuentas[index] = !openCuentas[index];  // Toggle the state for this cuenta
                        }}
                    >
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <Accordion>
                        {#if productosCuenta[cuenta._id]}
                            {#each productosCuenta[cuenta._id] as producto, indexProducto (producto.id)}
                                <Panel>
                                    <Header>
                                        <Label>Producto: {producto.producto.nombre}</Label>
                                        <IconButton
                                            slot="icon"
                                            toggle
                                            pressed={() => {
                                                openProductosCuenta = { ...openProductosCuenta };  // Clone the object to trigger reactivity
                                                openProductosCuenta[cuenta._id] = [...openProductosCuenta[cuenta._id]];  // Clone the array
                                                openProductosCuenta[cuenta._id][indexProducto] = !openProductosCuenta[cuenta._id][indexProducto];  // Toggle the state for this product
                                            }}
                                        >
                                            <Icon class="material-icons" on>expand_less</Icon>
                                            <Icon class="material-icons">expand_more</Icon>
                                        </IconButton>
                                    </Header>
                                    <Content>
                                        Cantidad: {producto.cantidad}
                                        <p>Precio: {producto.producto.precio}</p>
                                        <Dialog bind:open={producto.isEditing} id="editarPopup">
                                            <Title>Editar producto</Title>
                                            <Content id="textoDialogo">
                                                <Label><h3>Cantidad</h3></Label>
                                                <Textfield
                                                    variant="outlined"
                                                    bind:value={productoModificado.cantidad}
                                                    label="Cantidad"
                                                    type="number"
                                                    input$min="0"
                                                    input$max="1000000"
                                                />
                                            </Content>
                                            <Actions>
                                                <Button
                                                    variant="raised"
                                                    on:click={async () => {
                                                        await modificarProducto(productoModificado.id, productoModificado.cantidad);
                                                    }}
                                                >
                                                    <Label>Guardar</Label>
                                                </Button>
                                                <Button variant="raised">
                                                    <Label>Cancelar</Label>
                                                </Button>
                                            </Actions>
                                        </Dialog>
                                        <Button
                                            on:click={() => {
                                                producto.isEditing = true;
                                                productoModificado = { id: producto.id, cantidad: producto.cantidad };
                                            }}
                                        >
                                            <Label>Editar</Label>
                                        </Button>
                                        <Button on:click={async () => {
                                            await eliminarProductoCuenta(producto.id);
                                        }}>
                                            <Label>Eliminar</Label>
                                        </Button>
                                    </Content>
                                </Panel>
                            {/each}
                        {/if}
                    </Accordion>
                    <p>Propina: {cuenta.propina}%</p>
                    <Dialog bind:open={cuenta.agregando} id="editarPopup">
                        <Title>Agregar producto</Title>
                        <Content id="textoDialogo">
                            <Label><h3>Producto</h3></Label>
                            <Autocomplete
                                options={productosNombres}
                                bind:value={productoAgregado.nombre}
                                label="Producto"
                            />
                    
                            <Label><h3>Cantidad</h3></Label>
                            <Textfield
                                variant="outlined"
                                bind:value={productoAgregado.cantidad}
                                label="Cantidad"
                                type="number"
                                input$min="0"
                                input$max="1000000"
                            />
                        </Content>
                        <Actions>
                            <Button
                                variant="raised"
                                on:click={async () => {
                                    for (let i = 0; i < productosNombres.length; i++) {
                                        if (productosNombres[i] === productoAgregado.nombre) {
                                            let producto = productos[i];
                                            let productoId = producto._id;
                                            await agregarProducto(cuenta._id, productoId, productoAgregado.cantidad);
                                            break;
                                        }
                                    }
                                    cuenta.agregando = false;  // Close the dialog
                                    cuentas = [...cuentas];  // Trigger reactivity
                                }}
                            >
                                <Label>Guardar</Label>
                            </Button>
                            <Button
                                variant="raised"
                                on:click={() => {
                                    cuenta.agregando = false;  // Close the dialog
                                    cuentas = [...cuentas];  // Trigger reactivity
                                }}
                            >
                                <Label>Cancelar</Label>
                            </Button>
                        </Actions>
                    </Dialog>
                    
                    <Button
                        on:click={() => {
                            cuenta.agregando = true;  // Open the dialog
                            cuentas = [...cuentas];  // Trigger reactivity
                        }}
                    >
                        <Label>Agregar producto</Label>
                    </Button>

                    <Button on:click={async () => {
                        await eliminarCuenta(cuenta._id);
                    }}>
                        <Label>Eliminar cuenta</Label>
                    </Button>

                    <Dialog bind:open={cuenta.agregandoPropina} id="propinaPopup">
                        <Title>Agregar propina</Title>
                        <Content id="textoDialogo">
                            <Label><h3>Propina (%)</h3></Label>
                            <Textfield
                                variant="outlined"
                                bind:value={cuenta.propina}
                                label="Cantidad"
                                type="number"
                                input$min="0"
                                input$max="100"
                            />
                        </Content>
                        <Actions>
                            <Button
                                variant="raised"
                                on:click={async () => {
                                    await agregarPropina(cuenta._id, cuenta.propina);
                                    cuenta.agregandoPropina = false;  // Close the dialog
                                    cuentas = [...cuentas];  // Trigger reactivity
                                }}
                            >
                                <Label>Guardar</Label>
                            </Button>
                            <Button
                                variant="raised"
                                on:click={() => {
                                    cuenta.agregando = false;  // Close the dialog
                                    cuentas = [...cuentas];  // Trigger reactivity
                                }}
                            >
                                <Label>Cancelar</Label>
                            </Button>
                        </Actions>
                    </Dialog>
                    
                    <Button on:click={()=>cuenta.agregandoPropina = true}>
                        <Label>Agregar propina</Label>
                    </Button>
                    <Button on:click={() => cobrarCuenta(cuenta)}>
                        <Label>Cobrar cuenta</Label>
                    </Button>
                </Content>
            </Panel>
        {/each}
        <Button on:click={async () => {
            await crearCuenta();
        }}>
            <Label>Crear cuenta</Label>
        </Button>
    </Accordion>
</div>