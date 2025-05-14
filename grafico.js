class GraficoInterpolacion {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('grafico').getContext('2d');
    }

    actualizarGrafico(puntos, xInterpolar = null, yInterpolar = null) {
        if (this.chart) {
            this.chart.destroy();
        }

        const datasets = [{
            label: 'Puntos dados',
            data: puntos,
            backgroundColor: 'rgba(75, 192, 192, 1)',
            borderColor: 'rgba(75, 192, 192, 1)',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
        }];

        // Si hay suficientes puntos, dibujar la línea de interpolación
        if (puntos.length >= 2) {
            const xMin = Math.min(...puntos.map(p => p.x));
            const xMax = Math.max(...puntos.map(p => p.x));
            
            const lineaInterpolacion = [];
            for (let x = xMin; x <= xMax; x += (xMax - xMin) / 100) {
                lineaInterpolacion.push({
                    x: x,
                    y: calculadora.calcularInterpolacion(x)
                });
            }

            datasets.push({
                label: 'Interpolación lineal',
                data: lineaInterpolacion,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            });
        }

        // Si hay un punto interpolado para mostrar
        if (xInterpolar !== null && yInterpolar !== null) {
            datasets.push({
                label: 'Punto interpolado',
                data: [{x: xInterpolar, y: yInterpolar}],
                backgroundColor: 'rgba(255, 159, 64, 1)',
                borderColor: 'rgba(255, 159, 64, 1)',
                pointRadius: 8,
                pointHoverRadius: 10
            });
        }

        this.chart = new Chart(this.ctx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        title: {
                            display: true,
                            text: 'Eje X'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Eje Y'
                        }
                    }
                }
            }
        });
    }
}