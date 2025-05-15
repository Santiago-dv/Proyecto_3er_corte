// Calculator menu button interaction
const calcButtons = document.querySelectorAll('nav.menu button');
const linearInputs = document.getElementById('linearInputs');
const lagrangeInputs = document.getElementById('lagrangeInputs');
const newtonInputs = document.getElementById('newtonInputs');

// Function to set visibility of input groups
function showInputGroup(groupToShow) {
  [linearInputs, lagrangeInputs, newtonInputs].forEach(group => {
    if (group === groupToShow) {
      group.classList.add('active');
      group.setAttribute('aria-hidden', 'false');
    } else {
      group.classList.remove('active');
      group.setAttribute('aria-hidden', 'true');
    }
  });
}

// Initialize ARIA hidden attributes
showInputGroup(linearInputs);

calcButtons.forEach(button => {
  button.addEventListener('click', () => {
    calcButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    // Show/hide input sections based on selected method
    if (button.textContent.trim() === 'Lineal') {
      showInputGroup(linearInputs);
      clearResults();
    } else if (button.textContent.trim() === 'Lagrange') {
      showInputGroup(lagrangeInputs);
      clearResults();
    } else if (button.textContent.trim() === 'Newton-Raphson') {
      showInputGroup(newtonInputs);
      clearResults();
    }
  });
});

// Clear result texts
function clearResults() {
  document.getElementById('linearResult').textContent = '';
  document.getElementById('lagrangeResult').textContent = '';
  document.getElementById('newtonResult').textContent = '';
}

// Linear Interpolation Calculation
document.getElementById('calculateLinear').addEventListener('click', () => {
  const x1 = parseFloat(document.getElementById('x1').value);
  const y1 = parseFloat(document.getElementById('y1').value);
  const x2 = parseFloat(document.getElementById('x2').value);
  const y2 = parseFloat(document.getElementById('y2').value);
  const x = parseFloat(document.getElementById('x').value);
  const resultEl = document.getElementById('linearResult');

  if ([x1, y1, x2, y2, x].some(val => isNaN(val))) {
    resultEl.textContent = 'Por favor, ingrese valores válidos.';
    return;
  }
  if (x2 === x1) {
    resultEl.textContent = 'Error: x1 y x2 no pueden ser iguales (división entre cero).';
    return;
  }
  const result = y1 + ((y2 - y1) / (x2 - x1)) * (x - x1);
  resultEl.textContent = `Resultado: ${result}`;
});

// Lagrange Interpolation Calculation
document.getElementById('calculateLagrange').addEventListener('click', () => {
  const pointsInput = document.getElementById('points').value;
  const xLagrange = parseFloat(document.getElementById('xLagrange').value);
  const resultEl = document.getElementById('lagrangeResult');

  if (!pointsInput.trim() || isNaN(xLagrange)) {
    resultEl.textContent = 'Por favor, ingrese valores válidos.';
    return;
  }

  const points = pointsInput.split(';').map(point => {
    const coords = point.trim().split(',');
    if(coords.length !== 2) return null;
    const x = parseFloat(coords[0]);
    const y = parseFloat(coords[1]);
    if (isNaN(x) || isNaN(y)) return null;
    return { x, y };
  });

  if (points.some(p => p === null) || points.length === 0) {
    resultEl.textContent = 'Error en el formato de puntos. Use: x1,y1; x2,y2; ...';
    return;
  }

  // Compute Lagrange interpolation
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    let term = points[i].y;
    for (let j = 0; j < points.length; j++) {
      if (j !== i) {
        if (points[i].x === points[j].x) {
          resultEl.textContent = 'Error: valores x duplicados en los puntos.';
          return;
        }
        term *= (xLagrange - points[j].x) / (points[i].x - points[j].x);
      }
    }
    result += term;
  }
  resultEl.textContent = `Resultado: ${result}`;
});

// Newton-Raphson Calculation
document.getElementById('calculateNewton').addEventListener('click', () => {
  const funcStr = document.getElementById('function').value.trim();
  const derivStr = document.getElementById('derivative').value.trim();
  const initialGuess = parseFloat(document.getElementById('initialGuess').value);
  const resultEl = document.getElementById('newtonResult');

  if (!funcStr || !derivStr || isNaN(initialGuess)) {
    resultEl.textContent = 'Por favor, ingrese valores válidos.';
    return;
  }

  // Prepare safe function construction:
  // Replace ^ with ** for exponentiation if user typed caret
  const safeFuncStr = funcStr.replace(/\^/g, '**');
  const safeDerivStr = derivStr.replace(/\^/g, '**');

  let f, fPrime;

  try {
    f = new Function('x', `return ${safeFuncStr};`);
    fPrime = new Function('x', `return ${safeDerivStr};`);
  } catch (e) {
    resultEl.textContent = 'Error en la función o derivada. Verifique la sintaxis.';
    return;
  }

  let x0 = initialGuess;
  let x1;
  let maxIterations = 100;
  let tolerance = 1e-7;
  let iteration;

  for (iteration = 0; iteration < maxIterations; iteration++) {
    let fx0, fpx0;
    try {
      fx0 = f(x0);
      fpx0 = fPrime(x0);
    } catch (err) {
      resultEl.textContent = 'Error al evaluar la función o derivada en x = ' + x0;
      return;
    }

    if (fpx0 === 0) {
      resultEl.textContent = 'La derivada es cero en x = ' + x0 + '. No se puede continuar.';
      return;
    }

    x1 = x0 - fx0 / fpx0;
    if (Math.abs(x1 - x0) < tolerance) {
      resultEl.textContent = `Resultado: ${x1} (convergido en ${iteration + 1} iteraciones)`;
      return;
    }
    x0 = x1;
  }
  resultEl.textContent = `No se logró converger después de ${maxIterations} iteraciones. Último valor: ${x1}`;
});
