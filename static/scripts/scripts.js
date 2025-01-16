// -------------------------
// script.js (OPTIMIZADO)
// -------------------------

// Sección de manejo de modales
document.addEventListener('DOMContentLoaded', function () {
    console.log("Inicializando eventos de modales...");

    function initializeModalEvents() {
        console.log("Reiniciando configuración de eventos...");

        // Obtener elementos del DOM
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const openLoginBtn = document.getElementById('openLogin');
        const openSignupBtn = document.getElementById('openSignup');
        const closeLoginSpan = document.getElementById('closeLogin');
        const closeSignupSpan = document.getElementById('closeSignup');

        // Función para abrir un modal
        function openModal(modal) {
            if (modal) {
                modal.style.display = "block";
                console.log(`Modal abierto: ${modal.id}`);
            } else {
                console.error('Modal no encontrado.');
            }
        }

        // Función para cerrar un modal
        function closeModal(modal) {
            if (modal) {
                modal.style.display = "none";
                console.log(`Modal cerrado: ${modal.id}`);
            } else {
                console.error('Modal no encontrado.');
            }
        }

        // Registrar eventos de apertura
        if (openLoginBtn && loginModal) {
            openLoginBtn.onclick = function () {
                openModal(loginModal);
            };
        }

        if (openSignupBtn && signupModal) {
            openSignupBtn.onclick = function () {
                openModal(signupModal);
            };
        }

        // Registrar eventos de cierre
        if (closeLoginSpan && loginModal) {
            closeLoginSpan.onclick = function () {
                closeModal(loginModal);
            };
        }

        if (closeSignupSpan && signupModal) {
            closeSignupSpan.onclick = function () {
                closeModal(signupModal);
            };
        }

        // Cerrar modal al hacer clic fuera de él
        window.onclick = function (event) {
            if (event.target === loginModal) {
                closeModal(loginModal);
            }
            if (event.target === signupModal) {
                closeModal(signupModal);
            }
        };
    }

    // Llama a la función de inicialización al cargar el DOM
    initializeModalEvents();

    // Reasignar eventos al hacer clic en "Login" o "Signup"
    document.addEventListener('click', function (event) {
        if (event.target && (event.target.id === 'openLogin' || event.target.id === 'openSignup')) {
            console.log("Reasignando eventos de modal...");
            initializeModalEvents();
        }
    });

    // Verificar y abrir modal según mensajes flash
    function checkFlashMessages() {
        const flashElements = document.querySelectorAll('.flash');
        flashElements.forEach(element => {
            if (element.classList.contains('login_error')) {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = "block";
                }
            }
            if (element.classList.contains('signup_error')) {
                const signupModal = document.getElementById('signupModal');
                if (signupModal) {
                    signupModal.style.display = "block";
                }
            }
        });
    }

    // Ejecutar verificación de mensajes flash
    checkFlashMessages();
});

function reassignModalEvents() {
    console.log("Reasignando eventos de modales...");
    const openLoginBtn = document.getElementById('openLogin');
    const openSignupBtn = document.getElementById('openSignup');

    if (openLoginBtn) {
        openLoginBtn.onclick = function () {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = "block";
            }
        };
    }

    if (openSignupBtn) {
        openSignupBtn.onclick = function () {
            const signupModal = document.getElementById('signupModal');
            if (signupModal) {
                signupModal.style.display = "block";
            }
        };
    }
}

// -------------------------------------------------
// Calcula el PER actual y estiliza el resultado
// -------------------------------------------------
function calcularPerActualDesdeTabla() {
    console.log("[LOG INFO] Iniciando cálculo del PER Actual.");

    // Obtener elementos necesarios del DOM
    const epsElement = document.getElementById("eps-actual");
    const precioElement = document.getElementById("current-price");
    const perElement = document.getElementById("per-actual");
    const perMedioElement = document.querySelector("#per-medio span:nth-child(2)");
    const perMinElement = document.querySelector("#per-medio span:nth-child(1)");
    const perMaxElement = document.querySelector("#per-medio span:nth-child(3)");

    // Validar si los elementos existen en el DOM
    if (!epsElement) {
        console.error("[LOG ERROR] Elemento con ID 'eps-actual' no encontrado en el DOM.");
    }
    if (!precioElement) {
        console.error("[LOG ERROR] Elemento con ID 'current-price' no encontrado en el DOM.");
    }
    if (!perElement) {
        console.error("[LOG ERROR] Elemento con ID 'per-actual' no encontrado en el DOM.");
    }
    if (!perMedioElement) {
        console.error("[LOG ERROR] Elemento '#per-medio span:nth-child(2)' no encontrado en el DOM.");
    }
    if (!perMinElement) {
        console.error("[LOG ERROR] Elemento '#per-medio span:nth-child(1)' no encontrado en el DOM.");
    }
    if (!perMaxElement) {
        console.error("[LOG ERROR] Elemento '#per-medio span:nth-child(3)' no encontrado en el DOM.");
    }

    if (!epsElement || !precioElement || !perElement || 
        !perMedioElement || !perMinElement || !perMaxElement) {
        console.warn("[LOG WARNING] Uno o más elementos necesarios para calcular el PER no se encontraron en el DOM.");
        return;
    }

    // Extraer y convertir valores a números
    const epsText = epsElement.textContent.trim();
    const precioText = precioElement.textContent.trim();
    const perMedioText = perMedioElement.textContent.trim();
    const perMinText = perMinElement.textContent.trim();
    const perMaxText = perMaxElement.textContent.trim();

    console.log(`[LOG INFO] Texto extraído - EPS: '${epsText}', Precio: '${precioText}', PER Min: '${perMinText}', PER Medio: '${perMedioText}', PER Max: '${perMaxText}'`);

    // Función para limpiar y convertir texto a número
    function limpiarYConvertir(texto) {
        // Eliminar símbolos como '$' y ',' y convertir a número
        const textoLimpio = texto.replace(/[$,]/g, '');
        const numero = parseFloat(textoLimpio);
        console.log(`[LOG DEBUG] Texto limpiado: '${textoLimpio}', Número convertido: ${numero}`);
        return numero;
    }

    const eps = limpiarYConvertir(epsText);
    const precio = limpiarYConvertir(precioText);
    const perMedio = limpiarYConvertir(perMedioText);
    const perMin = limpiarYConvertir(perMinText);
    const perMax = limpiarYConvertir(perMaxText);

    console.log(`[LOG INFO] Valores numéricos - EPS: ${eps}, Precio: ${precio}, PER Min: ${perMin}, PER Medio: ${perMedio}, PER Max: ${perMax}`);

    // Validar valores de EPS y Precio para el cálculo
    if (!isNaN(eps) && !isNaN(precio) && eps > 0) {
        const perActual = (precio / eps).toFixed(2);
        console.log(`[LOG INFO] PER Actual calculado: ${perActual}`);

        // Determinar el color más cercano
        let color = "blue"; // Por defecto el color será azul (Medio)
        const diferenciaMin = Math.abs(perActual - perMin);
        const diferenciaMedio = Math.abs(perActual - perMedio);
        const diferenciaMax = Math.abs(perActual - perMax);

        console.log(`[LOG DEBUG] Diferencias - PER Actual vs PER Min: ${diferenciaMin}, PER Actual vs PER Medio: ${diferenciaMedio}, PER Actual vs PER Max: ${diferenciaMax}`);

        if (diferenciaMin < diferenciaMedio && diferenciaMin < diferenciaMax) {
            color = "#B8860B";
        } else if (diferenciaMax < diferenciaMedio && diferenciaMax < diferenciaMin) {
            color = "red";
        }

        console.log(`[LOG INFO] Color determinado para PER Actual: ${color}`);

        // Aplicar estilo al PER Actual
        perElement.textContent = perActual;
        perElement.style.color = color; 
        perElement.style.fontSize = "1.2em"; 
        perElement.style.fontWeight = "bold"; 
        console.info(`[LOG INFO] PER Actual actualizado en el DOM: ${perActual} con color ${color}`);
    } else {
        perElement.textContent = "N/A";
        perElement.style.color = "black";
        perElement.style.fontSize = "1em"; 
        console.warn(`[LOG WARNING] No se pudo calcular el PER Actual. Valores inválidos - EPS: ${eps}, Precio: ${precio}`);
    }
}


// Ejecutar la función al cargar el DOM
document.addEventListener("DOMContentLoaded", calcularPerActualDesdeTabla);

// -------------------------------------------------
// Cálculo y gráfico de Valor Intrínseco
// -------------------------------------------------
let valorIntrinsecoMin = null;
let valorIntrinsecoMedio = null;
let valorIntrinsecoMax = null;

function calcularValoresIntrinsecos() {
    const epsElement = document.getElementById('eps-actual');
    const perMinElement = document.getElementById('per-min');
    const perMedioElement = document.getElementById('per-medio-value');
    const perMaxElement = document.getElementById('per-max');
    const valorIntrinsecoElement = document.getElementById('valor-intrinseco');
    const valorIntrinsecoPLElement = document.getElementById('valor-intrinseco-pl'); // Nuevo elemento PL
    const valorIntrinsecoWBElement = document.getElementById('valor-intrinseco-wb'); // Nuevo elemento WB

    if (!epsElement || !perMinElement || !perMedioElement || !perMaxElement || !valorIntrinsecoElement ||
        !valorIntrinsecoPLElement || !valorIntrinsecoWBElement) {
        console.warn('[LOG WARNING] Uno o más elementos necesarios no se encontraron en el DOM.');
        return;
    }

    const eps = parseFloat(epsElement.textContent.trim()) || 0;
    const perMin = parseFloat(perMinElement.textContent.trim()) || 0;
    const perMedio = parseFloat(perMedioElement.textContent.trim()) || 0;
    const perMax = parseFloat(perMaxElement.textContent.trim()) || 0;

    if (eps > 0) {
        // Cálculos estándar cuando el EPS es positivo
        const valorIntrinsecoMin = eps * perMin;
        const valorIntrinsecoMedio = eps * perMedio;
        const valorIntrinsecoMax = eps * perMax;

        // Nuevos cálculos para PL y WB
        const valorIntrinsecoPL = valorIntrinsecoMedio * 1.1; // Ejemplo: PL 10% superior al valor medio
        const valorIntrinsecoWB = valorIntrinsecoMax * 1.2;  // Ejemplo: WB 20% superior al valor máximo

        console.info(`[LOG INFO] Valor Intrínseco Min: ${valorIntrinsecoMin.toFixed(2)}`);
        console.info(`[LOG INFO] Valor Intrínseco Medio: ${valorIntrinsecoMedio.toFixed(2)}`);
        console.info(`[LOG INFO] Valor Intrínseco Max: ${valorIntrinsecoMax.toFixed(2)}`);
        console.info(`[LOG INFO] Valor Intrínseco PL: ${valorIntrinsecoPL.toFixed(2)}`);
        console.info(`[LOG INFO] Valor Intrínseco WB: ${valorIntrinsecoWB.toFixed(2)}`);

        // Actualizar valores en el DOM
        valorIntrinsecoElement.textContent = `$${valorIntrinsecoMedio.toFixed(2)}`;
        valorIntrinsecoPLElement.textContent = `$${valorIntrinsecoPL.toFixed(2)}`;
        valorIntrinsecoWBElement.textContent = `$${valorIntrinsecoWB.toFixed(2)}`;

        // Pasar los 5 valores a la función del gráfico
        crearGraficoValorIntrinseco(valorIntrinsecoMin, valorIntrinsecoMedio, valorIntrinsecoMax, valorIntrinsecoPL, valorIntrinsecoWB);
    } else {
        // Manejo de EPS negativos
        console.warn(`[LOG WARNING] EPS es negativo (${eps}). No se pueden calcular valores intrínsecos.`);
        valorIntrinsecoElement.textContent = 'EPS Negativo';
        valorIntrinsecoPLElement.textContent = 'EPS Negativo';
        valorIntrinsecoWBElement.textContent = 'EPS Negativo';

        // Mostrar mensaje adicional en el DOM
        const mensaje = `El EPS actual (${eps.toFixed(2)}) es negativo. No es posible calcular valores intrínsecos.`;
        console.warn(mensaje);

        // Limpiar el gráfico si no hay valores válidos
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer) chartContainer.innerHTML = '';
    }
}


//Crea grafico de linea para ver la pocision actual del precio
function crearGraficoValorIntrinseco() {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
        console.warn("[LOG WARNING] No se encontró el contenedor del gráfico.");
        return;
    }

    // Obtener valores necesarios desde el DOM
    const epsElement = document.getElementById('eps-actual');
    const perActualElement = document.getElementById('per-actual');
    const perMinElement = document.getElementById('per-min');
    const perMedioElement = document.getElementById('per-medio-value');
    const perMaxElement = document.getElementById('per-max');

    if (!epsElement || !perActualElement || !perMinElement || !perMedioElement || !perMaxElement) {
        console.error("[ERROR] Faltan elementos necesarios en el DOM para calcular el gráfico.");
        return;
    }

    const eps = parseFloat(epsElement.textContent.trim());
    const perActual = parseFloat(perActualElement.textContent.trim());
    const perMin = parseFloat(perMinElement.textContent.trim());
    const perMedio = parseFloat(perMedioElement.textContent.trim());
    const perMax = parseFloat(perMaxElement.textContent.trim());

    if (isNaN(eps) || isNaN(perActual) || isNaN(perMin) || isNaN(perMedio) || isNaN(perMax)) {
        console.warn("[LOG WARNING] Uno o más valores no son válidos.");
        return;
    }

    // Calcular los valores dinámicos de Min, Medio, Max, PL y WB
    const valorMin = Math.max(eps * perMin, 0);
   const valorMax = eps * perMax;
    // Validar perMedio: si es negativo, usar 1 en; de lo contrario, usar su valor
    const perValido = perMedio < 0 ? 1 : perMedio;

    // Calcular valorMedio, valorPL y valorWB usando perValido
    const valorMedio = eps * perValido;
    const valorPL = eps * (perValido > 30 ? 30 : perValido); // PL calculado
    const valorWB = eps * (perValido > 30 ? 30 : perValido); // WB calculado


    console.log(`[DEBUG] Valores calculados: Min=${valorMin}, Medio=${valorMedio}, Max=${valorMax}, PL=${valorPL}, WB=${valorWB}, EPS=${eps}`);

    // Actualizar el DOM con el valor intrínseco medio
    const valorIntrinsecoElement = document.getElementById('valor-intrinseco');
    if (valorIntrinsecoElement) {
        valorIntrinsecoElement.textContent = `$${valorMedio.toFixed(2)}`;
    } else {
        console.warn("[LOG WARNING] No se encontró el elemento 'valor-intrinseco' en el DOM.");
    }

    // Calcular posiciones relativas en porcentaje
    // Determinar el valor mínimo y máximo entre todos
const globalMin = Math.min(valorMin, valorMedio, valorMax, valorPL, valorWB, );
const globalMax = Math.max(valorMin, valorMedio, valorMax, valorPL, valorWB);

// Calcular posiciones relativas basadas en los límites globalMin y globalMax
const medioPos = ((valorMedio - globalMin) / (globalMax - globalMin)) * 100;
const maxPos = ((valorMax - globalMin) / (globalMax - globalMin)) * 100;
const posMin = ((valorMin - globalMin) / (globalMax - globalMin)) * 100;
const posPL = ((valorPL - globalMin) / (globalMax - globalMin)) * 100;
const posWB = ((valorWB - globalMin) / (globalMax - globalMin)) * 100;
const posPrice = Math.max(
    Math.min(((eps * perActual - globalMin) / (globalMax - globalMin)) * 100, 100),
    0
);

console.log(`[DEBUG] Posiciones calculadas: Min=${posMin}%, Medio=${medioPos}%, Max=${maxPos}%, PL=${posPL}%, WB=${posWB}%, Precio=${posPrice}%`);

    // Limpiar el contenedor antes de crear el gráfico
    chartContainer.innerHTML = '';

    // Crear etiquetas para Min, Medio, Max, PL y WB
    const labelsContainer = document.createElement('div');
    labelsContainer.style.position = 'relative';
    labelsContainer.style.width = '100%';
    labelsContainer.style.height = '40px';

    const labelMin = document.createElement('span');
    labelMin.style.position = 'absolute';
    labelMin.style.left = `${posMin}%`;
    labelMin.style.color = '#B8860B';
    labelMin.style.transform = 'translateX(-50%)';
    labelMin.style.bottom = '-5px'; // Cambia '10px' por el valor deseado
    labelMin.textContent = `Min:$${valorMin.toFixed(2)}`;

    const labelMedio = document.createElement('span');
    labelMedio.style.position = 'absolute';
    labelMedio.style.left = `${medioPos}%`;
    labelMedio.style.color = 'blue';
    labelMedio.style.fontWeight = 'bold';
    labelMedio.style.transform = 'translateX(-50%)';
    labelMedio.style.bottom = '-25px'; // Cambia '10px' por el valor deseado
    labelMedio.innerHTML = `
     <img src="/static/int.png" alt="WB Icon" style="width: 16px; height: 16px; margin-left: 5px;">: $${valorMedio.toFixed(2)} 
   `;

    const labelMax = document.createElement('span');
    labelMax.style.position = 'absolute';
    labelMax.style.left = `${maxPos}%`;
    labelMax.style.color = 'red';
    labelMax.style.transform = 'translateX(-50%)';
    labelMax.style.bottom = '-5px'; // Cambia '10px' por el valor deseado
    labelMax.textContent = `Max:$${valorMax.toFixed(2)}`;

    const labelPL = document.createElement('span');
    labelPL.style.position = 'absolute';
    labelPL.style.left = `${posPL}%`;
    labelPL.style.color = 'purple';
    labelPL.style.transform = 'translateX(-50%)';
    labelPL.style.bottom = '-60px'; // Cambia '10px' por el valor deseado
    labelPL.innerHTML = `
     <img src="/static/pl.png" alt="WB Icon" style="width: 16px; height: 16px; margin-left: 5px;">: $${valorPL.toFixed(2)} 
   `;
    

    const labelWB = document.createElement('span');
    labelWB.style.position = 'absolute';
    labelWB.style.left = `${posWB}%`;
    labelWB.style.color = 'orange';
    labelWB.style.transform = 'translateX(-50%)';
    labelWB.style.bottom = '-43px'; // Cambia '10px' por el valor deseado
    labelMax.style.alignItems = 'left'; // Asegura la alineación vertical
    labelWB.innerHTML = `
     <img src="/static/wb2.png" alt="WB Icon" style="width: 16px; height: 16px; margin-left: 5px;">: $${valorWB.toFixed(2)} 
   `;

    labelsContainer.appendChild(labelMin);
    labelsContainer.appendChild(labelMedio);
    labelsContainer.appendChild(labelMax);
    labelsContainer.appendChild(labelPL);
    labelsContainer.appendChild(labelWB);
    chartContainer.appendChild(labelsContainer);

    console.log("[DEBUG] Etiquetas de valores intrínsecos añadidas al gráfico.");

    // Crear las líneas (Min-Medio, Medio-Max)
    const linesContainer = document.createElement('div');
    linesContainer.style.position = 'relative';
    linesContainer.style.width = '100%';
    linesContainer.style.height = '5px';
    
    // Línea verde: desde 0% hasta el valor intrínseco medio
    const lineMinToMedio = document.createElement('div');
    lineMinToMedio.style.position = 'absolute';
    lineMinToMedio.style.left = `0%`; // Siempre comienza en 0%
    lineMinToMedio.style.width = `${((valorMedio - globalMin) / (globalMax - globalMin)) * 100}%`; // Hasta el valor medio
    lineMinToMedio.style.height = '5px';
    lineMinToMedio.style.backgroundColor = '#B8860B';
    linesContainer.appendChild(lineMinToMedio);
    
    // Línea roja: desde el valor intrínseco medio hasta 100%
    const lineMedioToMax = document.createElement('div');
    lineMedioToMax.style.position = 'absolute';
    lineMedioToMax.style.left = `${((valorMedio - globalMin) / (globalMax - globalMin)) * 100}%`; // Comienza en el valor medio
    lineMedioToMax.style.width = `${((globalMax - valorMedio) / (globalMax - globalMin)) * 100}%`; // Hasta el final (100%)
    lineMedioToMax.style.height = '5px';
    lineMedioToMax.style.backgroundColor = 'red';
    linesContainer.appendChild(lineMedioToMax);
    
    // Agregar las líneas al contenedor principal
    chartContainer.appendChild(linesContainer);
    
    console.log("[DEBUG] Líneas añadidas: verde (0% a intrínseco medio), roja (intrínseco medio a 100%).");
    
    // Crear marcador para el precio actual
    const priceMarker = document.createElement('div');
    priceMarker.style.position = 'relative';
    priceMarker.style.left = `${posPrice}%`;
    priceMarker.style.bottom = '53px';
    priceMarker.style.transform = 'translateX(-50%)';
    priceMarker.style.color = 'black';
    priceMarker.style.fontWeight = 'bold';
    priceMarker.style.fontSize = '12px';
    priceMarker.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 14px; color: black; font-weight: bold;">Price:$${(eps * perActual).toFixed(2)}</span>
            <span class="price-marker-icon" style="font-size: 24px;">📍</span>
        </div>
    `;
    chartContainer.appendChild(priceMarker);
    

    console.log(`[DEBUG] Marcador del precio actual creado en posición: ${posPrice}%`);
}


// Inicializar el gráfico al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    crearGraficoValorIntrinseco();
});
//mostrar mesaje de precaucion de inversion
// Manejador para mostrar/ocultar la sección de detalles y generar mensaje de inversión
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el botón "Ver Detalles"
    const toggleBtn = document.getElementById('toggle-table-link');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Obtener el contenedor de evaluación
            const evaluationContainer = document.getElementById('evaluation-container');
            const isHidden = evaluationContainer.style.display === 'none' || evaluationContainer.style.display === '';

            // Alternar visibilidad del contenedor
            evaluationContainer.style.display = isHidden ? 'block' : 'none';

            // Si mostramos el contenedor, generamos el mensaje de inversión
            if (isHidden) {
                mostrarMensajeInversion(); // Llamar a la función para mostrar el mensaje
            }
        });
    }
});

// Función para mostrar el mensaje de inversión basado en los valores del DOM
function mostrarMensajeInversion() {
    const valorIntrinsecoElement = document.getElementById('valor-intrinseco');
    const precioActualElement = document.getElementById('current-price');
    const perMedioElement = document.getElementById('per-medio-value');
    const mensajeInversionElement = document.getElementById('mensaje-inversion');
    const mensajeTextoElement = document.getElementById('mensaje-texto');
    const mensajeIconoElement = document.getElementById('mensaje-icono'); // Icono dinámico

    // Verificar que los elementos necesarios existan
    if (!valorIntrinsecoElement || !precioActualElement || !perMedioElement || !mensajeInversionElement || !mensajeTextoElement || !mensajeIconoElement) {
        console.warn('[LOG WARNING] No se encontraron uno o más elementos necesarios para mostrar el mensaje.');
        return;
    }

    // Obtener los valores del DOM
    const valorIntrinseco = parseFloat(valorIntrinsecoElement.textContent.replace('$', '').trim()) || 0;
    const precioActual = parseFloat(precioActualElement.textContent.replace('$', '').replace(',', '').trim()) || 0;
    const perMedio = parseFloat(perMedioElement.textContent.trim()) || 0;

    console.log(`[DEBUG] Valores: Valor Intrínseco=${valorIntrinseco}, Precio Actual=${precioActual}, PER Medio=${perMedio}`);

    // Determinar el mensaje según la lógica
    let mensaje = '';
    let tipo = '';
    let icono = '';

    if (valorIntrinseco > precioActual && perMedio < 30) {
        const descuentoPorcentual = (((valorIntrinseco - precioActual) / valorIntrinseco) * 100).toFixed(2);
        mensaje = `Al precio actual de $${precioActual.toFixed(2)}, la acción podría representar una buena inversión a largo plazo ya que tiene un descuento del ${descuentoPorcentual}% respecto al valor intrínseco en el corto plazo.`;
        tipo = 'alert-success';
        icono = 'fas fa-check-circle'; // Éxito
    } else if (valorIntrinseco > precioActual && perMedio >= 30) {
        const porcentajeRespecto = (((valorIntrinseco/ precioActual )-1) * 100).toFixed(2);
        mensaje = `¡Precaución! A pesar de que el precio actual de $${precioActual.toFixed(2)} está a ${porcentajeRespecto}% por debajo del valor intrínseco en el corto plazo, esta acción ha tenido mucha expectativa en los últimos tiempos y esto no será sostenible a largo plazo.`;
        tipo = 'alert-warning';
        icono = 'fas fa-exclamation-triangle'; // Precaución
    } else {
        // No se realiza ninguna acción en este caso
    }

    // Actualizar el contenido y la clase del mensaje
    mensajeTextoElement.textContent = mensaje;
    mensajeIconoElement.className = icono;
    mensajeInversionElement.className = `alert alert-dismissible fade show ${tipo}`;
    mensajeInversionElement.style.display = 'flex'; // Asegurar que se muestre

    // Agregar transición de entrada
    mensajeInversionElement.style.opacity = 0;
    setTimeout(() => {
        mensajeInversionElement.style.opacity = 1;
        mensajeInversionElement.style.transition = 'opacity 0.5s ease-in-out';
    }, 100);

    console.info(`[LOG INFO] Mensaje generado: ${mensaje}`);
}


// -------------------------------------
// Cálculo de EPS y proyecciones
// -------------------------------------
async function calcularYProyectarEPS(ticker) {
    console.log(`[DEBUG] Iniciando proyección de EPS para ${ticker}`);
    try {
        const response = await fetch(`/api/companies/${ticker}/financials`);
        if (!response.ok) {
            throw new Error(`Error al obtener datos financieros: ${response.statusText}`);
        }
        const financialData = await response.json();
        console.log(`[DEBUG] Datos financieros obtenidos para ${ticker}:`, financialData);

        // ========================
        // DATOS ANUALES
        // ========================
        const anualData = financialData["income_yearly"];
        const historicoAnual = procesarEPS(anualData, "EPS (Basic)");
        console.log(`[DEBUG] EPS Anual Histórico (sin ordenar):`, historicoAnual);

        // Organizar datos anuales por año en orden ascendente
        historicoAnual.sort((a, b) => parseInt(a.periodo) - parseInt(b.periodo));
        console.log(`[DEBUG] EPS Anual Histórico (ordenado):`, historicoAnual);

        // Calcular proyección para 2 años usando CAGR
        const proyeccionAnual = proyectarEPS(historicoAnual, 2);
        console.log(`[DEBUG] EPS Anual Proyectado:`, proyeccionAnual);

        // ========================
        // DATOS TRIMESTRALES
        // ========================
        const trimestralData = financialData["income_quarterly"];
        const historicoTrimestral = procesarEPS(trimestralData, "EPS (Basic)");
        console.log(`[DEBUG] EPS Trimestral Histórico (sin ordenar):`, historicoTrimestral);

        // Organizar datos trimestrales por año y dentro del año por trimestre
        historicoTrimestral.sort((a, b) => {
            const [qA, yearA] = a.periodo.split(" ");
            const [qB, yearB] = b.periodo.split(" ");
        
            // Ordenar primero por año y luego por trimestre
            return parseInt(yearA) - parseInt(yearB) || parseInt(qA[1]) - parseInt(qB[1]);
        });
        
        console.log(`[DEBUG] EPS Trimestral Histórico (ordenado):`, historicoTrimestral);
       

        // Calcular proyección para 8 trimestres usando CAGR
        const proyeccionTrimestral = proyectarProyeccionTrimestral(historicoTrimestral, 8);
        console.log(`[DEBUG] EPS Trimestral Proyectado:`, proyeccionTrimestral);

        

        // Retornamos todo en un objeto para usarlo donde corresponda
        return {
            historicoAnual,
            proyeccionAnual,
            historicoTrimestral,
            proyeccionTrimestral
        };
    } catch (error) {
        console.error("[ERROR] Error al calcular y proyectar EPS:", error);
        return null;
    }
}

// Función auxiliar para calcular la proyección trimestral
function proyectarProyeccionTrimestral(historicoTrimestral, trimestresProyectados) {
    if (historicoTrimestral.length < 2) {
        console.warn("[WARNING] No hay suficientes datos históricos para calcular la proyección.");
        return [];
    }

    // Calcular el CAGR
    const epsInicial = historicoTrimestral[0].eps;
    const epsFinal = historicoTrimestral[historicoTrimestral.length - 1].eps;
    const nPeriodos = historicoTrimestral.length - 1;
    const crecimiento = nPeriodos > 0 && epsInicial > 0
        ? Math.pow(epsFinal / epsInicial, 1 / nPeriodos) - 1
        : 0.05; // Crecimiento predeterminado (5%)

    console.log(`[DEBUG] CAGR Calculado: ${(crecimiento * 100).toFixed(2)}%`);

    // Obtener el último trimestre y año del historial
    let [ultimoTrimestre, ultimoAnio] = historicoTrimestral[historicoTrimestral.length - 1].periodo.split(" ");
    ultimoTrimestre = parseInt(ultimoTrimestre[1]);
    ultimoAnio = parseInt(ultimoAnio);

    // Generar proyecciones para los trimestres futuros
    const proyeccion = [];
    let epsActual = epsFinal;

    for (let i = 1; i <= trimestresProyectados; i++) {
        epsActual *= (1 + crecimiento); // Aplicar el crecimiento
        ultimoTrimestre++;
        if (ultimoTrimestre > 4) {
            ultimoTrimestre = 1;
            ultimoAnio++;
        }
        proyeccion.push({ periodo: `Q${ultimoTrimestre} ${ultimoAnio}`, eps: epsActual.toFixed(2) });
    }

    return proyeccion;
}



function procesarEPS(data, metricKey) {
    console.log(`[DEBUG] procesarEPS => Buscando la métrica: '${metricKey}'...`);

    // 1. Validar data
    if (!data || !Array.isArray(data.rows)) {
        console.warn("[WARNING] Datos no válidos o data.rows no es un array:", data);
        return [];
    }
    console.log("[DEBUG] Estructura 'data' recibida en procesarEPS:", data);

    // 2. Buscar la fila que contenga 'metricKey' (p.ej. 'EPS (Basic)')
    const metricRow = data.rows.find(row => row[0] === metricKey);
    if (!metricRow) {
        console.warn(`[WARNING] Métrica "${metricKey}" no encontrada en 'rows'.`);
        return [];
    }
    console.log(`[DEBUG] Se encontró la fila para '${metricKey}'. Fila completa:`, metricRow);

    // 3. Extraer valores (ignorando la primera col, que es la etiqueta "EPS (Basic)")
    //    y mapearlos a un array de objetos { periodo, eps }
    //    asumiendo que data.headers también va en paralelo
    const processedData = metricRow
        .slice(1) // Ignoramos la primera celda (que es "EPS (Basic)")
        .map((value, index) => {
            // parsear como float, reemplazando coma y 'N/A'
            const epsValue = parseFloat(value.replace(",", "").replace("N/A", "0")) || 0;

            // data.headers[index+1] -> corresponde a la columna que se está procesando
            // (index+1) porque la col 0 es "Header1" del 'EPS (Basic)'
            const periodo = data.headers[index + 1] || `Periodo ${index + 1}`;

            return { periodo, eps: epsValue };
        })
        .filter(entry => entry.eps !== 0); 
        // o si quieres quedarte con todos, omite .filter

    console.log("[DEBUG] Datos procesados de la métrica:", processedData);
    return processedData;
}
// clasifica la compania segun peter lynch
function evaluarClasificacion(historico, proyecciones, crecimiento) {
    console.log("[DEBUG] Datos ingresados a evaluarClasificacion:");

    // Validar que los parámetros sean arreglos
    if (!Array.isArray(historico) || !Array.isArray(proyecciones)) {
        console.error("[ERROR] 'historico' o 'proyecciones' no son arreglos válidos.");
        return { id: 0, clasificacion: "Datos inválidos" };
    }

    console.log("[DEBUG] Histórico:", JSON.stringify(historico, null, 2));
    console.log("[DEBUG] Proyecciones:", JSON.stringify(proyecciones, null, 2));

    // Asegurar que el crecimiento (CAGR) sea válido y no negativo
    if (typeof crecimiento !== "number" || crecimiento < 0 || isNaN(crecimiento)) {
        console.warn("[WARNING] CAGR inválido o negativo. Se asignará 0.");
        crecimiento = 0;
    }
    console.log(`[DEBUG] CAGR recibido (ajustado): ${crecimiento.toFixed(2)}%`);

    // Combinar datos históricos y proyecciones
    const datosCombinados = [...historico, ...proyecciones];
    console.log("[DEBUG] Datos combinados:", JSON.stringify(datosCombinados, null, 2));

    // Ordenar los datos por período (del más lejano al más cercano)
    const datosOrdenados = datosCombinados
        .map(item => {
            const year = item.periodo.includes("TTM")
                ? new Date().getFullYear() // Considerar TTM como el año actual
                : parseInt(item.periodo.replace(/[^0-9]/g, "")); // Extraer año de "FY XXXX"
            return { ...item, year };
        })
        .sort((a, b) => a.year - b.year); // Ordenar por año
    console.log("[DEBUG] Datos ordenados por año:", JSON.stringify(datosOrdenados, null, 2));

    // Determinar EPS más lejano (primer dato) y más cercano (último dato)
    const epsMasLejano = datosOrdenados[0]?.eps || 0;
    const epsMasCercano = datosOrdenados[datosOrdenados.length - 1]?.eps || 0;
    console.log(`[DEBUG] EPS más lejano: ${epsMasLejano}, EPS más cercano: ${epsMasCercano}`);

    // Validación de los valores
    if (epsMasLejano <= 0 || epsMasCercano <= 0 || isNaN(epsMasLejano) || isNaN(epsMasCercano)) {
        console.warn("[WARNING] Valores inválidos para clasificación. Se considera especulativa.");

        const elementoClasificacion = document.getElementById("clasificacion");
        if (elementoClasificacion) {
            elementoClasificacion.innerHTML = `<span class="default">
                Especulativa
            </span>`;
        } else {
            console.error("[ERROR] No se encontró un elemento con id='clasificacion' en el DOM.");
        }

        return { id: 0, clasificacion: "Especulativa" };
    }

    // Calcular la volatilidad
    const volatilidad = ((epsMasCercano - epsMasLejano) / epsMasLejano) * 100;
    console.log(`[DEBUG] Volatilidad calculada: ${volatilidad.toFixed(2)}%`);

    // Clasificar la compañía según la volatilidad
    let clasificacion = { id: 0, clasificacion: "No clasificada", className: "" };
    if (volatilidad < 20) {
        clasificacion = { id: 1, clasificacion: " Crecimiento Lento (Slow Grower)", className: "slow-grower" };
    } else if (volatilidad >= 20 && volatilidad <= 50) {
        clasificacion = { id: 2, clasificacion: "Sólida o Resistente (Stalwart)", className: "stalwart" };
    } else if (volatilidad > 50 && volatilidad <= 100) {
        clasificacion = { id: 3, clasificacion: "Cíclica (Cyclical)", className: "cyclical" };
    } else if (volatilidad > 100) {
        clasificacion = { id: 4, clasificacion: " Alto Crecimiento (Fast Grower)", className: "fast-grower" };
    }

    console.log("[DEBUG] Clasificación final:", clasificacion);

    // Mostrar el resultado en el DOM
    const elementoClasificacion = document.getElementById("clasificacion");
    if (elementoClasificacion) {
        elementoClasificacion.innerHTML = `<span class="${clasificacion.className}">
            ${clasificacion.clasificacion}
        </span>`;
    } else {
        console.error("[ERROR] No se encontró un elemento con id='clasificacion' en el DOM.");
    }

    return clasificacion;
}



//proyecta datos de eps tomados desde la base de datos

function proyectarEPS(historico, periodosProyectados) {
    if (!historico || historico.length < 1) {
        console.warn("[WARNING] No hay datos históricos para proyectar.");
        return [];
    }

    // Ordenar datos históricos sin modificar el original
    const historicoOrdenado = [...historico].sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Calcular CAGR
const epsInicial = historicoOrdenado[0]?.eps || 0;
let epsFinal = historicoOrdenado[historicoOrdenado.length - 1]?.eps || 0;
let nPeriodos = historicoOrdenado.length - 1;

// Verificar si TTM es igual al último valor anual completo
if (
    historicoOrdenado[historicoOrdenado.length - 1]?.periodo === "TTM" &&
    historicoOrdenado[historicoOrdenado.length - 2]?.eps === epsFinal
) {
    // Ignorar TTM y usar el penúltimo valor como EPS final
    epsFinal = historicoOrdenado[historicoOrdenado.length - 2]?.eps || 0;
    nPeriodos -= 1; // Reducir el número de períodos
}

const crecimiento = nPeriodos > 0 && epsInicial > 0
    ? Math.pow(epsFinal / epsInicial, 1 / nPeriodos) - 1
    : 0.05; // Crecimiento predeterminado (5%)

console.log(`[DEBUG] CAGR Calculado: ${(crecimiento * 100).toFixed(2)}%`);

// Generar proyecciones
const proyecciones = [];
for (let i = 1; i <= periodosProyectados; i++) {
    const epsProyectado = epsFinal * Math.pow(1 + crecimiento, i);
    proyecciones.push({ periodo: `FY ${new Date().getFullYear() + i}`, eps: parseFloat(epsProyectado.toFixed(2)) });
}

console.log("[DEBUG] Proyecciones Generadas:", JSON.stringify(proyecciones, null, 2));

// Determinar el valor más reciente (historial)
const epsMasReciente = historicoOrdenado[historicoOrdenado.length - 1]?.eps || 0;

// Determinar el valor más lejano (última proyección)
const epsMasLejano = proyecciones[proyecciones.length - 1]?.eps || 0;

// Calcular el porcentaje de cambio entre el valor más reciente y el más lejano
let porcentajeCambio = 0; // Inicializar
if (epsMasReciente > 0) {
    porcentajeCambio = ((epsMasLejano - epsMasReciente) / epsMasReciente) * 100;
    porcentajeCambio = parseFloat(porcentajeCambio.toFixed(2)); // Limitar a dos decimales

    console.log(`[INFO] Cambio proyectado entre el valor más reciente y más lejano: ${porcentajeCambio.toFixed(2)}%`);
} else {
    console.log("[ERROR] EPS más reciente es 0 o inválido, no se puede calcular el cambio.");
}

// Mostrar los valores utilizados
console.log(`[INFO] Valor más reciente (historial): ${epsMasReciente}`);
console.log(`[INFO] Valor más lejano (proyección): ${epsMasLejano}`);

// Llamar a la función para renderizar gráficos con el nuevo valor incluido
renderizarGraficoValoresIntrinsecos(historicoOrdenado, proyecciones, crecimiento, porcentajeCambio);


    // Llamar a la función para evaluar la clasificación
    const clasificacion = evaluarClasificacion(historicoOrdenado, proyecciones, crecimiento);
    console.log("[DEBUG] Clasificación Generada:", clasificacion);

    return proyecciones;
}



// -------------------------------------
// Renderizadores de gráficos
// -------------------------------------
let quarterlyChart = null; // Variable global para almacenar la instancia

function renderizarGraficoEPS(historico, proyeccion) {
    const chartId = "QProjectionChart";

    // Si existe una instancia previa de Chart sobre este canvas, la destruimos
    if (quarterlyChart) {
        quarterlyChart.destroy();
        quarterlyChart = null;
    }

    const canvas = document.getElementById(chartId);
    if (!canvas) {
        console.error("[ERROR] No se encontró el canvas 'QProjectionChart'.");
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("[ERROR] No se pudo obtener el contexto 2D del canvas.");
        return;
    }

    // Calcular CAGR basado en datos históricos
    if (historico.length < 2) {
        console.error("[ERROR] No hay suficientes datos históricos para calcular el CAGR.");
        return;
    }

    const epsInicial = historico[0].eps;
    const epsFinal = historico[historico.length - 1].eps;
    const nPeriodos = historico.length - 1;

    const crecimiento = epsInicial > 0 && nPeriodos > 0
        ? (Math.pow(epsFinal / epsInicial, 1 / nPeriodos) - 1) * 100
        : 0; // Porcentaje de crecimiento o decrecimiento

    const cagrTexto = crecimiento >= 0
        ? `Crecimiento medio trimestral: ${crecimiento.toFixed(2)}%`
        : `Decrecimiento medio trimestral: ${Math.abs(crecimiento).toFixed(2)}%`;

    // Combinar datos históricos y proyectados
    const datosCombinados = [...historico];

    // Generar etiquetas de proyección a partir del último trimestre histórico
    let [ultimoTrimestre, ultimoAnio] = historico[historico.length - 1].periodo.split(" ");
    ultimoTrimestre = parseInt(ultimoTrimestre[1]);
    ultimoAnio = parseInt(ultimoAnio);

    proyeccion.forEach((entry) => {
        ultimoTrimestre++;
        if (ultimoTrimestre > 4) {
            ultimoTrimestre = 1;
            ultimoAnio++;
        }
        datosCombinados.push({ periodo: `Q${ultimoTrimestre} ${ultimoAnio}`, eps: entry.eps });
    });

    // Ordenar todos los periodos (históricos y proyectados) por año y trimestre
    datosCombinados.sort((a, b) => {
        const [qA, yearA] = a.periodo.split(" ");
        const [qB, yearB] = b.periodo.split(" ");
        return parseInt(yearA) - parseInt(yearB) || parseInt(qA[1]) - parseInt(qB[1]);
    });

    // Generar etiquetas y separar datos históricos y proyectados
    const etiquetas = datosCombinados.map(entry => entry.periodo);
    const datosHistoricos = etiquetas.map(periodo => {
        const match = historico.find(entry => entry.periodo === periodo);
        return match ? match.eps : null; // Usar null si no hay dato histórico
    });

    const datosProyectados = etiquetas.map(periodo => {
        const match = proyeccion.find(entry => 
            datosCombinados.find(data => data.periodo === periodo && data.eps === entry.eps)
        );
        return match ? match.eps : null; // Usar null si no hay dato proyectado
    });

    // Crear el gráfico
    quarterlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: 'EPS Histórico',
                    data: datosHistoricos,
                    borderColor: '#6a11cb',
                    backgroundColor: 'rgba(106, 17, 203, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#6a11cb',
                    tension: 0.3,
                },
                {
                    label: 'EPS Proyectado',
                    data: datosProyectados,
                    borderColor: '#2575fc',
                    backgroundColor: 'rgba(37, 117, 252, 0.2)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#2575fc',
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `EPS: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Periodo' }
                },
                y: {
                    title: { display: true, text: 'EPS ($)' },
                    beginAtZero: true
                }
            }
        }
    });

    // Mostrar el texto del CAGR encima del gráfico en un formato destacado
    const container = canvas.parentNode;
    let cagrTextElement = document.getElementById('cagr-text');
    if (!cagrTextElement) {
        cagrTextElement = document.createElement('div');
        cagrTextElement.id = 'cagr-text';
        cagrTextElement.style.textAlign = 'center';
        cagrTextElement.style.fontSize = '1.5em';
        cagrTextElement.style.fontWeight = 'bold';
        cagrTextElement.style.marginBottom = '10px';
        container.insertBefore(cagrTextElement, canvas);
    }
    cagrTextElement.textContent = cagrTexto;

    console.log(`[DEBUG] Gráfico EPS renderizado con título: "${cagrTexto}".`);
}



// Variable global para guardar la instancia (si ya existía)
let intrinsicValueChartInstance = null;
// Variables globales para almacenar proyecciones
let proyecciones = { proyeccion1: null, proyeccion2: null };


 
/**
 * Renderiza un gráfico de valores intrínsecos basado en datos históricos, proyecciones y CAGR.
 * @param {Array} dataEPS - Estructura: [{ periodo: '2020', eps: 2.35 }, { periodo: 'Proy 6', eps: 2.85 }, ...]
 * @param {Array} proyecciones - Proyecciones de EPS ya calculadas.
 * @param {number} cagr - Porcentaje CAGR ya calculado.
 */
function renderizarGraficoValoresIntrinsecos(dataEPS, proyecciones, cagr, porcentajeCambio) {
    console.log("[DEBUG] Entrando a renderizarGraficoValoresIntrinsecos...");
    console.log("[DEBUG] Datos recibidos (dataEPS):", JSON.stringify(dataEPS, null, 2));
    console.log("[DEBUG] Proyecciones recibidas:", JSON.stringify(proyecciones, null, 2));
    console.log(`[DEBUG] CAGR recibido: ${(cagr * 100).toFixed(2)}%`);
    console.log(`[DEBUG] Porcentaje de cambio recibido: ${porcentajeCambio.toFixed(2)}%`);
   

    // Validar los elementos del DOM necesarios
    const perMinElement = document.getElementById('per-min');
    const perMedioElement = document.getElementById('per-medio-value');
    const perMaxElement = document.getElementById('per-max');
    const currentPriceElement = document.getElementById('current-price');
    const encabezadoCagr = document.getElementById('encabezado-cagr');

    if (!perMinElement || !perMedioElement || !perMaxElement || !currentPriceElement) {
        console.error("[ERROR] Faltan elementos necesarios en el DOM (PER o Precio Actual).");
        return;
    }

    // Recuperar valores de PER y precio actual
    const perMin = Math.max(parseFloat(perMinElement.textContent.trim()) || 0, 1);
    const perMedio = Math.max(parseFloat(perMedioElement.textContent.trim()) || 0, 1);
    const perMax = Math.max(parseFloat(perMaxElement.textContent.trim()) || 0, 1);
    const currentPrice = parseFloat(currentPriceElement.textContent.trim().replace('$', '')) || 0;

    if (isNaN(currentPrice) || currentPrice <= 0) {
        console.error("[ERROR] El Precio Actual no es válido.");
        return;
    }

    console.log(`[DEBUG] PER Min: ${perMin}, Medio: ${perMedio}, Max: ${perMax}`);
    console.log(`[DEBUG] Precio Actual: ${currentPrice}`);

    // Ajustar las etiquetas de las proyecciones para reflejar los años consecutivos
    const lastYear = parseInt(dataEPS[dataEPS.length - 1].periodo.replace(/[^0-9]/g, "")) || new Date().getFullYear();
    proyecciones.forEach((projection, index) => {
        projection.periodo = `FY ${lastYear + index + 1}`;
    });

    // Organizar los datos históricos y proyecciones
    const organizedDataEPS = [...dataEPS, ...proyecciones];
    console.log("[DEBUG] Datos organizados (dataEPS + proyecciones):", JSON.stringify(organizedDataEPS, null, 2));

    // Generar encabezado dinámico
    if (encabezadoCagr) {
        const crecimientoTotal = ((dataEPS[dataEPS.length - 1].eps / dataEPS[0].eps - 1) * 100).toFixed(2);
        
        // Determinar si es crecimiento o decrecimiento
        const esCrecimiento = cagr >= 0 && crecimientoTotal >= 0;
        const mensajeCrecimiento = esCrecimiento
            ? '<span class="positivo">crecido</span>'
            : '<span class="negativo">decrecido</span>';
        const mensajeAnual = esCrecimiento ? "CAGR" : "DCAR"; // CAGR (Crecimiento Anual) o DCAR (Decrecimiento Anual)
    
        encabezadoCagr.innerHTML = `El EPS ha ${mensajeCrecimiento} en media un ${Math.abs((cagr * 100).toFixed(2))}% anual (${mensajeAnual}) en los últimos ${dataEPS.length - proyecciones.length} años, proyectando un ${esCrecimiento ? "crecimiento" : "decrecimiento"} futuro total a partir de hoy  de ${Math.abs(porcentajeCambio)}% en los proximos años.`;
    }
    
    

    // Calcular valores intrínsecos (EPS * PER)
    const valoresIntrinsecos = {
        min: organizedDataEPS.map(entry => {
            const eps = Math.max(parseFloat(entry.eps) || 0, 0.1); // Usar 0.1 si el EPS es negativo o inválido
            return (eps * perMin).toFixed(2);
        }),
        medio: organizedDataEPS.map(entry => {
            const eps = Math.max(parseFloat(entry.eps) || 0, 0.1); // Usar 0.1 si el EPS es negativo o inválido
            return (eps * perMedio).toFixed(2);
        }),
        max: organizedDataEPS.map(entry => {
            const eps = Math.max(parseFloat(entry.eps) || 0, 0.1); // Usar 0.1 si el EPS es negativo o inválido
            return (eps * perMax).toFixed(2);
        })
    };
    

    console.log("[DEBUG] Valores Intrínsecos Calculados:", JSON.stringify(valoresIntrinsecos, null, 2));

    // Verificar <canvas> para dibujar
    const canvas = document.getElementById('intrinsicValueChart');
    if (!canvas) {
        console.error("[ERROR] No se encontró <canvas id='intrinsicValueChart'> en el DOM.");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Etiquetas para el gráfico
    const labels = organizedDataEPS.map(entry => entry.periodo);
    console.log("[DEBUG] Etiquetas (periodos):", labels);

    // Crear gráfico con líneas proyectadas y línea horizontal del precio actual
    intrinsicValueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Valor Min`,
                    data: valoresIntrinsecos.min,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    segment: {
                        borderDash: ctx => {
                            const index = ctx.p0DataIndex;
                            // Comienza la línea discontinua desde el último dato histórico
                            return index >= (dataEPS.length - 1) ? [5, 5] : [];
                        }
                    },
                    pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle'
                    
                },
                {
                    // Dataset para el área entre "Valor Base" y "Valor Min"
                    label: 'Relleno Medio-Min',
                    data: valoresIntrinsecos.medio, // Usa los valores del medio
                    backgroundColor: 'rgba(40, 167, 69, 0.2)', // Verde semi-transparente
                    fill: '-1', // Rellena hacia el dataset anterior (el de "Valor Min")
                    borderWidth: 0, // Sin borde
                    pointRadius: 0, // Sin puntos
                    tension: 0.3 // Suavizado opcional
                },
                {
                    label: `Valor Base`,
                    data: valoresIntrinsecos.medio,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    segment: {
                        borderDash: ctx => {
                            const index = ctx.p0DataIndex;
                            // Comienza la línea discontinua desde el último dato histórico
                            return index >= (dataEPS.length - 1) ? [5, 5] : [];
                        }
                    },
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle'
                },
                
                {
                    label: `Valor Máx`,
                    data: valoresIntrinsecos.max,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    segment: {
                        borderDash: ctx => {
                            const index = ctx.p0DataIndex;
                            // Comienza la línea discontinua desde el último dato histórico
                            return index >= (dataEPS.length - 1) ? [5, 5] : [];
                        }
                    },
                    pointBackgroundColor: 'rgba(220, 53, 69, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle'
                },
                {
                    // Dataset para el área entre "Valor Max" y "Valor Base"
                    label: 'Relleno Min-Medio',
                    data: valoresIntrinsecos.medio, // Usa los valores del medio
                    backgroundColor: 'rgba(220, 53, 69, 0.2)', // Rojo semi-transparente
                    fill: '-1', // Rellena hacia el dataset anterior (el de "Valor Min")
                    borderWidth: 0, // Sin borde
                    pointRadius: 0, // Sin puntos
                    tension: 0.3 // Suavizado opcional
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;
                            const eps = organizedDataEPS[index].eps;
                            let per;
                            if (context.dataset.label.includes('Min')) {
                                per = perMin;
                            } else if (context.dataset.label.includes('Base')) {
                                per = perMedio;
                            } else if (context.dataset.label.includes('Máx')) {
                                per = perMax;
                            }
                            const value = context.raw;
                            return `Valor: $${value}, EPS: ${eps}, PER: ${per}`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        currentPriceLine: {
                            type: 'line',
                            yMin: currentPrice,
                            yMax: currentPrice,
                            borderColor: 'rgba(0, 0, 0, 0.7)',
                            borderWidth: 2,
                            label: {
                                content: `Precio Actual: $${currentPrice}`,
                                enabled: true,
                                position: 'end',
                                color: 'white',
                                padding: 6
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Periodo' }
                },
                y: {
                    title: { display: true, text: 'Valor Intrínseco ($)' },
                    beginAtZero: true
                }
            }
        }
    });
    

    console.log("[DEBUG] Gráfico renderizado correctamente.");
}

// Ejemplo de uso
const proyeccion1 = 6.50; // Valor mínimo proyectado
const proyeccion2 = 8.45; // Valor máximo proyectado

const resultado = evaluarClasificacion(proyeccion1, proyeccion2);

// Log para verificar el resultado
console.log(`[RESULTADO] ID=${resultado.id}, Clasificación=${resultado.clasificacion}`);

// Función para evaluar clasificación basada en las proyecciones existentes//////////////////


/// Manejador de eventos combinado para "Ver Detalles" y "Toggle Table Link"
document.getElementById('toggle-table-link').addEventListener('click', async function (event) {
    event.preventDefault(); // Evitar la redirección del enlace

    const ticker = event.target.getAttribute('data-simbolo');

    // Si existe un símbolo, manejar la lógica de proyección de EPS
    if (ticker) {
        console.log(`[DEBUG] Iniciando proyección de EPS para el símbolo: ${ticker}`);

        const resultados = await calcularYProyectarEPS(ticker);
        if (resultados) {
            console.log("[INFO] Resultados de EPS calculados:", resultados);

            // Renderizar el gráfico trimestral con los datos obtenidos
            generarGraficoProyeccion(resultados.historicoTrimestral, resultados.proyeccionTrimestral);
        }
        return;
    }

    // Lógica para manejar los elementos de proyecciones si no hay un símbolo
    const proyeccion1Element = document.getElementById('proyeccion1');
    const proyeccion2Element = document.getElementById('proyeccion2');

    if (!proyeccion1Element || !proyeccion2Element) {
        console.error("[ERROR] No se encontraron los elementos de proyecciones en el DOM.");
        return;
    }

    // Leer y validar valores calculados dinámicamente en el DOM
    const proyeccion1 = parseFloat(proyeccion1Element.textContent.trim());
    const proyeccion2 = parseFloat(proyeccion2Element.textContent.trim());

    if (isNaN(proyeccion1) || isNaN(proyeccion2)) {
        console.error("[ERROR] Proyecciones inválidas. Verifica los valores calculados.");
        return;
    }

    console.log(`[DEBUG] Proyección 1 (Año 1): ${proyeccion1}`);
    console.log(`[DEBUG] Proyección 2 (Año 2): ${proyeccion2}`);

   

    // Actualizar el DOM con el resultado de la clasificación
    const clasificacionElement = document.getElementById('clasificacion');
    clasificacionElement.innerHTML = `
        <span style="font-size: 1.2em; font-weight: bold;">
            ${resultado.clasificacion}
        </span>
    `;

    console.log(`[RESULTADO] ID=${resultado.id}, Clasificación=${resultado.clasificacion}`);
});

// -------------------------------------
// Función para generar el gráfico de proyección
// -------------------------------------
function generarGraficoProyeccion(historicoTrimestral, proyeccionTrimestral) {
    // Aquí se podría ajustar la forma en que se renderiza o 
    // reutilizar la lógica de renderizarGraficoEPS si lo deseas.
    console.log("[INFO] Generando gráfico con historicoTrimestral y proyeccionTrimestral...");
    renderizarGraficoEPS(historicoTrimestral, proyeccionTrimestral);
}
// script para las tablas al precionar boton en el admin
function toggleTable(tableId) {
    const tableContainer = document.getElementById(`table-${tableId}`);
    if (tableContainer.style.display === 'none') {
        tableContainer.style.display = 'block';
    } else {
        tableContainer.style.display = 'none';
    }
}
//FUNCION PARA ORDENAR LAS TABLAS DEL ADMIN ALBABETICAMENTE
