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
        "Free Cash Flow",
        "Book Value Per Share",
        "Net Income Growth",
        "Total Current Assets",
        "Cash & Equivalents",
        "Shares Change (YoY)",
        "EPS Growth",
        "Net Cash Growth",
        "Operating Cash Flow Growth",
        "Operating Cash Flow",
        "Market Capitalization"

        
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
 // Llamar a la función de normalización
 const normalizedData = normalizeAndValidateData(finalResult);
   

    return finalResult;
}

// 1. Normalización y validación de datos
function normalizeAndValidateData(requiredFields) {
    console.log("[DEBUG] Datos recibidos para normalización:", requiredFields);
    if (!Array.isArray(requiredFields)) {
        console.error("[ERROR] Los datos proporcionados no son un array.");
        return [];
    }

    requiredFields.forEach(field => {
        if (!field.values) {
            field.values = {};
        }

        // Obtener las claves del objeto `values` (los encabezados de los períodos)
        const periods = Object.keys(field.values);

        if (periods.length > 0) {
            const firstHeader = periods[0];
            const isFYFormat = /^FY \d{4}$/.test(firstHeader); // Verifica formato "FY XXXX"

            // Si el primer encabezado no es "TTM" ni sigue el formato "FY XXXX", se sustituye por "TTM"
            if (!isFYFormat && firstHeader !== "TTM") {
                console.warn(`[WARN] Sustituyendo el encabezado '${firstHeader}' por 'TTM'.`);
                const firstValue = field.values[firstHeader]; // Guardar el valor asociado al primer encabezado
                delete field.values[firstHeader]; // Eliminar el encabezado original
                field.values = { TTM: firstValue, ...field.values }; // Insertar "TTM" al inicio con el valor original
            }
        }

        // Normalizar valores numéricos
        Object.keys(field.values).forEach(period => {
            const rawValue = field.values[period];
            const numericValue = parseFloat(rawValue);
            field.values[period] = isNaN(numericValue) ? 0 : numericValue;
        });
    });

    console.log("[DEBUG] Datos normalizados y validados:", requiredFields);

    // Llamar a la función calculateRatios
    const ratios = calculateRatios(requiredFields);
    if (typeof renderRatiosTable === "function") {
        renderRatiosTable(ratios);
    } else {
        console.warn("[WARN] La función 'renderRatiosTable' no está definida.");
    }
    console.log("[DEBUG] Ratios calculados:", ratios);

    // Pasar los ratios calculados a calculateCompetitiveAdvantages
    calculateCompetitiveAdvantages(ratios);

    return requiredFields;
}



// 4. Calcular ratios
function calculateRatios(data) {
    console.log("[DEBUG] Iniciando el cálculo de ratios...");

    const ratios = {};

    // Validar que los datos estén presentes
    if (!data || !Array.isArray(data)) {
        console.error("[ERROR] Los datos proporcionados no son válidos.");
        return {};
    }

    // Mapear datos por sus nombres de campo para fácil acceso
    const fieldsMap = data.reduce((acc, item) => {
        acc[item.field] = item.values || {};
        return acc;
    }, {});

    // Extraer períodos válidos desde "Revenue"
    const revenueData = fieldsMap["Revenue"];
    if (!revenueData) {
        console.error("[ERROR] 'Revenue' no está presente en los datos proporcionados.");
        return {};
    }

    const validPeriods = Object.keys(revenueData).filter(period =>
        /^(FY \d{4}|TTM)$/i.test(period)
    );

    console.log("[DEBUG] Períodos válidos:", validPeriods);

    // Calcular ratios para cada período válido
    validPeriods.forEach(period => {
        try {
            // Extraer valores necesarios para los cálculos
            const revenue = parseFloat(revenueData[period]) || 0;
            const operatingExpenses = parseFloat(fieldsMap["Operating Expenses"]?.[period]) || 0;
            const costOfRevenue = parseFloat(fieldsMap["Cost of Revenue"]?.[period]) || 0;
            const grossProfit = parseFloat(fieldsMap["Gross Profit"]?.[period]) || 0;
            const interestExpense = parseFloat(fieldsMap["Interest Expense"]?.[period]) || 0;
            const operatingIncome = parseFloat(fieldsMap["Operating Income"]?.[period]) || 0;
            const incomeTaxExpense = parseFloat(fieldsMap["Income Tax Expense"]?.[period]) || 0;
            const pretaxIncome = parseFloat(fieldsMap["Pretax Income"]?.[period]) || 0;
            const shareholdersEquity = parseFloat(fieldsMap["Shareholders' Equity"]?.[period]) || 0;
            const totalAssets = parseFloat(fieldsMap["Total Assets"]?.[period]) || 0;
            const receivables = parseFloat(fieldsMap["Receivables"]?.[period]) || 0;
            const accountsPayable = parseFloat(fieldsMap["Accounts Payable"]?.[period]) || 0;
            const shortTermDebt = parseFloat(fieldsMap["Short-Term Debt"]?.[period]) || 0;
            const longTermDebt = parseFloat(fieldsMap["Long-Term Debt"]?.[period]) || 0;
            const netIncome = parseFloat(fieldsMap["Net Income"]?.[period]) || 0;
            const capitalExpenditures = parseFloat(fieldsMap["Capital Expenditures"]?.[period]) || 0;
            const cashEquivalents = parseFloat(fieldsMap["Cash & Equivalents"]?.[period]) || 0;
            const totalCurrentLiabilities = parseFloat(fieldsMap["Total Current Liabilities"]?.[period]) || 0;
            const totalLiabilities = parseFloat(fieldsMap["Total Liabilities"]?.[period]) || 0;
            const retainedEarnings = parseFloat(fieldsMap["Retained Earnings"]?.[period]) || 0;
            const operatingCashFlow = parseFloat(fieldsMap["Operating Cash Flow"]?.[period]) || 0;
            const freeCashFlowPerShare = parseFloat(fieldsMap["Free Cash Flow Per Share"]?.[period]) || 0;
            const totalCurrentAssets = parseFloat(fieldsMap["Total Current Assets"]?.[period]) || 0;
            const sharesChange = parseFloat(fieldsMap["Shares Change (YoY)"]?.[period]) || 0;
            const ePSGrowth = parseFloat(fieldsMap["EPS Growth"]?.[period]) || 0;
            const netCashGrowth = parseFloat(fieldsMap["Net Cash Growth"]?.[period]) || 0;
            const operatingCashFlowGrowth = parseFloat(fieldsMap["Operating Cash Flow Growth"]?.[period]) || 0;
            const marketCapitalization = parseFloat(fieldsMap["Market Capitalization"]?.[period]) || 0;
            const freeCashFlow = parseFloat(fieldsMap["Free Cash Flow"]?.[period]) || 0;
            
            console.log(`[DEBUG] Periodo: ${period}`);
            console.log(`[DEBUG] Raw Value: ${fieldsMap["ePSGrowth"]?.[period]}`);
            console.log(`[DEBUG] Parsed Value ("ePSGrowth"): ${ePSGrowth}`);

            if (revenue === 0) {
                console.warn(`[WARN] Revenue es 0 o no válido para el período ${period}.`);
                return;
            }

            // Cálculos de ratios
            //Calidad de la compania (NIR)
            ratios["Net Income Ratio (NIR)"] = ratios["Net Income Ratio (NIR)"] || {};
            ratios["Net Income Ratio (NIR)"][period] = `${((netIncome / revenue) * 100).toFixed(2)}%`;

            ratios["Net Earning Ratio (NER)"] = ratios["Net Earning Ratio (NER)"] || {};//ok
            ratios["Net Earning Ratio (NER)"][period] = `${((operatingExpenses / revenue) * 100).toFixed(2)}%`;

            ratios["Cost of Goods Ratio (CGR)"] = ratios["Cost of Goods Ratio (CGR)"] || {};//ok
            ratios["Cost of Goods Ratio (CGR)"][period] = `${((costOfRevenue / revenue) * 100).toFixed(2)}%`;

            ratios["Gross Margin (GPM)"] = ratios["Gross Margin (GPM)"] || {};//ok
            ratios["Gross Margin (GPM)"][period] = grossProfit ? `${((grossProfit / revenue) * 100).toFixed(2)}%` : "N/A";

            ratios["Operating Expenses Ratio (OER)"] = ratios["Operating Expenses Ratio (OER)"] || {};//ok
            ratios["Operating Expenses Ratio (OER)"][period] = grossProfit ? `${((operatingExpenses / grossProfit) * 100).toFixed(2)}%` : "N/A";

            ratios["Interest Expense Ratio (IER)"] = ratios["Interest Expense Ratio (IER)"] || {};//ok
            ratios["Interest Expense Ratio (IER)"][period] = operatingIncome ? `${((interestExpense / operatingIncome) * 100).toFixed(2)}%` : "N/A";

            ratios["Income Taxes Paid Ratio (ITPR)"] = ratios["Income Taxes Paid Ratio (ITPR)"] || {};//ok
            ratios["Income Taxes Paid Ratio (ITPR)"][period] = pretaxIncome ? `${((incomeTaxExpense / pretaxIncome) * 100).toFixed(2)}%` : "N/A";

            ratios["Cash Flow from Operating Ratio(COR)"] = ratios["Cash Flow from Operating Ratio(COR)"] || {};//ok
            ratios["Cash Flow from Operating Ratio(COR)"][period] = pretaxIncome ? `${((operatingCashFlow / netIncome) * 100 ).toFixed(2)}%` : "N/A";
            // eficiencia de la compania(SHR)
            ratios["Shareholder Equity Ratio (SHR)"] = ratios["Shareholder Equity Ratio (SHR)"] || {};//ok
            ratios["Shareholder Equity Ratio (SHR)"][period] = totalAssets ? `${((shareholdersEquity / totalAssets) * 100).toFixed(2)}%` : "N/A";

            ratios["Net Receivable Ratio (NRR)"] = ratios["Net Receivable Ratio (NRR)"] || {};//ok
            ratios["Net Receivable Ratio (NRR)"][period] = grossProfit ? `${((receivables / grossProfit) * 100).toFixed(2)}%` : "N/A";

            ratios["Current Liability Ratio (CR)"] = ratios["Current Liability Ratio (CR)"] || {};//ok
            ratios["Current Liability Ratio (CR)"][period] = totalCurrentLiabilities && totalCurrentAssets
                ? `${((totalCurrentLiabilities / totalCurrentAssets) * 100).toFixed(2)}%`
                : "N/A";

            ratios["Net Assets Ratio (NAR)"] = ratios["Net Assets Ratio (NAR)"] || {};//ok
            ratios["Net Assets Ratio (NAR)"][period] = totalAssets ? `${((netIncome / totalAssets) * 100).toFixed(2)}%` : "N/A";

            ratios["Account Payable Ratio (APR)"] = ratios["Account Payable Ratio (APR)"] || {};//ok
            ratios["Account Payable Ratio (APR)"][period] = revenue ? `${((accountsPayable / revenue) * 100).toFixed(2)}%` : "N/A";

            ratios["Short Term Debt Ratio (STDR)"] = ratios["Short Term Debt Ratio (STDR)"] || {};//ok
            ratios["Short Term Debt Ratio (STDR)"][period] = longTermDebt ? `${((shortTermDebt / longTermDebt) * 100).toFixed(2)}%` : "N/A";

            ratios["Long Term Debt Ratio (LTDR)"] = ratios["Long Term Debt Ratio (LTDR)"] || {};//ok
            ratios["Long Term Debt Ratio (LTDR)"][period] = netIncome ? `${((longTermDebt / netIncome) * 100).toFixed(2)}%` : "N/A";

            ratios["Debt to Shareholder Equity Ratio (DSE)"] = ratios["Debt to Shareholder Equity Ratio (DSE)"] || {};//ok
            ratios["Debt to Shareholder Equity Ratio (DSE)"][period] = totalLiabilities ? `${((totalLiabilities / shareholdersEquity) * 100).toFixed(2)}%` : "N/A";

            ratios["Return on Shareholder Ratio (RSR)"] = ratios["Return on Shareholder Ratio (RSR)"] || {};//ok
            ratios["Return on Shareholder Ratio (RSR)"][period] = netIncome ? `${((netIncome  / shareholdersEquity) * 100).toFixed(2)}%` : "N/A";

            ratios["Retained Earning Ratio (RER)"] = ratios["Retained Earning Ratio (RER)"] || {};//ok
            ratios["Retained Earning Ratio (RER)"][period] = netIncome ? `${((retainedEarnings / netIncome) * 100).toFixed(2)}%` : "N/A";

            
            ratios["Capital Expenditure Ratio (CER)"] = ratios["Capital Expenditure Ratio (CER)"] || {};//ok
            ratios["Capital Expenditure Ratio (CER)"][period] = netIncome ? `${((capitalExpenditures / netIncome) * 100).toFixed(2)}%` : "N/A";
             ////////////
             ratios["Shares Change (CSCR)"] = ratios["Shares Change (CSCR)"] || {};//ok
             ratios["Shares Change (CSCR)"][period] = sharesChange ? `${((sharesChange ) * 1).toFixed(2)}%` : "N/A";
            
             
            ratios["Free Cash Flow Per Share (FCFS)"] = ratios["Free Cash Flow Per Share (FCFS)"] || {};//ok
            ratios["Free Cash Flow Per Share (FCFS)"][period] = freeCashFlowPerShare ? `${((freeCashFlowPerShare) * 1).toFixed(2)}%` : "N/A";

            ratios["EPS Growth (YG)"] = ratios["EPS Growth (YG)"] || {};//ok
            ratios["EPS Growth (YG)"][period] = ePSGrowth ? `${((ePSGrowth) * 1).toFixed(2)}%` : "N/A";

            ratios["Operating time ratio (OTR)"] = ratios["Operating time ratio (OTR)"] || {};//ok
            ratios["Operating time ratio (OTR)"][period] = cashEquivalents ? `${(((operatingExpenses * 1.5 )  / cashEquivalents  )*100).toFixed(2)}%` : "N/A"; 
        
            ratios["Net Cash Growth (NCG)"] = ratios["Net Cash Growth (NCG)"] || {};//ok
            ratios["Net Cash Growth (NCG)"][period] = netCashGrowth ? `${((netCashGrowth ) * 1).toFixed(2)}%` : "N/A"; 
        
            ratios["Operating Cash Flow Growth (OCGR)"] = ratios["Operating Cash Flow Growth (OCGR)"] || {};//ok
            ratios["Operating Cash Flow Growth (OCGR)"][period] = operatingCashFlowGrowth ? `${((operatingCashFlowGrowth) * 1).toFixed(2)}%` : "N/A"; 
            //flujo de caja restante Peter Lynch
            ratios["Free Cash Flow Ratio (FCFR)"] = ratios["Free Cash Flow Ratio (FCFR)"] || {};
            ratios["Free Cash Flow Ratio (FCFR)"][period] =  netIncome ? `${((freeCashFlow / marketCapitalization) * 100).toFixed(2)}%` : "N/A";
       

        
        

        } catch (error) {
            console.error(`[ERROR] Error al calcular ratios para el período ${period}:`, error);
        }
    });

    console.log("[DEBUG] Ratios calculados:", ratios);

    return ratios;
}


// 5. Calcular ventajas competitivas
const criteria = {
    
    "Net Income Ratio (NIR)": { low: 10, high: 20, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Net Earning Ratio (NER)": { low: 30, high: 40, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Cost of Goods Ratio (CGR)": { low: 40, high: 60, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Gross Margin (GPM)": { low: 20, high: 40, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter"},
    "Operating Expenses Ratio (OER)": { low: 30, high: 80, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Interest Expense Ratio (IER)": { low: -7, high: -15, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Income Taxes Paid Ratio (ITPR)": { low: 13, high: 23, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Cash Flow from Operating Ratio(COR)": { low: 99, high: 100, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Shareholder Equity Ratio (SHR)": { low: 20, high: 35, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Net Receivable Ratio (NRR)": { low: 20, high: 35, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter"},
    "Current Liability Ratio (CR)": { low: 60, high: 90, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Net Assets Ratio (NAR)": { low: 20, high: 35, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Account Payable Ratio (APR)": { low: 16, high: 25, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Short Term Debt Ratio (STDR)": { low: 80, high: 90, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Long Term Debt Ratio (LTDR)": { low: 3, high: 10, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter"},
    "Debt to Shareholder Equity Ratio (DSE)": { low: 70, high: 80, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter"  },
    "Return on Shareholder Ratio (RSR)": { low: 10, high: 15, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Retained Earning Ratio (RER)": { low: 100, high: 105, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Capital Expenditure Ratio (CER)": { low: 20, high: 50, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Shares Change (CSCR)": { low: -1, high: 0.1, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "lowerBetter" },
    "Free Cash Flow Per Share (FCFS)": { low: 3, high: 5, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "EPS Growth (YG)": { low: 9, high: 11, invert: true, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Operating time ratio (OTR)": { low: 100, high: 150, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Net Cash Growth (NCG)": { low: 5, high: 10, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter" },
    "Operating Cash Flow Growth (OCGR)": { low: 3, high: 5, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter"},
    "Free Cash Flow Ratio (FCFR)": { low: 1, high: 5, colorGreen: "Muchas Ventajas", colorRed: "Pocas Ventajas", evaluationType: "greaterBetter"   },
};

function calculateCompetitiveAdvantages(data) {
    console.log("[DEBUG] Iniciando el análisis de ventajas competitivas...");
    console.log("[DEBUG] Datos recibidos:", data);

    const result = {};
    const consistencies = {};

    for (const [ratioName, values] of Object.entries(data)) {
        console.log(`[DEBUG] Procesando ratio: ${ratioName}, valores:`, values);

        const validPeriods = Object.keys(values).filter(period => /^(FY \d{4}|TTM)$/i.test(period));
        console.log(`[DEBUG] Períodos válidos encontrados para ${ratioName}:`, validPeriods);

        const numericValues = validPeriods
            .map(period => {
                const rawValue = values[period];
                const numericValue = parseFloat(rawValue?.replace("%", "") || "NaN");
                return numericValue;
            })
            .filter(v => !isNaN(v));

        if (numericValues.length === 0) {
            console.warn(`[WARN] No hay valores numéricos válidos para el ratio: ${ratioName}`);
            continue;
        }

        const firstValue = numericValues[0];
        const average = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;

        const { low, high, colorGreen, colorRed, evaluationType } = criteria[ratioName] || {};
        let competitiveAdvantage = "Sin Configuración";
        let constancia = "Sin Configuración";
        let color = "gray";

        if (evaluationType === "greaterBetter") {
            if (firstValue <= low) {
                competitiveAdvantage = `${colorRed}: ${firstValue.toFixed(2)}%`;
                color = "Red";
            } else if (firstValue > low && firstValue <= high) {
                competitiveAdvantage = `Normal: ${firstValue.toFixed(2)}%`;
                color = "Black";
            } else {
                competitiveAdvantage = `${colorGreen}: ${firstValue.toFixed(2)}%`;
                color = "#B8860B";
            }

            if (average <= low) {
                constancia = `${colorRed}: ${average.toFixed(2)}%`;
            } else if (average > low && average <= high) {
                constancia = `Normal: ${average.toFixed(2)}%`;
            } else {
                constancia = `${colorGreen}: ${average.toFixed(2)}%`;
            }
        } else if (evaluationType === "lowerBetter") {
            if (firstValue >= high) {
                competitiveAdvantage = `${colorRed}: ${firstValue.toFixed(2)}%`;
                color = "Red";
            } else if (firstValue >= low && firstValue < high) {
                competitiveAdvantage = `Normal: ${firstValue.toFixed(2)}%`;
                color = "black";
            } else {
                competitiveAdvantage = `${colorGreen}: ${firstValue.toFixed(2)}%`;
                color = "#B8860B";
            }

            if (average >= high) {
                constancia = `${colorRed}: ${average.toFixed(2)}%`;
            } else if (average >= low && average < high) {
                constancia = `Normal: ${average.toFixed(2)}%`;
            } else {
                constancia = `${colorGreen}: ${average.toFixed(2)}%`;
            }
        }

        console.log(
            `[DEBUG] ${ratioName}: Primer Valor: ${firstValue.toFixed(2)}%, Media: ${average.toFixed(2)}%, Ventaja: ${competitiveAdvantage}, Constancia: ${constancia}`
        );

        result[ratioName] = {
            ...values,
            "Ventajas Competitivas (VC)": { value: competitiveAdvantage, color },
            Constancia: constancia
        };

        consistencies[ratioName] = constancia;
    }

    console.log("[DEBUG] Resultados de ventajas competitivas:", result);
    console.log("[DEBUG] Consistencias finales:", consistencies);

    renderCompetitiveAdvantagesTable(result);
    VentajasChart(consistencies);
}



// Función para calcular ventajas competitivas
// Función para calcular ventajas competitivas


// Función para renderizar la tabla (usando el resultado de arriba)
function renderCompetitiveAdvantagesTable(data) {
    console.log("[DEBUG] Generando tabla dinámica...");
    console.log("[DEBUG] Datos recibidos en renderCompetitiveAdvantagesTable:", data);

    if (!data || typeof data !== "object") {
        console.error("[ERROR] Los datos proporcionados no son válidos.");
        return;
    }

    const tableContainer = document.querySelector("#ratiosModal .table-responsive");
    if (!tableContainer) {
        console.error("[ERROR] No se encontró el contenedor de la tabla en el DOM.");
        return;
    }

    tableContainer.innerHTML = ""; // Limpiar cualquier contenido previo

    const table = document.createElement("table");
    table.className = "table table-striped table-bordered";

    // Identificar los períodos válidos
    const firstRatioKey = Object.keys(data)[0];
    const validPeriods = Object.keys(data[firstRatioKey]).filter(
        key => key !== "Ventajas Competitivas (VC)" && key !== "Constancia"
    );

    console.log("[DEBUG] Períodos válidos detectados:", validPeriods);

    // Crear el encabezado de la tabla
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

    // Crear el cuerpo de la tabla
    const tbody = document.createElement("tbody");
    for (const [ratioName, ratioValues] of Object.entries(data)) {
        const row = document.createElement("tr");

        // Celda del nombre del ratio
        const ratioCell = document.createElement("td");
        ratioCell.textContent = ratioName;
        row.appendChild(ratioCell);

        // Celdas de los valores por período
        validPeriods.forEach(period => {
            const valueCell = document.createElement("td");
            valueCell.textContent = ratioValues[period] || "N/A";
            row.appendChild(valueCell);
        });

        // Celda de Ventajas Competitivas
        const advantageCell = document.createElement("td");
        if (ratioValues["Ventajas Competitivas (VC)"]) {
            advantageCell.textContent = ratioValues["Ventajas Competitivas (VC)"].value || "N/A";
            advantageCell.style.color = ratioValues["Ventajas Competitivas (VC)"].color || "black";
        } else {
            advantageCell.textContent = "N/A";
        }
        row.appendChild(advantageCell);

        // Celda de Constancia
        const constanciaCell = document.createElement("td");
        constanciaCell.textContent = ratioValues.Constancia || "N/A";
        row.appendChild(constanciaCell);

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    console.log("[DEBUG] Tabla generada correctamente.");
}

//Renderiza grafico de ventajas competitivas.
function VentajasChart(consistencies) {
    console.log("[DEBUG] Datos recibidos para el gráfico:", consistencies);

    // Parsear los valores relevantes
    const parseValue = (input) => {
        const match = input.match(/-?\d+(\.\d+)?/); // Extrae el número de la cadena
        return match ? parseFloat(match[0]) : NaN;
    };

    const extractCategory = (input) => {
        if (input.includes("Muchas Ventajas")) return "Muchas Ventajas";
        if (input.includes("Pocas Ventajas")) return "Pocas Ventajas";
        if (input.includes("Normal")) return "Normal";
        return "Sin categoría";
    };

    const extractColor = (category) => {
        if (category === "Muchas Ventajas") return "#B8860B";
        if (category === "Pocas Ventajas") return "red";
        if (category === "Normal") return "blue";
        return "gray";
    };

    const nerText = extractCategory(consistencies["Net Income Ratio (NIR)"] || "");
    const nrrText = extractCategory(consistencies["Shareholder Equity Ratio (SHR)"] || "");
    const ocgrText = extractCategory(consistencies["EPS Growth (YG)"] || "");

    const nerValue = parseValue(consistencies["Net Income Ratio (NIR)"] || "");
    const nrrValue = parseValue(consistencies["Shareholder Equity Ratio (SHR)"] || "");
    const ocgrValue = parseValue(consistencies["EPS Growth (YG)"] || "");

    // Calcular el porcentaje de "Muchas Ventajas"
    const categoriesList = Object.values(consistencies).map(value => extractCategory(value));
    const totalRatios = categoriesList.length;
    const manyAdvantagesCount = categoriesList.filter(category => category === "Muchas Ventajas").length;
    const manyAdvantagesPercentage = (manyAdvantagesCount / totalRatios) * 100;

    // Determinar la categoría de "Ventajas Competitivas" según el porcentaje
    const advantagesCategory = 
        manyAdvantagesPercentage > 70 ? "Muchas Ventajas" :
        manyAdvantagesPercentage >= 50 ? "Normal" :
        "Pocas Ventajas";

    console.log("[DEBUG] Porcentaje de 'Muchas Ventajas':", manyAdvantagesPercentage.toFixed(2));
    console.log("[DEBUG] Categorías calculadas:", categoriesList);

    // Validar datos antes de graficar
    if (isNaN(nerValue) || isNaN(nrrValue) || isNaN(ocgrValue) || isNaN(manyAdvantagesPercentage)) {
        console.error("[ERROR] Algunos valores no son válidos. Revisa los datos.");
        return;
    }

    // Datos para el gráfico
    const labels = ["Calidad(NIR)", "Eficiencia(SHR)", "Crecimiento(YG)", "Ventajas Competitivas"];
    const data = [nerValue, nrrValue, ocgrValue, manyAdvantagesPercentage];
    const colors = [
        extractColor(nerText),
        extractColor(nrrText),
        extractColor(ocgrText),
        extractColor(advantagesCategory)
    ];

    // Seleccionar el lienzo en el HTML
    const ctx = document.getElementById("ventajaschart").getContext("2d");

    // Crear el gráfico
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Ventajas Competitivas (%)",
                    data: data,
                    backgroundColor: colors, // Colores dinámicos según la categoría
                    borderColor: colors.map(color => shadeColor(color, -20)), // Bordes más oscuros del color base
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        generateLabels: () => [
                            { text: "Excelente", fillStyle: "#B8860B" },
                            { text: "Mediocre", fillStyle: "red" },
                            { text: "Normal", fillStyle: "blue" },
                        ],
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    console.log("[DEBUG] Gráfico renderizado exitosamente.");

    // Invocar ScoreCalculate con las categorías
    const finalCategories = [nerText, nrrText, ocgrText, advantagesCategory];
    console.log("[DEBUG] Categorías enviadas a ScoreCalculate:", finalCategories);
    ScoreCalculate(finalCategories);
}


// Función para oscurecer los colores de los bordes
function shadeColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
    return `rgb(${Math.min(255, Math.max(0, R))}, ${Math.min(255, Math.max(0, G))}, ${Math.min(255, Math.max(0, B))})`;
}

// Calcula el Score de la inversión
function ScoreCalculate(categories) {
    console.log("[DEBUG] Categorías recibidas para evaluación:", categories);

    // Contar cada tipo de categoría
    const goldCount = categories.filter(category => category === "Muchas Ventajas").length;
    const azulCount = categories.filter(category => category === "Normal").length;
    const rojoCount = categories.filter(category => category === "Pocas Ventajas").length;

    console.log("[DEBUG] Conteo - Gold:", goldCount, "Azul:", azulCount, "Rojo:", rojoCount);

    // Determinar la clasificación
    let score, color, message;

    if (goldCount === 4 && azulCount === 0 && rojoCount === 0) {
        score = "Score: A Plus,";
        color = "green"; // Dorado para A Plus
        message = "Inversión de Alta Seguridad";
    } else if (rojoCount === 2) {
        score = "Score: B,";
        color = "blue"; // Azul para B
        message = "Inversión de Medio Riesgo";
    } else if (rojoCount > 2) {
        score = "Score: C,";
        color = "red"; // Rojo para C
        message = "Inversión de Alto Riesgo";
    } else {
        score = "Score: A,";
        color = "green"; // Oro oscuro para A
        message = "Inversión de Bajo Riesgo";
    }

    console.log("[DEBUG] Calificación calculada:", score, "Color asignado:", color, "Mensaje:", message);

    // Actualizar el DOM con la calificación y el color
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerHTML = `
            <span style="font-size: 1.2em; font-weight: bold; color: ${color};">
                ${score}
            </span>`;
    } else {
        console.error("[ERROR] Elemento con ID 'score' no encontrado en el DOM.");
    }

    // Actualizar el DOM con el mensaje de seguridad de inversión
    const seguridadElement = document.getElementById("seguridadinversion");
    if (seguridadElement) {
        seguridadElement.innerHTML = `
            <span style="font-size: 1em; color: ${color};">
                ${message}
            </span>`;
    } else {
        console.error("[ERROR] Elemento con ID 'seguridadinversion' no encontrado en el DOM.");
    }
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


