<script>
    import axios from "axios";
    import { onMount } from "svelte";
    import moment from "moment-timezone";

    export let url;

    let vendidos = [];
    let ingresosHoy = 0;
    let ingresosAyer = 0;
    let ingresosSemana = 0;
    let ingresosMes = 0;
    let ingresosMesPasado = 0;
    let ingresosSemanaPasada = 0;
    let ingresosTotal = 0;

    // Calcular ingresos
    function ingresos(lista) {
        let total = 0;
        for (let vendido of lista) {
            total += vendido.cantidad * vendido.precio;
        }
        return total;
    }

    //Filtrar por nombre
    async function filtrarNombre(lista, nombre) {
        let productos = [];
        for (let vendido of lista) {
            if (vendido.nombre === nombre) {
                productos = [...productos, vendido];
            }
        }
        return productos;
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
        ingresosAyer = ingresos(productosAyer)

        const productosMes = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("month"), moment().tz("America/Mexico_City").endOf("month"));
        ingresosMes = ingresos(productosMes);

        const productosMesPasado = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").subtract(1, "month").startOf("month"), moment().tz("America/Mexico_City").subtract(1, "month").endOf("month"));
        ingresosMesPasado = ingresos(productosMesPasado);

        const productosSemana = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").startOf("week"), moment().tz("America/Mexico_City").endOf("week"));
        ingresosSemana = ingresos(productosSemana);

        const productosSemanaPasada = await filtrarFecha(vendidos, moment().tz("America/Mexico_City").subtract(1, "week").startOf("week"), moment().tz("America/Mexico_City").subtract(1, "week").endOf("week"));
        ingresosSemanaPasada = ingresos(productosSemanaPasada);

        ingresosTotal = ingresos(vendidos);

    });
</script>

<style>
    table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #ddd;
    border-top: 2px solid white;
}

th {
    background-color: black;
    color: white;
    font-weight: bold;
}

td {
    background-color: black;
    color: white;
    position: relative; /* Needed for the tooltip positioning */
    overflow: visible; /* Ensure the tooltip isn't clipped */
}

colgroup {
    border-right: 2px solid white;
}

.income-amount-green {
    color: #4CAF50;
}

.income-amount-red {
    color: red;
}


.tooltip {
    display: none; /* Initially hidden */
    background-color: white;
    text-align: center;
    border-radius: 5px;
    padding: 5px;
    position: absolute;
    z-index: 10;
    top: 50%;
    left: 60%;
    transform: translateY(-50%);
    width: max-content;
    white-space: nowrap;
    border: 1px solid #ddd;
}

.tooltip::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%; /* Arrow to the left */
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent white transparent transparent;
}

/* Display the tooltip on hover */
td:hover .tooltip {
    display: block; /* Force tooltip to display on hover */
}

</style>

<div class="contenedorEstadisticas">
    <h1 style="text-align: center;">Estadísticas</h1>
    <table>
        <colgroup>
            <col span="1" style="border-right: 2px solid white;">
            <col span="1" style="border-right: 2px solid white;">
        </colgroup>

        <thead>
            <tr>
                <th style="background-color: lightblue; color: black">Ingresos</th>
                <th style="background-color: pink; color: black">Monto</th>
                <th style="background-color: lightyellow; color: black">Promedio (por día)</th> <!-- New column for mean -->
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hoy</td>
                <td>
                    $ {ingresosHoy}
                    <div class="tooltip" style="color: {ingresosHoy >= ingresosAyer ? 'green' : 'red'}">
                        {ingresosHoy >= ingresosAyer ? '+' : '-'} $ {ingresosHoy - ingresosAyer}
                    </div>
                </td>
                <td> <!-- Mean sales for "Hoy" -->
                    $ {(ingresosHoy / 1).toFixed(2)} <!-- Assuming "Hoy" is a single day -->
                </td>
            </tr>
            <tr>
                <td>Semana</td>
                <td>
                    $ {ingresosSemana}
                    <div class="tooltip" style="color: {ingresosSemana >= ingresosSemanaPasada ? 'green' : 'red'}">
                        {ingresosSemana >= ingresosSemanaPasada ? '+' : '-'} $ {ingresosSemana - ingresosSemanaPasada}
                    </div>
                </td>
                <td> <!-- Mean sales for "Semana" -->
                    $ {(ingresosSemana / 7).toFixed(2)} <!-- Assuming 7 days in a week -->
                </td>
            </tr>
            <tr>
                <td>Mes</td>
                <td>
                    $ {ingresosMes}
                    <div class="tooltip" style="color: {ingresosMes >= ingresosMesPasado ? 'green' : 'red'}">
                        {ingresosMes >= ingresosMesPasado ? '+' : '-'} $ {ingresosMes - ingresosMesPasado}
                    </div>
                </td>
                <td> <!-- Mean sales for "Mes" -->
                    $ {(ingresosMes / 30).toFixed(2)} <!-- Assuming 30 days in a month -->
                </td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: lightgray; color: black">TOTAL</td>
                <td>
                    $ {ingresosTotal}
                </td>
                <td> <!-- Mean sales for "Total" -->
                     <!-- Calculate based on total days available -->
                </td>
            </tr>
        </tbody>
    </table>
</div>