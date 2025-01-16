// server.js

// ... (código anterior)

async function getEPS(symbol) {
    console.log(`Iniciando scraping para el símbolo: ${symbol}`);
    const url = `https://stockanalysis.com/stocks/${symbol}/forecast/`;

    try {
        const { data } = await axios.get(url);
        console.log(`Datos obtenidos de ${url}`);
        const $ = cheerio.load(data);

        // Seleccionar la cuarta tabla (índice 3 ya que comienza en 0)
        const table = $('table').eq(3);
        if (!table || table.length === 0) {
            throw new Error('Tabla no encontrada en la página.');
        }
        console.log('Tabla encontrada, iniciando extracción de datos.');

        // Extraer todas las filas de la tabla
        const rows = table.find('tr');
        if (rows.length < 5) {
            throw new Error('No hay suficientes filas en la tabla para extraer los datos.');
        }

        // Extraer los años (primera fila, índice 0)
        const years = [];
        rows.eq(0).find('th').each((i, elem) => {
            const year = $(elem).text().trim();
            if (/^\d{4}$/.test(year)) {
                years.push(year);
            }
        });
        console.log(`Años extraídos: ${years}`);

        // Extraer los EPS (quinta fila, índice 4)
        const eps = [];
        rows.eq(4).find('td').each((i, elem) => {
            const value = $(elem).text().trim();
            const cleanValue = parseFloat(value.replace(/,/g, ''));
            eps.push(isNaN(cleanValue) ? null : cleanValue);
        });
        console.log(`EPS extraídos: ${eps}`);

        // Verificar que la cantidad de años y EPS coincida
        if (years.length !== eps.length) {
            throw new Error('La cantidad de años y EPS no coincide.');
        }

        return { years, eps };
    } catch (error) {
        console.error(`Error en getEPS(${symbol}): ${error.message}`);
        throw error;
    }
}
