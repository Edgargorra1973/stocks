function calculateRatios(tables) {
    rowCounter = 1; // Reiniciar el contador al inicio

    const ratiosList = [
        {
            name: "Net Earning Ratio (NER)",
            dependencies: [
                { label: "Operating Expenses", matchType: 'exact' },
                { label: "Revenue", matchType: 'exact' }
            ],
            calculation: (values) => {
                const opExp = values["Operating Expenses"];
                const revenue = values["Revenue"];
                return opExp.map((o, i) => (revenue[i] === 0) ? null : (o / revenue[i]) * 100);
            },
            conditions: {
                thresholdLow: 30,
                thresholdHigh: 50,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Net Income Ratio (NIR)",
            dependencies: [
                { label: "Net Income to Common", matchType: 'exact' },
                { label: "Revenue", matchType: 'exact' }
            ],
            calculation: (values) => {
                const nic = values["Net Income to Common"];
                const revenue = values["Revenue"];
                return nic.map((c, i) => (revenue[i] === 0) ? null : (c / revenue[i]) * 100);
            },
            conditions: {
                thresholdLow: 10,
                thresholdHigh: 20,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Cost of goods (CGR)",
            dependencies: [
                { label: "Cost of Revenue", matchType: 'exact' },
                { label: "Revenue", matchType: 'exact' }
            ],
            calculation: (values) => {
                const cost = values["Cost of Revenue"];
                const revenue = values["Revenue"];
                return cost.map((c, i) => (revenue[i] === 0) ? null : (c / revenue[i]) * 100);
            },
            conditions: {
                thresholdLow: 40,
                thresholdHigh: 60,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Gross Margin (GPM)",
            dependencies: [
                { label: "Gross Profit", matchType: 'exact' },
                { label: "Revenue", matchType: 'exact' }
            ],
            calculation: (values) => {
                const gp = values["Gross Profit"];
                const revenue = values["Revenue"];
                return gp.map((g, i) => (revenue[i] === 0) ? null : (g / revenue[i]) * 100);
            },
            conditions: {
                thresholdLow: 40,
                thresholdHigh: 60,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green" 
            }
        },
        {
            name: "Operating Expenses Ratio (OER)",
            dependencies: [
                { label: "Operating Expenses", matchType: 'exact' },
                { label: "Gross Profit", matchType: 'exact' }
            ],
            calculation: (values) => {
                const opExp = values["Operating Expenses"];
                const gp = values["Gross Profit"];
                return opExp.map((o, i) => (gp[i] === 0) ? null : (o / gp[i]) * 100);
            },
            conditions: {
                thresholdLow: 30,
                thresholdHigh: 80,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Interest Expense Ratio (IER)",
            dependencies: [
                { label: "Interest Expense", matchType: 'exact' },
                { label: "Operating Income", matchType: 'exact' }
            ],
            calculation: (values) => {
                const ie = values["Interest Expense"];
                const oi = values["Operating Income"];
                return ie.map((x, i) => (oi[i] === 0) ? null : (x / oi[i]) * 100);
            },
            conditions: {
                thresholdLow: 7,
                thresholdHigh: 15,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Income Taxes Paid (ITPR)",
            dependencies: [
                { label: "Income Tax Expense", matchType: 'exact' },
                { label: "Pretax Income", matchType: 'exact' }
            ],
            calculation: (values) => {
                const ite = values["Income Tax Expense"];
                const pti = values["Pretax Income"];
                return ite.map((x, i) => (pti[i] === 0) ? null : (x / pti[i]) * 100);
            },
            conditions: {
                thresholdLow: 13,
                thresholdHigh: 23,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Shareholder Equity Ratio (SHR)",
            dependencies: [
                { label: "Shareholders' Equity", matchType: 'exact' },
                { label: "Total Assets", matchType: 'exact' }
            ],
            calculation: (values) => {
                const se = values["Shareholders' Equity"];
                const ta = values["Total Assets"];
                return se.map((x, i) => (ta[i] === 0) ? null : (x / ta[i]) * 100);
            },
            conditions: {
                thresholdLow: 20,
                thresholdHigh: 35,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Net Receivable Ratio (NRR)",
            dependencies: [
                { label: "Receivables", matchType: 'exact' },
                { label: "Gross Profit", matchType: 'exact' }
            ],
            calculation: (values) => {
                const rec = values["Receivables"];
                const gp = values["Gross Profit"];
                return rec.map((r, i) => (gp[i] === 0) ? null : (r / gp[i]) * 100);
            },
            conditions: {
                thresholdLow: 25,
                thresholdHigh: 35,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Current Liability Ratio (CR)",
            dependencies: [
                { label: "Total Current Liabilities", matchType: 'exact' },
                { label: "Total Assets", matchType: 'exact' }
            ],
            calculation: (values) => {
                const tcl = values["Total Current Liabilities"];
                const ta = values["Total Assets"];
                return tcl.map((c, i) => (ta[i] === 0) ? null : (c / ta[i]) * 100);
            },
            conditions: {
                thresholdLow: 20,
                thresholdHigh: 25,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Net Assets Ratio (NAR)",
            dependencies: [
                { label: "Net Income to Common", matchType: 'exact' },
                { label: "Total Assets", matchType: 'exact' }
            ],
            calculation: (values) => {
                const nic = values["Net Income to Common"];
                const ta = values["Total Assets"];
                return nic.map((x, i) => (ta[i] === 0) ? null : (x / ta[i]) * 100);
            },
            conditions: {
                thresholdLow: 20,
                thresholdHigh: 35,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Account Payable Ratio (APR)",
            dependencies: [
                { label: "Accounts Payable", matchType: 'exact' },
                { label: "Revenue", matchType: 'exact' }
            ],
            calculation: (values) => {
                const ap = values["Accounts Payable"];
                const rev = values["Revenue"];
                return ap.map((a, i) => (rev[i] === 0) ? null : (a / rev[i]) * 100);
            },
            conditions: {
                thresholdLow: 10,
                thresholdHigh: 25,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Short Term Debt Ratio (STDR)",
            dependencies: [
                { label: "Short-Term Debt", matchType: 'exact' },
                { label: "Long-Term Debt", matchType: 'exact' }
            ],
            calculation: (values) => {
                const std = values["Short-Term Debt"];
                const ltd = values["Long-Term Debt"];
                return std.map((s, i) => (ltd[i] === 0) ? null : (s / ltd[i]) * 100);
            },
            conditions: {
                thresholdLow: 80,
                thresholdHigh: 90,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Long Term Ratio (LTDR)",
            dependencies: [
                { label: "Long-Term Debt", matchType: 'exact' },
                { label: "Net Income to Common", matchType: 'exact' }
            ],
            calculation: (values) => {
                const ltd = values["Long-Term Debt"];
                const nic = values["Net Income to Common"];
                return ltd.map((l, i) => (nic[i] === 0) ? null : (l / nic[i]) * 100);
            },
            conditions: {
                thresholdLow: 30,
                thresholdHigh: 50,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Debt to Shareholder Equity Ratio (DSER)",
            dependencies: [
                { label: "Shareholders' Equity", matchType: 'exact' },
                { label: "Total Liabilities", matchType: 'exact' }
            ],
            calculation: (values) => {
                const se = values["Shareholders' Equity"];
                const tl = values["Total Liabilities"];
                return se.map((x, i) => (tl[i] === 0) ? null : (x / tl[i]) * 100);
            },
            conditions: {
                thresholdLow: 70,
                thresholdHigh: 80,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Retained Earning Ratio (RER)",
            dependencies: [
                { label: "Retained Earnings", matchType: 'exact' },
                { label: "Net Income to Common", matchType: 'exact' }
            ],
            calculation: (values) => {
                const re = values["Retained Earnings"];
                const nic = values["Net Income to Common"];
                return re.map((x, i) => (nic[i] === 0) ? null : (x / nic[i]) * 100);
            },
            conditions: {
                thresholdLow: 5,
                thresholdHigh: 7,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Return on Shareholder Ratio (RSR)",
            dependencies: [
                { label: "Shareholders' Equity", matchType: 'exact' },
                { label: "Net Income to Common", matchType: 'exact' }
            ],
            calculation: (values) => {
                const se = values["Shareholders' Equity"];
                const nic = values["Net Income to Common"];
                return se.map((x, i) => (nic[i] === 0) ? null : (x / nic[i]) * 100);
            },
            conditions: {
                thresholdLow: 10,
                thresholdHigh: 15,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Capital Expenditure Ratio (CER)",
            dependencies: [
                { label: "Capital Expenditures", matchType: 'exact' },
                { label: "Net Income to Common", matchType: 'exact' }
            ],
            calculation: (values) => {
                const ce = values["Capital Expenditures"];
                const nic = values["Net Income to Common"];
                return ce.map((c, i) => (nic[i] === 0) ? null : (c / nic[i]) * 100);
            },
            conditions: {
                thresholdLow: 20,
                thresholdHigh: 50,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Free Cash Flow Margin (FCFM)",
            dependencies: [
                { label: "Free Cash Flow Per Share", matchType: 'exact' }
            ],
            calculation: (values) => {
                const fcfMargin = values["Free Cash Flow Per Share"];
                // Asumiendo que este ratio ya está calculado o es un valor directo
                return fcfMargin.map(f => f);
            },
            conditions: {
                thresholdLow: 1,
                thresholdHigh: 5,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Per Ratio/PB Ratio (PR)",
            dependencies: [
                { label: "Price", matchType: 'exact' },
                { label: "Book Value Per Share", matchType: 'exact' }
            ],
            calculation: (values) => {
                const price = values["Price"];
                const bv = values["Book Value Per Share"];
                return price.map((p, i) => (bv[i] === 0) ? null : (p / bv[i]) * 100);
            },
            conditions: {
                thresholdLow: 20,
                thresholdHigh: 30,
                labelLow: "Normal",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        },
        {
            name: "Yearly Growth (YG)",
            dependencies: [
                { label: "Net Income Growth", matchType: 'exact' },
                { label: "Price", matchType: 'exact' }
            ],
            calculation: (values) => {
                const nig = values["Net Income Growth"];
                return nig.map(x => x);
            },
            conditions: {
                thresholdLow: 8,
                thresholdHigh: 12,
                labelLow: "Pocas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Muchas Ventajas",
                colorLow: "red",
                colorNormal: "black",
                colorHigh: "green"
            }
        },
        {
            name: "Operating Time Ratio (OTR)",
            dependencies: [
                { label: "Cash & Equivalents", matchType: 'exact' },
                { label: "Operating Expenses", matchType: 'exact' }
            ],
            calculation: (values) => {
                const opExp = values["Operating Expenses"];
                const ce = values["Cash & Equivalents"];
                return ce.map((c, i) => (opExp[i] === 0) ? null : (c / opExp[i]) * 100);
            },
            conditions: {
                thresholdLow: 70,
                thresholdHigh: 80,
                labelLow: "Muchas Ventajas",
                labelNormal: "Normal",
                labelHigh: "Pocas Ventajas",
                colorLow: "green",
                colorNormal: "black",
                colorHigh: "red"
            }
        }
        // Puedes añadir aquí cualquier otro ratio necesario
    ];

    ratiosList.forEach(ratio => {
        calculateRatio(
            tables,
            ratio.name,
            ratio.dependencies,
            ratio.calculation,
            ratio.conditions
        );
    });
}

/**
         * Crea el gráfico de barras utilizando Chart.js.
         */
function createResumenBarChart() {
    console.log("[INFO] Iniciando la creación del gráfico de barras de resumen...");
    const resumenData = getResumenLevels();
    if (!resumenData) {
        console.error("[ERROR] No se pudieron extraer los datos de 'resumenTable'.");
        return;
    }

    console.log("[INFO] Datos extraídos para el gráfico:", resumenData);

     // Actualizar el Score en la sección correspondiente
        updateScoreSection(resumenData.Score);

    const ctx = document.getElementById('resumenBarChart').getContext('2d');
    if (!ctx) {
        console.error("[ERROR] No se encontró el canvas con ID 'resumenBarChart'.");
        return;
    }
    console.log("[INFO] Canvas 'resumenBarChart' encontrado.");

    const labels = Object.keys(resumenData).filter(key => key !== 'Score' && resumenData[key].hasPercentage);
    const data = labels.map(label => resumenData[label].percentage);

    // Asignar colores individualmente para cada barra según el valor
    const backgroundColors = labels.map(label => getColorByValue(label, resumenData[label].percentage));

    console.log("[INFO] Labels para el gráfico:", labels);
    console.log("[INFO] Datos para el gráfico:", data);
    console.log("[INFO] Colores de fondo para el gráfico:", backgroundColors);

    // Actualizar el Score en la tabla priceTable
    updatePriceTableScore(resumenData.Score);

    // Destruir el gráfico anterior si existe
    if (window.resumenBarChart && typeof window.resumenBarChart.destroy === 'function') {
        console.log("[INFO] Destruyendo el gráfico existente...");
        window.resumenBarChart.destroy();
    }

    // Crear una nueva instancia del gráfico
    window.resumenBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Porcentajes',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true, // Mostrar la leyenda
                    position: 'top', // Posición de la leyenda
                    labels: {
                        generateLabels: function() {
                            return [
                                { text: 'Excelente', fontColor: 'green' },
                                { text: 'Normal', fontColor: 'blue' },
                                { text: 'Mala', fontColor: 'red' }
                            ];
                        },
                        font: {
                            size: 14, // Tamaño de la letra
                            family: 'Arial',
                            weight: 'bold'
                        },
                        color: '#FFFFFF', // Cambiar el color base (lo sobrescribiremos por indicador)
                        textStrokeWidth: 50, // Grosor del borde
                        textStrokeColor: '#FFFFFF', // Color de la sombra blanca
                        boxWidth: 0 // Quitar cualquier espacio para iconos en la leyenda
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Porcentaje (%)',
                        color:'#ffffff'
                    },
                    ticks: {
                        color: '#FFFFFF' // Cambiar el color de los valores del eje X a blanco
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '',
                        color:'#ffffff'
                    },
                    ticks: {
                        color: '#FFFFFF', // Cambiar el color de los valores del eje X a blanco
                        maxRotation: 30, // Cambiar la rotación máxima a 45 grados
                        minRotation: 30  // Cambiar la rotación mínima a 45 grados
                    }
                    
                }
            }
        }
    });

    console.log("[INFO] Gráfico 'resumenBarChart' creado exitosamente.");
}
/**
* Actualiza el Score en la sección correspondiente del DOM y cambia su color dinámicamente.
* @param {string} score - Valor del Score a mostrar.
*/
function updateScoreSection(score) {
const scoreDisplay = document.getElementById('scoreActualDisplay');
if (!scoreDisplay) {
console.error("[ERROR] No se encontró el elemento con ID 'scoreActualDisplay'.");
return;
}

// Actualizar el contenido del elemento
scoreDisplay.textContent = score;

// Cambiar el color según el valor del Score
if (score === 'A' || score === 'A plus') {
scoreDisplay.style.color = 'green'; // Verde
} else if (score === 'B') {
scoreDisplay.style.color = 'blue'; // Azul
} else {
scoreDisplay.style.color = 'red'; // Rojo
}

console.log(`[INFO] Score actualizado en la sección 'score-section': ${score}`);
}

/**
* Actualiza el Score en la tabla priceTable y cambia su color dinámicamente.
* @param {string} score - Valor del Score.
*/
function updatePriceTableScore(score) {
const priceTable = document.getElementById('priceTable');
if (!priceTable) {
console.error("[ERROR] No se encontró la tabla 'priceTable'.");
return;
}

const priceRow = priceTable.querySelector('tbody tr');
if (!priceRow) {
console.error("[ERROR] No se encontró la fila de datos en 'priceTable'.");
return;
}

const scoreCell = priceRow.querySelectorAll('td')[4];
if (!scoreCell) {
console.error("[ERROR] No se encontró la celda de 'Score' en 'priceTable'.");
return;
}

// Actualizar el contenido de la celda
scoreCell.textContent = score;

// Cambiar el color según el valor del Score
if (score === 'A' || score === 'A plus') {
scoreCell.style.color = 'green'; // Verde
} else if (score === 'B') {
scoreCell.style.color = 'blue'; // Azul
} else {
scoreCell.style.color = 'red'; // Rojo
}

// Ajustar estilos adicionales para visibilidad
scoreCell.style.fontWeight = 'bold'; // Negrita
scoreCell.style.backgroundColor = ''; // Sin fondo (si aplica)

console.log(`[INFO] Score actualizado en 'priceTable': ${score}`);
}
