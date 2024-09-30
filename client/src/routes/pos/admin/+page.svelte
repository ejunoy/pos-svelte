
<div>
    <TabBar tabs={["Productos", "Cuentas", "Estadísticas"]} let:tab bind:active>
        <Tab  {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#if active === "Productos"}
    <Productos url={url}/>

{:else if active === "Cuentas"}
    <Cuentas url={url}/>

{:else if active === "Estadísticas"}
    <Estadisticas url={url}/>

{/if}


<script>
    import Tab, {Label} from "@smui/tab";
    import TabBar from "@smui/tab-bar";
    import Productos from "../../../componentes/productos.svelte";
    import Cuentas from "../../../componentes/cuentas.svelte";
    import Estadisticas from "../../../componentes/Estadisticas.svelte";
    let active = "Productos"
    
    //const url = "https://pos-svelte-server.vercel.app"
    const url= "http://localhost:3000"
    
</script>