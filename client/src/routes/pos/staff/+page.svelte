
<div>
    <TabBar tabs={[ "Cuentas"]} let:tab bind:active>
        <Tab  {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
</div>

{#if active === "Cuentas"}
    <Cuentas url={url}/>
{/if}


<script>
    import Tab, {Label} from "@smui/tab";
    import TabBar from "@smui/tab-bar";
    import Cuentas from "../../../componentes/cuentas.svelte";
    let active = "Productos"

    const url = "https://pos-svelte-server.vercel.app"
    //const url= "http://localhost:3000"
    
</script>