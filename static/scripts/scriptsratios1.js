console.log("[DEBUG] scriptsratios.js ejecutado.");
if (!window.domContentLoadedAttached) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("[DEBUG] DOMContentLoaded Listener inicializado.");
        
        const toggleBtn = document.getElementById('toggle-table-link');

        if (toggleBtn) {
            console.log("[DEBUG] Botón encontrado:", toggleBtn);

            const ticker = toggleBtn.getAttribute('data-simbolo');
            console.log(`[DEBUG] Ticker capturado: ${ticker}`);

            if (!toggleBtn.dataset.listenerAttached) {
                toggleBtn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    console.log(`[DEBUG] Listener ejecutado para ${ticker}`);

                    if (!ticker) {
                        console.error("[ERROR] El atributo data-simbolo no está definido o es nulo.");
                        return;
                    }

                    console.log(`[DEBUG] Iniciando extracción de valores para ratios para ${ticker}`);

                    try {
                        const response = await fetch(`/api/companies/${ticker}/financials`);
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`[ERROR] HTTP ${response.status}: ${response.statusText}`);
                            console.error(`[ERROR] Detalle de respuesta: ${errorText}`);
                            throw new Error(`Error al obtener datos financieros: ${response.statusText}`);
                        }

                        const financialData = await response.json();
                        console.log(`[DEBUG] Datos financieros obtenidos para ${ticker}:`, financialData);

                        const yearlyData = {
                            balanceSheet: financialData["balance-sheet_yearly"],
                            cashFlow: financialData["cash-flow_yearly"],
                            income: financialData["income_yearly"],
                            ratios: financialData["ratios_yearly"]
                        };

                        console.log(`[DEBUG] Datos anuales obtenidos para ${ticker}:`, yearlyData);

                        filtrarTablas(yearlyData);

                    } catch (error) {
                        console.error("[ERROR] Error al obtener valores para ratios:", error);
                        return null;
                    }
                });
                toggleBtn.dataset.listenerAttached = true;
            }
        } else {
            console.error("[ERROR] Botón con ID 'toggle-table-link' no encontrado.");
        }
    });
    window.domContentLoadedAttached = true;
}




// parsea y organiza las tablas financieras para luego pasarsela al calculo
function filtrarTablas(yearlyData) {
    const requiredFields = [

        "Operating Expenses",
        "Revenue",
        "Net Income",
        "Cost of Revenue",
        "Gross Profit",
        "Interest Expense",
        "Operating Income",
        "Income Tax Expense",
        "Pretax Income",
        "Shareholders' Equity",
        "Total Assets",
        "Receivables",
        "Total Current Liabilities",
        "Accounts Payable",
        "Short-Term Debt",
        "Long-Term Debt",
        "Total Liabilities",
        "Retained Earnings",
        "Capital Expenditures",
        "Free Cash Flow Per Share",
        "Price",
        "Book Value Per Share",
        "Net Income Growth",
        "Total Current Assets",
        "Cash & Equivalents",
        "Repurchase of Common Stock"

        
    ];

    const result = {};

    // Iterar por las tablas disponibles
    for (const [tableName, tableData] of Object.entries(yearlyData)) {
        if (tableData && tableData.rows && tableData.headers) {
            console.log(`[DEBUG] Procesando tabla: ${tableName}`);

            // **Obtener encabezados de períodos**
            const periods = tableData.headers.slice(1, -1); // Excluir el primer encabezado (campo) y el último ('Upgrade')
            console.log(`[DEBUG] Períodos detectados (${tableName}):`, periods);

            // **Estructurar las filas**
            const structuredRows = tableData.rows.map(row => {
                const fieldName = row[0]; // El primer valor es el nombre del campo
                const data = periods.reduce((acc, period, index) => {
                    const value = row[index + 1]; // Valores comienzan desde el segundo elemento
                    if (value) {
                        const numericValue = parseFloat(value.replace(/,/g, ''));
                        if (!isNaN(numericValue)) {
                            acc[period] = numericValue; // Convertir a número
                        } else {
                            console.warn(`[WARN] Valor no numérico encontrado: ${value} en ${fieldName}, período ${period}.`);
                            acc[period] = null; // Valor no válido
                        }
                    } else {
                        console.warn(`[WARN] Valor vacío encontrado en ${fieldName}, período ${period}.`);
                        acc[period] = null; // Valor vacío
                    }
                    return acc;
                }, {});
                return { field: fieldName, values: data };
            });

            console.log(`[DEBUG] Tabla estructurada (${tableName}):`, structuredRows);

            // **Añadir filas estructuradas a los resultados**
            result[tableName] = structuredRows;
        } else {
            console.warn(`[WARN] Tabla ${tableName} no contiene datos válidos.`);
        }
    }

    // **Buscar campos requeridos en todas las tablas**
    const finalResult = requiredFields.map(field => {
        const normalizedField = field.toLowerCase().trim();
        for (const [tableName, rows] of Object.entries(result)) {
            const row = rows.find(r => r.field.toLowerCase().trim() === normalizedField);
            if (row) {
                console.log(`[DEBUG] Campo encontrado: ${field} en ${tableName}, Valores:`, row.values);
                return { field, values: row.values };
            }
        }
        console.warn(`[WARN] Campo ${field} no encontrado en ninguna tabla.`);
        return { field, values: null };
    });

    console.log("[DEBUG] Resultado final estructurado:", finalResult);

    // **Llamar a la función calculateRatios con los datos finales**
    console.log("[DEBUG] Llamando a calculateRatios con los datos estructurados.");
    calculateRatios(finalResult);

    return finalResult;
}
//Calcula los ratios


//saca las ventajas competitivas
function calculateRatios(data) {
    console.log("[DEBUG] Iniciando el cálculo de ratios...");


// Validar existencia y valores de los datos necesarios
const requiredFields = [

    { name: "Operating Expenses", data: operatingExpensesData },
    { name: "Revenue", data: revenueData },
    { name: "Cost of Revenue", data: costOfRevenueData },
    { name: "Gross Profit", data: grossProfitData },
    { name: "Interest Expense", data: interestExpenseData },
    { name: "Operating Income", data: operatingIncomeData },
    { name: "Pretax Income", data: pretaxIncomeData },
    { name: "Income Tax Expense", data: incomeTaxExpenseData },
    { name: "Shareholders' Equity", data: shareholdersEquityData },
    { name: "Total Assets", data: totalAssetsData },
    { name: "Receivables", data: receivablesData },
    { name: "Accounts Payable", data: accountsPayableData },
    { name: "Short-Term Debt", data: shortTermDebtData },
    { name: "Long-Term Debt", data: longTermDebtData },
    { name: "Net Income", data: netIncomeData },
    { name: "Capital Expenditures", data: capitalExpendituresData },
    { name: "Cash & Equivalents", data: cashEquivalentsData },
    //agregados faltaban

    { name: "Total Current Liabilities", data: totalCurrentLiabilitiesData },
    { name: "Total Liabilities", data: totalLiabilitiesData },
    { name: "Retained Earnings", data: retainedEarningsData },
    { name: "Free Cash Flow Per Share", data: freeCashFlowPerShareData },
    { name: "Price", data: priceData },
    { name: "Book Value Per Share", data: bookValuePerShareData },
    { name: "Net Income Growth", data: netIncomeGrowthData },
    { name: "Repurchase of Common Stock", data: repurchaseofCommonStockData },
    { name: "Total Current Assets", data: totalCurrentAssetsData }

    
];



// Validar existencia y valores de los datos necesarios
let valid = true;

requiredFields.forEach(field => {
    // Si no existe field.data, lo forzamos a un objeto con 'values' vacío
    if (!field.data) {
        field.data = { values: {} };
    }

    // Si no existe field.data.values o es null, lo forzamos a {}
    if (!field.data.values) {
        field.data.values = {};
    }

    // A estas alturas field.data.values **siempre** es un objeto (aunque sea vacío).

    // Ahora iteras los períodos que existan en values (si es que hay)
    Object.keys(field.data.values).forEach(period => {
        const rawValue = field.data.values[period];
        const numericValue = parseFloat(rawValue);
        if (isNaN(numericValue)) {
            // Forzamos a 0 si no es numérico
            field.data.values[period] = 0;
        } else {
            // Lo convertimos definitivamente a número
            field.data.values[period] = numericValue;
        }
    });
});


// Detener ejecución si faltan campos necesarios
if (!valid) {
    console.error("[ERROR] Algunos campos esenciales están ausentes o vacíos. No se puede continuar con los cálculos.");
    return {};
}

console.log("[DEBUG] Todos los campos necesarios están presentes y son válidos.");



    // Filtrar períodos válidos (FY XXXX o TTM)
    const validPeriods = Object.keys(revenueData.values).filter(period =>
        /^(FY \d{4}|TTM)$/i.test(period)
    );

    console.log("[DEBUG] Períodos válidos:", validPeriods);

    // Calcular ratios
validPeriods.forEach(period => {
    try {
        // Validar y convertir valores de entrada
        const revenueRaw = revenueData?.values[period];
        const costOfRevenueRaw = costOfRevenueData?.values[period];
        const operatingExpensesRaw = operatingExpensesData?.values[period];
        const grossProfitRaw = grossProfitData?.values[period];
        const interestExpenseRaw = interestExpenseData?.values[period];
        const operatingIncomeRaw = operatingIncomeData?.values[period];
        const pretaxIncomeRaw = pretaxIncomeData?.values[period];
        const incomeTaxExpenseRaw = incomeTaxExpenseData?.values[period];
        const shareholdersEquityRaw = shareholdersEquityData?.values[period];
        const totalAssetsRaw = totalAssetsData?.values[period];
        const receivablesRaw = receivablesData?.values[period];
        const accountsPayableRaw = accountsPayableData?.values[period];
        const shortTermDebtRaw = shortTermDebtData?.values[period];
        const longTermDebtRaw = longTermDebtData?.values[period];
        const netIncomeRaw = netIncomeData?.values[period];
        const capitalExpendituresRaw = capitalExpendituresData?.values[period];
        const cashEquivalentsRaw = cashEquivalentsData?.values[period];
        //faltaban
        // agregados faltaban
        const totalCurrentLiabilitiesRaw = totalCurrentLiabilitiesData?.values[period];
        const totalLiabilitiesRaw = totalLiabilitiesData?.values[period];
        const retainedEarningsRaw = retainedEarningsData?.values[period];
        const freeCashFlowPerShareRaw = freeCashFlowPerShareData?.values[period];
        const priceRaw = priceData?.values[period];
        const bookValuePerShareRaw = bookValuePerShareData?.values[period];
        const netIncomeGrowthRaw = netIncomeGrowthData?.values[period];
        const totalCurrentAssetsRaw = totalCurrentAssetsData?.values[period];
        const repurchaseofCommonStockRaw = repurchaseofCommonStockData?.values[period];
        

        // Convertir a números si son cadenas
        const revenue = typeof revenueRaw === "string" ? parseFloat(revenueRaw.replace(/[%$,]/g, "")) : revenueRaw;
        const costOfRevenue = typeof costOfRevenueRaw === "string" ? parseFloat(costOfRevenueRaw.replace(/[%$,]/g, "")) : costOfRevenueRaw;
        const operatingExpenses = typeof operatingExpensesRaw === "string" ? parseFloat(operatingExpensesRaw.replace(/[%$,]/g, "")) : operatingExpensesRaw;
        const grossProfit = typeof grossProfitRaw === "string" ? parseFloat(grossProfitRaw.replace(/[%$,]/g, "")) : grossProfitRaw;
        const interestExpense = typeof interestExpenseRaw === "string" ? parseFloat(interestExpenseRaw.replace(/[%$,]/g, "")) : interestExpenseRaw;
        const operatingIncome = typeof operatingIncomeRaw === "string" ? parseFloat(operatingIncomeRaw.replace(/[%$,]/g, "")) : operatingIncomeRaw;
        const pretaxIncome = typeof pretaxIncomeRaw === "string" ? parseFloat(pretaxIncomeRaw.replace(/[%$,]/g, "")) : pretaxIncomeRaw;
        const incomeTaxExpense = typeof incomeTaxExpenseRaw === "string" ? parseFloat(incomeTaxExpenseRaw.replace(/[%$,]/g, "")) : incomeTaxExpenseRaw;
        const shareholdersEquity = typeof shareholdersEquityRaw === "string" ? parseFloat(shareholdersEquityRaw.replace(/[%$,]/g, "")) : shareholdersEquityRaw;
        const totalAssets = typeof totalAssetsRaw === "string" ? parseFloat(totalAssetsRaw.replace(/[%$,]/g, "")) : totalAssetsRaw;
        const receivables = typeof receivablesRaw === "string" ? parseFloat(receivablesRaw.replace(/[%$,]/g, "")) : receivablesRaw;
        const accountsPayable = typeof accountsPayableRaw === "string" ? parseFloat(accountsPayableRaw.replace(/[%$,]/g, "")) : accountsPayableRaw;
        const shortTermDebt = typeof shortTermDebtRaw === "string" ? parseFloat(shortTermDebtRaw.replace(/[%$,]/g, "")) : shortTermDebtRaw;
        const longTermDebt = typeof longTermDebtRaw === "string" ? parseFloat(longTermDebtRaw.replace(/[%$,]/g, "")) : longTermDebtRaw;
        const netIncome = typeof netIncomeRaw === "string" ? parseFloat(netIncomeRaw.replace(/[%$,]/g, "")) : netIncomeRaw;
        const capitalExpenditures = typeof capitalExpendituresRaw === "string" ? parseFloat(capitalExpendituresRaw.replace(/[%$,]/g, "")) : capitalExpendituresRaw;
        const cashEquivalents = typeof cashEquivalentsRaw === "string" ? parseFloat(cashEquivalentsRaw.replace(/[%$,]/g, "")) : cashEquivalentsRaw;
        // faltaban

        const totalCurrentLiabilities = typeof totalCurrentLiabilitiesRaw === "string" ? parseFloat(totalCurrentLiabilitiesRaw.replace(/[%$,]/g, "")) : totalCurrentLiabilitiesRaw;
        const totalLiabilities = typeof totalLiabilitiesRaw === "string" ? parseFloat(totalLiabilitiesRaw.replace(/[%$,]/g, "")) : totalLiabilitiesRaw;
        const retainedEarnings = typeof retainedEarningsRaw === "string" ? parseFloat(retainedEarningsRaw.replace(/[%$,]/g, "")) : retainedEarningsRaw;
        const freeCashFlowPerShare = typeof freeCashFlowPerShareRaw === "string" ? parseFloat(freeCashFlowPerShareRaw.replace(/[%$,]/g, "")) : freeCashFlowPerShareRaw;
        const price = typeof priceRaw === "string" ? parseFloat(priceRaw.replace(/[%$,]/g, "")) : priceRaw;
        const bookValuePerShare = typeof bookValuePerShareRaw === "string" ? parseFloat(bookValuePerShareRaw.replace(/[%$,]/g, "")) : bookValuePerShareRaw;
        const netIncomeGrowth = typeof netIncomeGrowthRaw === "string" ? parseFloat(netIncomeGrowthRaw.replace(/[%$,]/g, "")) : netIncomeGrowthRaw;
        const totalCurrentAssets = typeof totalCurrentAssetsRaw === "string" ? parseFloat(totalCurrentAssetsRaw.replace(/[%$,]/g, "")) : totalCurrentAssetsRaw;
        const repurchaseofCommonStock = typeof repurchaseofCommonStockRaw === "string" ? parseFloat(repurchaseofCommonStockRaw.replace(/[%$,]/g, "")) : repurchaseofCommonStockRaw;

        console.log("[DEBUG] repurchaseofCommonStock:", repurchaseofCommonStock);
        console.log("[DEBUG] totalCurrentAssets:", totalCurrentAssets);


        // Validar revenue 
        if (isNaN(revenue) || revenue === 0) {
            console.warn(`[WARN] Revenue no válido para el período ${period}:`, revenueRaw);
            return;
        }

        // Cálculos de ratios
        ratios["Net Earning Ratio (NER)"] = ratios["Net Earning Ratio (NER)"] || {};
        ratios["Net Earning Ratio (NER)"][period] = `${((operatingExpenses / revenue) * 100).toFixed(2)}%`;

        ratios["Cost of Goods Ratio (CGR)"] = ratios["Cost of Goods Ratio (CGR)"] || {};
        ratios["Cost of Goods Ratio (CGR)"][period] = `${((costOfRevenue / revenue) * 100).toFixed(2)}%`;

        ratios["Gross Margin (GPM)"] = ratios["Gross Margin (GPM)"] || {};
        ratios["Gross Margin (GPM)"][period] = grossProfit ? `${((grossProfit / revenue) * 100).toFixed(2)}%` : "N/A";

        ratios["Operating Expenses Ratio (OER)"] = ratios["Operating Expenses Ratio (OER)"] || {};
        ratios["Operating Expenses Ratio (OER)"][period] = grossProfit ? `${((operatingExpenses / grossProfit) * 100).toFixed(2)}%` : "N/A";
//todo ok
        ratios["Interest Expense Ratio (IER)"] = ratios["Interest Expense Ratio (IER)"] || {};
        ratios["Interest Expense Ratio (IER)"][period] = operatingIncome ? `${((interestExpense / operatingIncome) * 100).toFixed(2)}%` : "N/A";

        ratios["Income Taxes Paid Ratio (ITPR)"] = ratios["Income Taxes Paid Ratio (ITPR)"] || {};
        ratios["Income Taxes Paid Ratio (ITPR)"][period] = pretaxIncome ? `${((incomeTaxExpense / pretaxIncome) * 100).toFixed(2)}%` : "N/A";

        ratios["Shareholder Equity Ratio (SHR)"] = ratios["Shareholder Equity Ratio (SHR)"] || {};
        ratios["Shareholder Equity Ratio (SHR)"][period] = totalAssets ? `${((shareholdersEquity / totalAssets) * 100).toFixed(2)}%` : "N/A";
//todo ok
        ratios["Net Receivable Ratio (NRR)"] = ratios["Net Receivable Ratio (NRR)"] || {};
        ratios["Net Receivable Ratio (NRR)"][period] = grossProfit ? `${((receivables / grossProfit) * 100).toFixed(2)}%` : "N/A";
//verificar formula
        ratios["Current Liability Ratio (CR)"] = ratios["Current Liability Ratio (CR)"] || {};
        ratios["Current Liability Ratio (CR)"][period] = grossProfit ? `${((totalCurrentLiabilities / totalCurrentAssets) * 100).toFixed(2)}%` : "N/A";

        ratios["Net Assets Ratio (NAR)"] = ratios["Net Assets Ratio (NAR)"] || {};
        ratios["Net Assets Ratio (NAR)"][period] = totalCurrentAssets ? `${((netIncome / totalAssets) * 100).toFixed(2)}%` : "N/A";

        ratios["Account Payable Ratio (APR)"] = ratios["Account Payable Ratio (APR)"] || {};
        ratios["Account Payable Ratio (APR)"][period] = revenue ? `${((accountsPayable / revenue) * 100).toFixed(2)}%` : "N/A";

        ratios["Short Term Debt Ratio (STDR)"] = ratios["Short Term Debt Ratio (STDR)"] || {};
        ratios["Short Term Debt Ratio (STDR)"][period] = longTermDebt ? `${((shortTermDebt / longTermDebt) * 100).toFixed(2)}%` : "N/A";

        ratios["Long Term Debt Ratio (LTDR)"] = ratios["Long Term Debt Ratio (LTDR)"] || {};
        ratios["Long Term Debt Ratio (LTDR)"][period] = netIncome ? `${((longTermDebt / netIncome) * 100).toFixed(2)}%` : "N/A";

        ratios["Debt to Shareholder equity Ratio (DSER)"] = ratios["Debt to Shareholder equity Ratio (DSER)"] || {};
        ratios["Debt to Shareholder equity Ratio (DSER)"][period] = totalAssets ? `${((shareholdersEquity / totalAssets) * 100).toFixed(2)}%` : "N/A";
        //arreglar el retained//////////////
        ratios["Retained Earning Ratio (RER)"] = ratios["Retained Earning Ratio (RER)"] || {};
        ratios["Retained Earning Ratio (RER)"][period] = netIncome ?`${((capitalExpenditures / netIncome) * 100).toFixed(2)}%` : "N/A";

        ratios["Return on Shareholder Ratio (RSR)"] = ratios["Return on Shareholder Ratio (RSR)"] || {};
        ratios["Return on Shareholder Ratio (RSR)"][period] = netIncome ? `${((shareholdersEquity / netIncome) * 100).toFixed(2)}%` : "N/A";

        ratios["Capital Expenditure Ratio (CER)"] = ratios["Capital Expenditure Ratio (CER)"] || {};
        ratios["Capital Expenditure Ratio (CER)"][period] = netIncome ? `${((capitalExpenditures / netIncome) * 100).toFixed(2)}%` : "N/A";
//revizar esta en la tabla directamente
// Aseguramos la clave en el objeto ratios:
let previousRepurchaseValue; // Inicialmente undefined

// Ordenar los períodos del más reciente (TTM) al más antiguo
const orderedPeriods = [...validPeriods].sort((a, b) => {
  if (a === "TTM") return -1; // TTM siempre primero
  if (b === "TTM") return 1;  // TTM siempre primero
  return parseInt(b.replace("FY ", "")) - parseInt(a.replace("FY ", ""));
});

console.log("Ordered Periods (Most Recent to Oldest):", orderedPeriods); // Verificar el orden correcto
console.log("Values being processed:", repurchaseofCommonStockData.values);

orderedPeriods.forEach((period, index) => {
  // (1) Convertir a número la recompra actual
  const repurchaseRaw = repurchaseofCommonStockData?.values[period];
  const currentRepurchaseValue = typeof repurchaseRaw === "string"
    ? parseFloat(repurchaseRaw.replace(/[%$,]/g, ""))
    : repurchaseRaw;

  console.log(`Processing Period: ${period}`);
  console.log(`  Raw Value: ${repurchaseRaw}`);
  console.log(`  Parsed Value: ${currentRepurchaseValue}`);

  // (2) Asegurar la clave en el objeto ratios
  ratios["Stock BuyBack Ratio (SBR)"] = ratios["Stock BuyBack Ratio (SBR)"] || {};

  // (3) Calcular la variación respecto al período anterior usando la nueva fórmula
  if (
    typeof previousRepurchaseValue === "number" &&
    !isNaN(previousRepurchaseValue) &&
    currentRepurchaseValue !== 0
  ) {
    const yoyChange = ((previousRepurchaseValue - currentRepurchaseValue) / Math.abs(currentRepurchaseValue)) * 100;
    ratios["Stock BuyBack Ratio (SBR)"][period] = yoyChange.toFixed(2) + "%";
    console.log(`  YoY Change (${period}): ${yoyChange.toFixed(2)}%`);
  } else {
    // Asignar "0%" solo si no hay un valor previo
    ratios["Stock BuyBack Ratio (SBR)"][period] = "0%";
    console.log(`  YoY Change (${period}): 0% (No previous value)`);
  }

  // (4) Actualizar el valor anterior para la siguiente iteración
  previousRepurchaseValue = currentRepurchaseValue;
  console.log(`  Updated Previous Value for Next Iteration: ${previousRepurchaseValue}`);
});

// Verificar el objeto final después de todas las iteraciones
console.log("Final Ratios Object:", ratios["Stock BuyBack Ratio (SBR)"]);






//revizar esta en la tabla directamente
        ratios["Free Cash Flow Margin (FCFM)"] = ratios["Free Cash Flow Margin (FCFM)"] || {};
        ratios["Free Cash Flow Margin (FCFM)"][period] = "N/A";

        ratios["Price / book Ratio (PR)"] = ratios["Price / book Ratio (PR)"] || {};
        ratios["Price / book Ratio (PR)"][period] = netIncome ? `${((price / 1) * 100).toFixed(2)}%` : "N/A";
//Revizar esta en la tabla directamente
        ratios["Yearly Growth (YG)"] = ratios["Yearly Growth (YG)"] || {};
        ratios["Yearly Growth (YG)"][period] = "N/A";

        ratios["Operating time ratio (OTR)"] = ratios["Operating time ratio (OTR)"] || {};
        ratios["Operating time ratio (OTR)"][period] = cashEquivalents ? `${((operatingExpenses / cashEquivalents) * 100).toFixed(2)}%` : "N/A";
    } catch (error) {
        console.error(`[ERROR] Error al calcular ratios para el período ${period}:`, error);
    }
});


console.log("[DEBUG] Resultados de cálculos de ratios:", ratios);

// Llamar a la función que renderiza la tabla
if (typeof calculateCompetitiveAdvantages === "function") {
    calculateCompetitiveAdvantages(ratios); // Pasar el objeto correcto
} else {
    console.warn("[WARN] Función 'renderCompetitiveAdvantagesTable' no encontrada.");
}

return ratios;

}
//definir los criterios de las ventajas
// Definición de criterios
const criteria = {
    "Net Earning Ratio (NER)": { low: 30, high: 50, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Cost of Goods Ratio (CGR)": { low: 40, high: 60, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Gross Margin (GPM)": { low: 40, high: 60, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Operating Expenses Ratio (OER)": { low: 30, high: 80, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Interest Expense Ratio (IER)": { low: 7, high: 15, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Income Taxes Paid Ratio (ITPR)": { low: 13, high: 23, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Shareholder Equity Ratio (SHR)": { low: 20, high: 35, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Net Receivable Ratio (NRR)": { low: 20, high: 25, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Current Liability Ratio (CR)": { low: 20, high: 25, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Net Assets Ratio (NAR)": { low: 20, high: 35, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Account Payable Ratio (APR)": { low: 10, high: 25, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Short Term Debt Ratio (STDR)": { low: 80, high: 90, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Long Term Debt Ratio (LTDR)": { low: 3, high: 5, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Debt to Shareholder equity Ratio (DSER)": { low: 70, high: 80, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Retained Earning Ratio (RER)": { low: 100, high: 105, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Return on Shareholder Ratio (RSR)": { low: 10, high: 15, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Capital Expenditure Ratio (CER)": { low: 20, high: 50, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Stock BuyBack Ratio (SBR)": { low: 0.1, high: 3, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Free Cash Flow Margin (FCFM)": { low: 10, high: 15, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Yearly Growth (YG)": { low: 8, high: 12, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
    "Operating time ratio (OTR)": { low: 70, high: 80, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas" },
};

// Función para calcular ventajas competitivas
// Función para calcular ventajas competitivas
function calculateCompetitiveAdvantages(data) {
    console.log("[DEBUG] Iniciando el análisis de ventajas competitivas...");
    console.log("[DEBUG] Datos recibidos:", data);

    const result = {};

    // Validar que los datos sean un objeto
    if (!data || typeof data !== "object") {
        console.error("[ERROR] Los datos proporcionados no son válidos.");
        return result;
    }

    // Procesar cada ratio
    for (const [ratioName, values] of Object.entries(data)) {
        // Validar estructura de los valores
        if (!values || typeof values !== "object") {
            console.warn(`[WARN] Valores no válidos para el ratio: ${ratioName}`);
            continue;
        }

        // Extraer períodos válidos
        const validPeriods = Object.keys(values).filter(period => /^(FY \d{4}|TTM)$/i.test(period));
        console.log(`[DEBUG] Períodos válidos para ${ratioName}:`, validPeriods);

        // Convertir valores de los períodos a numéricos
        const numericValues = validPeriods
            .map(period => parseFloat(values[period]?.replace("%", "") || "NaN"))
            .filter(v => !isNaN(v));

        if (numericValues.length === 0) {
            console.warn(`[WARN] No hay valores numéricos válidos para el ratio: ${ratioName}`);
            continue;
        }

        // Calcular el primer valor (TTM si existe, o el más reciente)
        const firstValue = numericValues[0];
        // Calcular el promedio de los valores
        const average = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;

        // Obtener los criterios para el ratio actual
        const { low, high, colorGreen, colorRed, invert } = criteria[ratioName] || {};
        if (!low || !high || !colorGreen || !colorRed) {
            console.warn(`[WARN] Criterios no configurados para el ratio: ${ratioName}`);
            continue;
        }

        // Evaluar ventajas competitivas para el primer valor
        let competitiveAdvantage = "Sin Configuración";
        let constancia = "Sin Configuración";
        let color = "gray";

        if (invert) {
            if (firstValue >= high) {
                competitiveAdvantage = `${colorGreen}: ${firstValue.toFixed(2)}%`;
                color = "green";
            } else if (firstValue >= low && firstValue < high) {
                competitiveAdvantage = `Normal: ${firstValue.toFixed(2)}%`;
                color = "black";
            } else {
                competitiveAdvantage = `${colorRed}: ${firstValue.toFixed(2)}%`;
                color = "red";
            }
        } else {
            if (firstValue <= low) {
                competitiveAdvantage = `${colorGreen}: ${firstValue.toFixed(2)}%`;
                color = "green";
            } else if (firstValue > low && firstValue <= high) {
                competitiveAdvantage = `Normal: ${firstValue.toFixed(2)}%`;
                color = "black";
            } else {
                competitiveAdvantage = `${colorRed}: ${firstValue.toFixed(2)}%`;
                color = "red";
            }
        }

        // Evaluar constancia (promedio de todos los períodos)
        if (invert) {
            if (average >= high) {
                constancia = `${colorGreen}: ${average.toFixed(2)}%`;
            } else if (average >= low && average < high) {
                constancia = `Normal: ${average.toFixed(2)}%`;
            } else {
                constancia = `${colorRed}: ${average.toFixed(2)}%`;
            }
        } else {
            if (average <= low) {
                constancia = `${colorGreen}: ${average.toFixed(2)}%`;
            } else if (average > low && average <= high) {
                constancia = `Normal: ${average.toFixed(2)}%`;
            } else {
                constancia = `${colorRed}: ${average.toFixed(2)}%`;
            }
        }

        // Log detallado de las evaluaciones
        console.log(
            `[DEBUG] ${ratioName}: Primer Valor: ${firstValue.toFixed(
                2
            )}%, Promedio: ${average.toFixed(2)}%, Ventaja: ${competitiveAdvantage}, Constancia: ${constancia}`
        );

        // Agregar los resultados al objeto final
        result[ratioName] = {
            ...values,
            "Ventajas Competitivas (VC)": { value: competitiveAdvantage, color },
            Constancia: constancia,
        };
    }

    console.log("[DEBUG] Resultados finales de ventajas competitivas:", result);

    // Renderizar la tabla con los resultados
    renderCompetitiveAdvantagesTable(result);

    return result;
}




// Función para renderizar la tabla (usando el resultado de arriba)
function renderCompetitiveAdvantagesTable(data) {
    console.log("[DEBUG] Generando tabla dinámica...");

    const tableContainer = document.querySelector("#ratiosModal .table-responsive");
    if (!tableContainer) {
        console.error("[ERROR] No se encontró el contenedor de la tabla.");
        return;
    }

    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.className = "table table-striped table-bordered";

    const validPeriods = Object.keys(data[Object.keys(data)[0]])
        .filter(key => key !== "Ventajas Competitivas (VC)" && key !== "Constancia" && /^(FY \d{4}|TTM)$/i.test(key));

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Ratio</th>
            ${validPeriods.map(period => `<th>${period}</th>`).join("")}
            <th>Ventajas Competitivas</th>
            <th>Constancia</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const [ratioName, ratioValues] of Object.entries(data)) {
        const row = document.createElement("tr");

        const ratioCell = document.createElement("td");
        ratioCell.textContent = ratioName;
        row.appendChild(ratioCell);

        validPeriods.forEach(period => {
            const valueCell = document.createElement("td");
            valueCell.textContent = ratioValues[period] || "N/A";
            row.appendChild(valueCell);
        });

        // Verificar la existencia de "Ventajas Competitivas (VC)"
        const advantageCell = document.createElement("td");
        if (ratioValues["Ventajas Competitivas (VC)"]) {
            advantageCell.textContent = ratioValues["Ventajas Competitivas (VC)"].value || "N/A";
            advantageCell.style.color = ratioValues["Ventajas Competitivas (VC)"].color || "black";
        } else {
            advantageCell.textContent = "N/A";
        }
        row.appendChild(advantageCell);

        // Verificar la existencia de "Constancia"
        const constanciaCell = document.createElement("td");
        constanciaCell.textContent = ratioValues.Constancia || "N/A";
        row.appendChild(constanciaCell);

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    console.log("[DEBUG] Tabla generada correctamente.");
}












//Maneja apertura de modal ratios
// Obtener referencias a los elementos del DOM
const openButton = document.getElementById("openRatiosModalButton");
const closeButton = document.getElementById("closeRatiosModal");
const modal = document.getElementById("ratiosModal");

// Función para alternar el modal
function toggleModal() {
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "block";
    }
}

// Abrir o cerrar el modal al hacer clic en el botón de abrir
openButton.addEventListener("click", toggleModal);

// Cerrar el modal al hacer clic en el botón "Cerrar" (la "X")
closeButton.addEventListener("click", function () {
    modal.style.display = "none";
});

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});


/**
 * Calcula todos los ratios definidos en ratiosList.
 * @param {Object} tables 
 */


