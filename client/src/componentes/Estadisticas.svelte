<script>
    import axios from "axios";
    import { onMount } from "svelte";
    import moment from "moment-timezone";

    export let url;

    let vendidos = [];
    let ingresosHoy = 0;
    let ingresosAyer = 0;

    // Calcular ingresos
    function ingresos(lista) {
        let total = 0;
        for (let vendido of lista) {
            total += vendido.cantidad * vendido.precio;
        }
        return total;
    }

    // Filtrar por fecha
    async function filtrarFecha(lista, fechaInicio, fechaFinal) {
        let productos = [];
        for (let vendido of lista) {
            if (
                moment(vendido.fecha).tz("America/Mexico_City").format("YYYY-MM-DD") >= moment(fechaInicio).tz("America/Mexico_City").format("YYYY-MM-DD") &&
                moment(vendido.fecha).tz("America/Mexico_City").format("YYYY-MM-DD") <= moment(fechaFinal).tz("America/Mexico_City").format("YYYY-MM-DD")
            ) {
                productos = [...productos, vendido];
            }
        }
        return productos;
    }

    // Obtener productos vendidos
    async function fetchVendidos() {
        const response = await axios.get(url + "/productosVendidos");
        return response.data;
    }

    // Obtener producto
    async function fetchProducto(id) {
        const response = await axios.get(url + "/productos/" + id);
        return response.data;
    }

    // Fetch data and calculate incomes
    onMount(async () => {
        const prevendidos = await fetchVendidos();
        for (let prevendido of prevendidos) {
            const producto = await fetchProducto(prevendido.producto);
            const cantidad = prevendido.cantidad;
            let fecha = moment(prevendido.fecha).tz("America/Mexico_City");
            const productoVendido = { nombre: producto.nombre, precio: producto.precio, cantidad: cantidad, fecha: fecha };
            vendidos = [...vendidos, productoVendido];
        }

        // Fetch ingresos for today and yesterday
        const productosHoy = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("day"), moment().tz("America/Mexico_City").endOf("day"));
        ingresosHoy = ingresos(productosHoy);

        const productosAyer = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").subtract(1, "days").startOf("day"), moment().tz("America/Mexico_City").subtract(1, "days").endOf("day"));
        ingresosAyer = ingresos(productosAyer);
    });
</script>

<style>
    .contenedorIngresos {
        display: flex;
        flex-direction: row; /* Display items in a row */
        justify-content: space-between; /* Space items evenly */
        align-items: center; /* Align items vertically in the center */
        width: 100%; /* Ensure the container spans the full width */
        padding: 20px; /* Add padding to the container */
        gap: 20px; /* Add gap between each section */
    }

    .income-section {
        flex: 1; /* Make sections flexible so they take up equal space */
        text-align: center;
    }

    .income-title {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .income-amount-green {
        font-size: 1.25rem;
        color: #4CAF50; /* Green color for positive comparison */
    }

    .income-amount-red {
        font-size: 1.25rem;
        color: red; /* Red color for negative comparison */
    }

    .error-message {
        color: red;
    }
</style>

<div class="contenedorEstadisticas">
    <h1 style="text-align: center;">Estadísticas</h1>
    <div class="contenedorIngresos">
        <!-- Ingresos Totales -->
        <div class="income-section">
            <h3 class="income-title">Ingresos Totales</h3>
            <h3 class="income-amount">$ {ingresos(vendidos)}</h3>
        </div>
        
        <!-- Ingresos Hoy with dynamic color based on comparison with Ayer -->
        <div class="income-section">
            <h3 class="income-title">Ingresos Hoy</h3>
            {#await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("day"), moment().tz("America/Mexico_City").endOf("day")) then productosHoy}
                <h3 class={ingresosHoy >= ingresosAyer ? 'income-amount-green' : 'income-amount-red'}>
                    $ {ingresosHoy}
                </h3>
            {:catch error}
                <h3 class="error-message">Error: {error.message}</h3>
            {/await}
        </div>

        <!-- Ingresos Ayer -->
        <div class="income-section">
            <h3 class="income-title">Ingresos Ayer</h3>
            {#await filtrarFecha(vendidos, moment().tz("America/Mexico_City").subtract(1, "days").startOf("day"), moment().tz("America/Mexico_City").subtract(1, "days").endOf("day")) then productosAyer}
                <h3 class="income-amount">$ {ingresosAyer}</h3>
            {:catch error}
                <h3 class="error-message">Error: {error.message}</h3>
            {/await}
        </div>

        <!-- Ingresos Mes -->
        <div class="income-section">
            <h3 class="income-title">Ingresos Mes</h3>
            {#await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("month"), moment().tz("America/Mexico_City").endOf("month")) then productosMes}
                <h3 class="income-amount">$ {ingresos(productosMes)}</h3>
            {:catch error}
                <h3 class="error-message">Error: {error.message}</h3>
            {/await}
        </div>

        <!-- Ingresos semana -->
        <div class="income-section">
            <h3 class="income-title">Ingresos Semana</h3>
            {#await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("week"), moment().tz("America/Mexico_City").endOf("week")) then productosSemana}
                <h3 class="income-amount">$ {ingresos(productosSemana)}</h3>
            {:catch error}
                <h3 class="error-message">Error: {error.message}</h3>
            {/await}
        </div>
    </div>
</div>