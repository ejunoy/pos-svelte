<!-- BarChart.svelte -->
<script>
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    // Register the Chart.js components
    Chart.register(...registerables);

    export let labels = [];
    export let data = [];
    export let id = "";

    let chart;

    onMount(() => {
        const ctx = document.getElementById(id).getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    });

</script>

<canvas id={id} width="200" height="100"></canvas>

<style>
    /* You can add custom styles for your chart here */
</style>