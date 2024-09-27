
<div>
    <TabBar tabs={["Productos", "Cuentas"]} let:tab bind:active>
        <Tab  {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#if active === "Productos"}
    <Productos/>
{/if}


<script>
    import Tab, {Label} from "@smui/tab";
    import TabBar from "@smui/tab-bar";
    import Productos from "../componentes/productos.svelte";
    let active = "Productos"

</script>

<slot></slot>