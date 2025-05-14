class CalculadoraInterpolacion {
    constructor() {
        this.puntos = [];
    }

    // Agrega un punto al conjunto de datos
    agregarPunto(x, y) {
        this.puntos.push({x, y});
        this.puntos.sort((a, b) => a.x - b.x); // Ordenar por x
    }

    // Calcula el valor interpolado para un x dado
    calcularInterpolacion(x) {
        if (this.puntos.length < 2) {
            throw new Error("Se necesitan al menos 2 puntos para interpolación");
        }

        // Encontrar los puntos adyacentes
        let x0, x1, y0, y1;
        for (let i = 0; i < this.puntos.length - 1; i++) {
            if (x >= this.puntos[i].x && x <= this.puntos[i+1].x) {
                x0 = this.puntos[i].x;
                x1 = this.puntos[i+1].x;
                y0 = this.puntos[i].y;
                y1 = this.puntos[i+1].y;
                break;
            }
        }

        // Si x está fuera del rango, usar los extremos
        if (x < this.puntos[0].x) {
            x0 = this.puntos[0].x;
            x1 = this.puntos[1].x;
            y0 = this.puntos[0].y;
            y1 = this.puntos[1].y;
        } else if (x > this.puntos[this.puntos.length-1].x) {
            x0 = this.puntos[this.puntos.length-2].x;
            x1 = this.puntos[this.puntos.length-1].x;
            y0 = this.puntos[this.puntos.length-2].y;
            y1 = this.puntos[this.puntos.length-1].y;
        }

        // Fórmula de interpolación lineal: y = y0 + ((y1-y0)/(x1-x0))*(x-x0)
        return y0 + ((y1 - y0) / (x1 - x0)) * (x - x0);
    }

    // Calcula el error relativo si se proporciona la función real
    calcularError(x, funcionReal) {
        const yInterpolado = this.calcularInterpolacion(x);
        const yReal = funcionReal(x);
        return Math.abs((yReal - yInterpolado) / yReal) * 100;
    }

    // Exportar datos a CSV
    exportarCSV() {
        let csv = "x,y\n";
        this.puntos.forEach(punto => {
            csv += `${punto.x},${punto.y}\n`;
        });
        return csv;
    }
}
// Instancias globales
const calculadora = new CalculadoraInterpolacion();
const grafico = new GraficoInterpolacion();

// Función para actualizar la tabla de puntos
function actualizarTablaPuntos() {
    const tbody = document.getElementById('puntos-body');
    tbody.innerHTML = '';
    
    calculadora.puntos.forEach((punto, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${punto.x}</td>
            <td>${punto.y}</td>
            <td>
                <button class="btn btn-sm btn-danger eliminar-punto" data-index="${index}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar eventos a los botones eliminar
    document.querySelectorAll('.eliminar-punto').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            calculadora.puntos.splice(index, 1);
            actualizarTablaPuntos();
            grafico.actualizarGrafico(calculadora.puntos);
            actualizarEstadoCalculo();
        });
    });
}

// Función para actualizar el área de resultados
function actualizarResultados(texto, esError = false) {
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = texto;
    resultadosDiv.style.color = esError ? 'red' : 'black';
    resultadosDiv.style.fontWeight = esError ? 'bold' : 'normal';
}

// Función para actualizar el estado del botón de cálculo
function actualizarEstadoCalculo() {
    const calcularBtn = document.getElementById('calcular-btn');
    calcularBtn.disabled = calculadora.puntos.length < 2;
}

// Eventos
document.getElementById('agregar-btn').addEventListener('click', function() {
    const x = parseFloat(document.getElementById('x-input').value);
    const y = parseFloat(document.getElementById('y-input').value);
    
    if (isNaN(x) || isNaN(y)) {
        actualizarResultados('Por favor ingrese valores numéricos válidos para X e Y', true);
        return;
    }
    
    calculadora.agregarPunto(x, y);
    document.getElementById('x-input').value = '';
    document.getElementById('y-input').value = '';
    document.getElementById('x-input').focus();
    
    actualizarTablaPuntos();
    grafico.actualizarGrafico(calculadora.puntos);
    actualizarEstadoCalculo();
    actualizarResultados(`Punto (${x}, ${y}) agregado correctamente.`);
});

document.getElementById('calcular-btn').addEventListener('click', function() {
    const xCalcular = parseFloat(document.getElementById('x-calcular').value);
    const funcionRealInput = document.getElementById('funcion-real').value;
    
    if (isNaN(xCalcular)) {
        actualizarResultados('Por favor ingrese un valor X válido para interpolar', true);
        return;
    }
    
    try {
        const yInterpolado = calculadora.calcularInterpolacion(xCalcular);
        let mensaje = `Para x = ${xCalcular}, el valor interpolado es y ≈ ${yInterpolado.toFixed(4)}`;
        
        if (funcionRealInput) {
            try {
                const funcionReal = new Function('x', `return ${funcionRealInput}`);
                const error = calculadora.calcularError(xCalcular, funcionReal);
                mensaje += `<br>Error relativo: ${error.toFixed(4)}%`;
            } catch (e) {
                mensaje += `<br><span style="color: red;">Error al evaluar la función real: ${e.message}</span>`;
            }
        }
        
        actualizarResultados(mensaje);
        grafico.actualizarGrafico(calculadora.puntos, xCalcular, yInterpolado);
    } catch (e) {
        actualizarResultados(e.message, true);
    }
});

document.getElementById('limpiar-btn').addEventListener('click', function() {
    calculadora.puntos = [];
    actualizarTablaPuntos();
    grafico.actualizarGrafico(calculadora.puntos);
    actualizarEstadoCalculo();
    actualizarResultados('Todos los puntos han sido eliminados.');
});

document.getElementById('exportar-btn').addEventListener('click', function() {
    if (calculadora.puntos.length === 0) {
        actualizarResultados('No hay datos para exportar', true);
        return;
    }
    
    const csv = calculadora.exportarCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_interpolacion.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('toggle-funcion-btn').addEventListener('click', function() {
    const container = document.getElementById('funcion-real-container');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        this.textContent = '- Función Real';
    } else {
        container.style.display = 'none';
        this.textContent = '+ Función Real';
    }
});

// Inicialización
actualizarEstadoCalculo();