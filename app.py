# app.py
import os
from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from config import Config
from models import db, bcrypt, User , Compania, DatosFinancieros
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf import CSRFProtect
from sqlalchemy.exc import IntegrityError
from functools import wraps
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from sqlalchemy.types import DateTime
from sqlalchemy.sql import func
from api import api_bp  # Importa el blueprint del archivo api.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
import json

# Configuración de Headers Globales
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
                  " Chrome/58.0.3029.110 Safari/537.3",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}

fecha_caducidad = db.Column(DateTime(timezone=True), default=func.now())




app = Flask(__name__)
app.config.from_object(Config)
# Registrar filtro personalizado
@app.template_filter('from_json')
def from_json_filter(value):
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return {}


# Registrar el blueprint después de configurar Flask
app.register_blueprint(api_bp)
# Permitir solicitudes desde cualquier origen
CORS(app)

# O para permitir solo desde un origen específico:
# CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5000"}})

# Inicializar extensiones
db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'index'

# Inicializar CSRF Protection
csrf = CSRFProtect(app)

# Cargar el usuario
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Decorador para roles
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Acceso denegado: Administrador requerido.', 'danger')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

# Clase personalizada para Flask-Admin
class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin
    
    def inaccessible_callback(self, name, **kwargs):
        flash('Acceso denegado: Administrador requerido.', 'danger')
        return redirect(url_for('dashboard'))

# Inicializar Flask-Admin
admin = Admin(app, name='Panel de Administración', template_mode='bootstrap4')
admin.add_view(AdminModelView(User, db.session))
# Añade otras vistas de modelos si es necesario
from datetime import datetime, timedelta
from flask import jsonify
from models import Compania, DatosFinancieros, db

#ruta para verificar esta de login al iniciar
@app.before_request
def log_request_info():
    app.logger.info(f"[REQUEST] Método: {request.method}, URL: {request.url}")
    app.logger.info(f"[AUTH] Usuario autenticado: {current_user.is_authenticated}")
    if current_user.is_authenticated:
        app.logger.info(f"[AUTH] Usuario actual: {current_user.username}")
    else:
        app.logger.info("[AUTH] Usuario no autenticado.")


from datetime import datetime, timedelta, timezone
#codigo para mejorar la concurrencia
#funcion que guarda los datos en la base de datos 
def guardar_datos_financieros(simbolo, tipo_tabla, frecuencia, datos):
    """
    Guarda o actualiza los datos financieros en la base de datos para una compañía específica.

    Args:
        simbolo (str): Símbolo de la compañía.
        tipo_tabla (str): Tipo de tabla (e.g., 'income', 'balance-sheet').
        frecuencia (str): Frecuencia de los datos (e.g., 'yearly', 'quarterly').
        datos (dict): Datos financieros a guardar en formato JSON.

    Returns:
        str: Mensaje indicando el resultado de la operación.
    """
    simbolo = simbolo.lower()  # Normalizar el símbolo a minúsculas

    try:
        # Buscar la compañía en la base de datos
        compania = Compania.query.filter_by(simbolo=simbolo).first()
        if not compania:
            # Crear la compañía si no existe
            compania = Compania(simbolo=simbolo, created_at=datetime.now(timezone.utc))
            db.session.add(compania)
            db.session.commit()

        # Verificar si ya existe un registro para esta combinación
        datos_existentes = DatosFinancieros.query.filter_by(
            compania_id=compania.id,
            tipo_tabla=tipo_tabla,
            frecuencia=frecuencia
        ).first()

        now = datetime.now(timezone.utc)

        # Validar si los datos existentes son válidos
        if datos_existentes:
            fecha_caducidad = datos_existentes.fecha_caducidad
            if fecha_caducidad.tzinfo is None:  # Si es naive, convertir a UTC
                fecha_caducidad = fecha_caducidad.replace(tzinfo=timezone.utc)

            if fecha_caducidad > now:
                return f"Datos para {tipo_tabla} ({frecuencia}) ya existentes y vigentes para la compañía {simbolo}."

            # Eliminar datos antiguos si existen
            db.session.delete(datos_existentes)

        # Guardar nuevos datos
        nuevos_datos = DatosFinancieros(
            compania_id=compania.id,
            tipo_tabla=tipo_tabla,
            frecuencia=frecuencia,
            datos=datos,
            fecha_extraccion=now,
            fecha_caducidad=now + timedelta(days=30)  # Vigencia de 30 días
        )

        db.session.add(nuevos_datos)
        db.session.commit()
        return f"Datos guardados o actualizados para {tipo_tabla} ({frecuencia}) en la compañía {simbolo}."

    except Exception as e:
        db.session.rollback()  # Revertir en caso de error
        return f"Error al guardar datos para {tipo_tabla} ({frecuencia}) en la compañía {simbolo}: {str(e)}"


import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timezone

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def scrape_financial_table(symbol):
    """
    Scrapea datos financieros de stockanalysis.com para un símbolo dado y los guarda en la base de datos.
    """
    base_url = f"https://stockanalysis.com/stocks/{symbol.lower()}/financials"
    urls = {
        "quarterly": {
            "balance-sheet": f"{base_url}/balance-sheet/?p=quarterly",
            "ratios": f"{base_url}/ratios/?p=quarterly",
            "income": f"{base_url}/?p=quarterly",
            "cash-flow": f"{base_url}/cash-flow-statement/?p=quarterly",
        },
        "yearly": {
            "balance-sheet": f"{base_url}/balance-sheet/",
            "ratios": f"{base_url}/ratios/",
            "income": f"{base_url}/",
            "cash-flow": f"{base_url}/cash-flow-statement/",
        }
    }

    resultados = {}

    # Scraping del nombre de la compañía desde el incomebalance-sheet (yearly)
    try:
        income_url = urls["yearly"]["income"]
        response = requests.get(income_url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Buscar el nombre de la compañía
        company_name_element = soup.find('h1')
        company_name = company_name_element.get_text(strip=True) if company_name_element else None

        if company_name:
            company_name_clean = company_name.split('(')[0].strip()
            company_name_clean = company_name_clean.replace("Income Statement", "", 1).strip()
            app.logger.info(f"[SCRAPING] Nombre de la compañía extraído: {company_name_clean}")

            compania = Compania.query.filter_by(simbolo=symbol.lower()).first()
            if compania:
                compania.nombre = company_name_clean
            else:
                compania = Compania(
                    simbolo=symbol.lower(),
                    nombre=company_name_clean,
                    created_at=datetime.now(timezone.utc)
                )
                db.session.add(compania)
            db.session.commit()
        else:
            app.logger.warning(f"[SCRAPING] No se pudo extraer el nombre de la compañía desde {balance_sheet_url}.")

    except Exception as e:
        app.logger.error(f"[ERROR] Error al extraer el nombre de la compañía desde {balance_sheet_url}: {e}")

    # Scraping de las tablas financieras
    for frecuencia, tablas in urls.items():
        for tipo_tabla, url in tablas.items():
            try:
                app.logger.info(f"[SCRAPING] Procesando {tipo_tabla} ({frecuencia}) desde URL: {url}")

                response = requests.get(url, headers=HEADERS)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')

                # Buscar directamente el <tbody> de la tabla
                table_body = soup.find('tbody')
                if not table_body:
                    app.logger.warning(f"[SCRAPING] No se encontró el tbody en la URL: {url}")
                    resultados[f"{tipo_tabla} ({frecuencia})"] = "Tbody no encontrado"
                    continue

                # Procesar encabezados y filas
                headers_table = [header.get_text(strip=True) for header in table_body.find_previous('thead').find_all('th')]
                rows = []
                for row in table_body.find_all('tr'):
                    cells = [cell.get_text(strip=True) for cell in row.find_all('td')]
                    if cells:
                        rows.append(cells)

                # Guardar los datos en la base de datos
                if headers_table and rows:
                    datos = {"headers": headers_table, "rows": rows}
                    resultado = guardar_datos_financieros(symbol, tipo_tabla, frecuencia, datos)
                    resultados[f"{tipo_tabla} ({frecuencia})"] = resultado
                else:
                    app.logger.warning(f"[SCRAPING] Datos incompletos para {tipo_tabla} ({frecuencia}) en la URL: {url}")
                    resultados[f"{tipo_tabla} ({frecuencia})"] = "Datos incompletos"

            except requests.exceptions.HTTPError as e:
                app.logger.error(f"[ERROR] Error HTTP al procesar {url}: {e}")
                resultados[f"{tipo_tabla} ({frecuencia})"] = f"Error HTTP: {e}"
            except Exception as e:
                app.logger.error(f"[ERROR] Error procesando {url}: {e}")
                resultados[f"{tipo_tabla} ({frecuencia})"] = f"Error: {e}"

    return resultados


#scrape precio para mostrarlo dinamicamente
import requests
from bs4 import BeautifulSoup
import logging

def scrape_stock_price(symbol):
    """
    Extrae el precio de la acción desde stockanalysis.com. Si falla, intenta obtenerlo desde zacks.com.
    """
    # Configurar logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Intentar primero con stockanalysis.com
    url_stockanalysis = f"https://stockanalysis.com/stocks/{symbol}/"
    logger.info(f"[LOG] Intentando scraping en stockanalysis.com: {url_stockanalysis}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
                      " Chrome/58.0.3029.110 Safari/537.3",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    }

    try:
        # Solicitud a stockanalysis.com
        response = requests.get(url_stockanalysis, headers=headers)
        response.raise_for_status()
        logger.info(f"[LOG] Solicitud HTTP exitosa para {url_stockanalysis}")

        # Parsear la respuesta
        soup = BeautifulSoup(response.content, 'html.parser')
        logger.info(f"[LOG] Página parseada con BeautifulSoup para {symbol}")

        # Buscar el elemento que contiene el precio en stockanalysis.com
        # Debes inspeccionar la página para obtener la clase correcta
        # Supongamos que la clase es 'price-current' (debes reemplazarla con la real)
        price_span = soup.find('span', class_='price-current')  # Reemplaza con la clase correcta
        if price_span:
            price = price_span.text.strip()
            logger.info(f"[LOG] Precio extraído de stockanalysis.com para {symbol}: {price}")
            return price
        else:
            logger.warning(f"[LOG WARNING] No se encontró el precio en stockanalysis.com para {symbol}. Intentando con zacks.com.")
    except requests.exceptions.HTTPError as e:
        logger.error(f"[LOG ERROR] Error HTTP al procesar {url_stockanalysis}: {e}")
    except Exception as e:
        logger.error(f"[LOG ERROR] Error procesando {url_stockanalysis}: {e}")

    # Si falla, intentar con zacks.com
    logger.info(f"[LOG] Intentando scraping en zacks.com para {symbol}")
    price_zacks = scrape_price_from_zacks(symbol, headers, logger)
    return price_zacks if price_zacks else "No disponible"

def scrape_price_from_zacks(symbol, headers, logger):
    """
    Extrae el precio de la acción desde zacks.com.
    """
    # Construir URL para zacks.com
    url_zacks = f"https://www.zacks.com/stock/quote/{symbol}?q={symbol}"
    logger.info(f"[LOG] URL para scraping en zacks.com: {url_zacks}")

    try:
        # Solicitud a zacks.com
        response = requests.get(url_zacks, headers=headers)
        response.raise_for_status()
        logger.info(f"[LOG] Solicitud HTTP exitosa para {url_zacks}")

        # Parsear la respuesta
        soup = BeautifulSoup(response.content, 'html.parser')
        logger.info(f"[LOG] Página parseada con BeautifulSoup para {symbol} en zacks.com")

        # Buscar el elemento que contiene el precio en zacks.com
        # Según tu indicación, es un <p> con clase 'last_price'
        price_p = soup.find('p', class_='last_price')
        if price_p:
            # Extraer el texto del <p>, que contiene el precio y posiblemente "USD"
            # Ejemplo: "$151.25<span> USD</span>"
            # Queremos obtener "$151.25"
            price_text = price_p.get_text(separator=" ", strip=True)
            # Opcional: Limpiar el precio para eliminar símbolos o texto adicional
            # Por ejemplo, eliminar "USD"
            price_clean = price_text.split(' ')[0]  # Obtiene "$151.25"
            logger.info(f"[LOG] Precio extraído de zacks.com para {symbol}: {price_clean}")
            return price_clean
        else:
            logger.warning(f"[LOG WARNING] No se encontró el precio en zacks.com para {symbol}.")
            return None

    except requests.exceptions.HTTPError as e:
        logger.error(f"[LOG ERROR] Error HTTP al procesar {url_zacks}: {e}")
        return None
    except Exception as e:
        logger.error(f"[LOG ERROR] Error procesando {url_zacks}: {e}")
        return None
 
#ruta para mostrar el precio en html
@app.route('/stock', methods=['GET'])
def stock_price():
    symbol = request.args.get('symbol')
    if not symbol:
        flash('Por favor, ingrese un símbolo válido.', 'danger')
        return redirect(url_for('dashboard'))

    # Llamar a la función de scraping
    price = scrape_stock_price(symbol)

    # Renderizar el HTML con el precio
    return render_template('stock.html', symbol=symbol, price=price)


# funcion para eliminar datos en DB desde el admin
@app.route('/delete_company/<int:company_id>', methods=['POST'])
@admin_required
def delete_company(company_id):
    try:
        # Buscar la compañía
        compania = Compania.query.get(company_id)
        if not compania:
            flash('Compañía no encontrada.', 'danger')
            return redirect(url_for('admin_dashboard'))

        # Eliminar la compañía y todos los datos financieros relacionados
        db.session.delete(compania)
        db.session.commit()

        flash(f'Compañía {compania.simbolo} y sus datos relacionados fueron eliminados.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error al eliminar la compañía: {str(e)}', 'danger')

    return redirect(url_for('admin_dashboard'))

#actualizar el eps actual
def actualizar_eps_actual(ticker):
    # Asegurarse de que ticker sea una cadena
    if not isinstance(ticker, str):
        ticker = str(ticker)

    # Obtener la compañía
    compania = Compania.query.filter_by(simbolo=ticker.lower()).first()
    if not compania:
        print(f"No se encontró la compañía {ticker}.")
        return None

    # Buscar datos financieros relacionados con la compañía
    financial_data = DatosFinancieros.query.filter_by(
        compania_id=compania.id,
        tipo_tabla='income',
        frecuencia='yearly'
    ).first()

    if not financial_data or not financial_data.datos:
        print(f"No se encontraron datos financieros para {ticker}.")
        return None

    # Filtrar EPS (Basic)
    eps_data = [
        entry for entry in financial_data.datos['rows']
        if entry.get('Metric') == 'EPS (Basic)'
    ]

    # Priorizar TTM o el periodo más reciente
    eps_data = sorted(
        eps_data,
        key=lambda x: x.get('Period', ''), reverse=True
    )

    if not eps_data:
        print(f"No se encontró EPS (Basic) para {ticker}.")
        return None

    for entry in eps_data:
        if entry['Period'] == 'TTM':
            return float(entry['Value'])
    return float(eps_data[0]['Value']) if eps_data else None

###############
#Calculo de Per stadistico
def calcular_per_estadisticas(company_id):
    """
    Calcula el PER medio, máximo y mínimo desde los datos financieros organizados como filas y columnas.

    Args:
        company_id (int): ID de la compañía en la base de datos.

    Returns:
        dict: Diccionario con los valores medio, máximo y mínimo del PER.
    """
    try:
        # Obtener los datos financieros
        financials = DatosFinancieros.query.filter_by(
            compania_id=company_id,
            tipo_tabla='ratios',
            frecuencia='quarterly'
        ).first()

        if not financials or not financials.datos:
            app.logger.warning(f"[LOG WARNING] No se encontraron datos 'ratios quarterly' para la compañía ID {company_id}.")
            return {"medio": None, "maximo": None, "minimo": None}

        # Validar y convertir datos si es una cadena JSON
        datos = financials.datos
        if isinstance(datos, str):
            try:
                datos = json.loads(datos)
            except json.JSONDecodeError as e:
                app.logger.error(f"[LOG ERROR] Error al decodificar JSON en 'datos': {e}")
                return {"medio": None, "maximo": None, "minimo": None}

        # Verificar que 'datos' sea un diccionario con 'rows'
        if not isinstance(datos, dict) or "rows" not in datos:
            app.logger.error(f"[LOG ERROR] 'datos' no contiene la clave 'rows' o no es un diccionario.")
            return {"medio": None, "maximo": None, "minimo": None}

        # Buscar la fila de 'PE Ratio'
        pe_row = next((row for row in datos["rows"] if row[0] == "PE Ratio"), None)
        if not pe_row:
            app.logger.warning(f"[LOG WARNING] No se encontró la fila de 'PE Ratio' en los datos financieros.")
            return {"medio": None, "maximo": None, "minimo": None}

        # Extraer los valores numéricos de 'PE Ratio'
        try:
            pe_ratios = [
                float(value.replace(",", "").replace("N/A", "0"))
                for value in pe_row[1:]  # Excluir la primera columna ("PE Ratio")
                if value not in ["-", "N/A", "Upgrade"]  # Excluir valores inválidos
            ]
        except ValueError as e:
            app.logger.error(f"[LOG ERROR] Error al convertir valores de 'PE Ratio': {e}")
            return {"medio": None, "maximo": None, "minimo": None}

        if not pe_ratios:
            app.logger.warning(f"[LOG WARNING] No se encontraron valores válidos en la fila de 'PE Ratio'.")
            return {"medio": None, "maximo": None, "minimo": None}

        # Calcular estadísticas
        per_medio = sum(pe_ratios) / len(pe_ratios)
        per_maximo = max(pe_ratios)
        per_minimo = min(pe_ratios)

        app.logger.info(f"[LOG INFO] PER Medio: {per_medio}, Máximo: {per_maximo}, Mínimo: {per_minimo}")

        return {
            "medio": round(per_medio, 2),
            "maximo": round(per_maximo, 2),
            "minimo": round(per_minimo, 2)
        }

    except Exception as e:
        app.logger.error(f"[LOG ERROR] Error inesperado al calcular estadísticas del PER: {e}")
        return {"medio": None, "maximo": None, "minimo": None}


# Ruta principal manejo simbolo de compania para guardarle BD


# Modificar la función search_company
@app.route('/search', methods=['GET'])
def search_company():
    app.logger.info(f"[SEARCH] Usuario autenticado: {current_user.is_authenticated}")
    app.logger.info(f"[SEARCH] Usuario actual: {current_user.username if current_user.is_authenticated else 'N/A'}")

    simbolo = request.args.get('symbol')
    if not simbolo:
        flash('Por favor, ingrese un símbolo válido.', 'danger')
        app.logger.warning("[WARN] Símbolo no proporcionado.")
        return redirect(url_for('index'))

    try:
        # Inicializar variables
        company_name = "No disponible"
        eps_actual = 0
        session['current_price'] = scrape_stock_price(simbolo) or "No disponible"

        per_medio_5y = None
        per_max = None
        per_min = None

        # Buscar la compañía en la base de datos
        compania = Compania.query.filter_by(simbolo=simbolo.lower()).first()

        # Si no existe la compañía, realizar el scraping
        if not compania:
            app.logger.info(f"[SEARCH] La compañía con símbolo {simbolo} no está en la base de datos. Llamando a scraping table.")
            scrape_result = scrape_financial_table(simbolo)

            if scrape_result:
                compania = Compania.query.filter_by(simbolo=simbolo.lower()).first()  # Reintentar obtener la compañía
                if compania:
                    app.logger.info(f"[INFO] La compañía con símbolo {simbolo} fue creada tras el scraping.")
                else:
                    app.logger.error(f"[ERROR] El scraping no creó una entrada para la compañía {simbolo}.")
                    flash('No se pudo obtener información para la compañía ingresada.', 'danger')
                    return redirect(url_for('index'))
            else:
                flash('No se pudo obtener información de la compañía ingresada.', 'danger')
                return redirect(url_for('index'))

        # Compañía encontrada o creada
        app.logger.info(f"[INFO] Compañía encontrada: {compania.nombre} (ID: {compania.id})")
        company_name = compania.nombre

        # Obtener EPS desde los datos financieros
        datos_financieros = DatosFinancieros.query.filter(
            DatosFinancieros.compania_id == compania.id,
            DatosFinancieros.fecha_caducidad > datetime.now(timezone.utc),
            DatosFinancieros.tipo_tabla == 'income',
            DatosFinancieros.frecuencia == 'yearly'
        ).first()

        if datos_financieros and isinstance(datos_financieros.datos, dict):
            rows = datos_financieros.datos.get('rows', [])
            if isinstance(rows, list):
                for row in rows:
                    if isinstance(row, list) and len(row) > 1 and row[0] == "EPS (Basic)":
                        try:
                            eps_actual = float(row[1].replace(',', '').replace('N/A', '0'))
                            app.logger.info(f"[INFO] EPS encontrado: {eps_actual}")
                            break
                        except ValueError:
                            app.logger.error(f"[ERROR] Error al convertir EPS: {row[1]}")
                            continue

        # Actualizar el precio actual
        session['current_price'] = scrape_stock_price(simbolo) or "No disponible"
        app.logger.info(f"[INFO] Precio actual obtenido: {session['current_price']}")

        # Calcular estadísticas del PER
        try:
            per_estadisticas = calcular_per_estadisticas(compania.id)
            per_medio_5y = per_estadisticas.get("medio")
            per_max = per_estadisticas.get("maximo")
            per_min = per_estadisticas.get("minimo")
            app.logger.info(f"[INFO] Estadísticas del PER: Medio={per_medio_5y}, Máximo={per_max}, Mínimo={per_min}")
        except Exception as e:
            app.logger.error(f"[ERROR] Error al calcular estadísticas del PER: {e}")
            per_medio_5y = None
            per_max = None
            per_min = None

        # Pasar los datos al template
        return render_template(
            'dashboard.html',
            company_name=company_name,
            simbolo=simbolo,  # Agregar símbolo al contexto del template
            price=session.get('current_price', 'Cargando...'),
            eps_actual=eps_actual,
            per_medio_5y=per_medio_5y,
            per_max=per_max,
            per_min=per_min
        )

    except Exception as e:
        app.logger.error(f"[ERROR] Error general en search_company: {e}")
        flash('Ocurrió un error al procesar la búsqueda.', 'danger')
        return redirect(url_for('index'))

###################
#inyeccion de details global
@app.context_processor
def inject_details():
    # Estructura predeterminada de details
    details = {
        'score': 0,
        'eps_actual': 0,
        'per_actual': 0,
        'per_medio_5y': 0,
        'clasificacion': '0',
    }

    # Intentar obtener datos si existe un símbolo en la sesión
    simbolo = session.get('last_searched_symbol')
    if simbolo:
        compania = Compania.query.filter_by(simbolo=simbolo.lower()).first()
        if compania:
            details['eps_actual'] = obtener_eps_actual(compania.id)
            details['per_actual'] = calcular_per_actual(compania.id)
            details['per_medio_5y'] = calcular_per_medio_5y(compania.id)
            details['clasificacion'] = clasificar_compania(compania.id)

    return dict(details=details)


#logica de llenado de la tabla detalles
from flask import render_template, session, flash
from flask_login import login_required
from models import Compania, DatosFinancieros

@app.route('/financial_dashboard')
@login_required
def financial_dashboard():
    # Obtener el último símbolo buscado desde la sesión
    simbolo = session.get('last_searched_symbol', None)
    if not simbolo:
        flash("No se ha buscado ninguna compañía recientemente.", "info")
        return redirect(url_for('index'))

    print(f"[LOG INFO] Último símbolo buscado: {simbolo}")

    # Estructura para detalles
    details = {
        'score': 0,  # Por implementar lógica
        'eps_actual': None,  # EPS actual
        'precio_actual': None,  # Precio actual
        'per_medio_5y': 0,  # PER promedio 5 años
        'clasificacion': '0',  # Clasificación
    }

    # Buscar la compañía por símbolo
    compania = Compania.query.filter_by(simbolo=simbolo.lower()).first()
    if compania:
        print(f"[LOG INFO] Compañía encontrada: {compania.nombre} (ID: {compania.id})")

        # Obtener EPS actual desde la base de datos
        details['eps_actual'] = obtener_eps_actual(compania.id)
        print(f"[LOG INFO] EPS Actual para {compania.nombre}: {details['eps_actual']}")

        # Obtener el precio actual
        details['precio_actual'] = compania.precio_actual
        print(f"[LOG INFO] Precio Actual para {compania.nombre}: {details['precio_actual']}")

        # Obtener otros valores (opcional)
        details['per_medio_5y'] = calcular_per_medio_5y(compania.id)
        details['clasificacion'] = clasificar_compania(compania.id)
    else:
        print(f"[LOG WARNING] No se encontró la compañía para el símbolo: {simbolo}")

    # Renderizar el template con los detalles
    print(f"[LOG DEBUG] Datos enviados al template: {details}")
    return render_template('dashboard.html', details=details)

#Calculo del Per ya se creo la funcion de calcular el per en la de eps
#def calcular_per_actual(company_id):
    print(f"[LOG INFO] Iniciando cálculo del PER para la compañía con ID: {company_id}")
  

    try:
        compania = Compania.query.get(company_id)
        if not compania:
            print(f"[LOG ERROR] No se encontró la compañía con ID: {company_id}")
            return 0

        print(f"[LOG INFO] Compañía encontrada: {compania.nombre} (ID: {compania.id})")
        print(f"[LOG INFO] Precio actual de la compañía: {compania.precio_actual}")

        if compania.precio_actual is None or compania.precio_actual <= 0:
            print(f"[LOG WARNING] Precio actual no válido para la compañía {compania.nombre}.")
            return 0

        # Obtener EPS actual
        eps = obtener_eps_actual(company_id)
        print(f"[LOG INFO] EPS actual obtenido: {eps}")

        if eps is None or eps <= 0:
            print(f"[LOG WARNING] EPS actual no válido para la compañía {compania.nombre}.")
            return 0

        # Calcular PER
        per_actual = round(compania.precio_actual / eps, 2)
        print(f"[LOG INFO] PER actual calculado: {per_actual}")
        return per_actual
    except Exception as e:
        print(f"[LOG ERROR] Error al calcular el PER para la compañía con ID {company_id}: {e}")
        return 0

#Calulo Per Medio 5Y
def calcular_per_medio_5y(company_id):
    # Implementa la lógica para calcular el promedio del PER de los últimos 5 años
    return 0  # Retorna 0 por defecto si no hay datos
#Clasificacion de la compania
def clasificar_compania(company_id):
    # Implementa la lógica para asignar una clasificación según criterios específicos
    return "0"  # Clasificación por defecto


# Ruta principal manejo sigin and signup(index)
@app.route('/', methods=['GET', 'POST'])
def index():
    app.logger.info("[START] Acceso a la página principal.")

    if current_user.is_authenticated:
        app.logger.info(f"[INFO] Usuario ya autenticado: {current_user.username}")
        return redirect(url_for('dashboard'))

    login_form = LoginForm()
    signup_form = SignupForm()
    login_open = False  # Controla si el modal de login debe estar abierto
    signup_open = False  # Controla si el modal de registro debe estar abierto

    # Manejo del formulario de inicio de sesión
    if login_form.submit.data:
        login_open = True  # Mantén abierto el modal de inicio de sesión
        app.logger.info("[INFO] Intentando iniciar sesión...")

        if login_form.validate_on_submit():
            email_or_username = login_form.email_or_username.data.strip()
            password = login_form.password.data
            app.logger.info(f"[INFO] Datos del formulario: email_or_username={email_or_username}")

            # Buscar usuario por correo o nombre de usuario
            user = User.query.filter(
                (User.email == email_or_username.lower()) | 
                (User.username == email_or_username)
            ).first()

            if user:
                app.logger.info(f"[INFO] Usuario encontrado: {user.username}")
            else:
                app.logger.warning("[WARN] Usuario no encontrado en la base de datos.")

            if user and user.check_password(password):
                login_user(user)
                app.logger.info(f"[INFO] Usuario autenticado exitosamente: {user.username}")
                flash('Has iniciado sesión exitosamente.', 'success')
                return redirect(url_for('dashboard'))
            else:
                app.logger.warning("[WARN] Credenciales inválidas.")
                flash('Credenciales inválidas. Inténtalo de nuevo.', 'login_error')

    # Manejo del formulario de registro
    if signup_form.submit.data:
        signup_open = True  # Mantén abierto el modal de registro
        app.logger.info("[INFO] Intentando registrarse...")

        if signup_form.validate_on_submit():
            username = signup_form.username.data.strip()
            email = signup_form.email.data.strip().lower()
            password = signup_form.password.data
            app.logger.info(f"[INFO] Datos del formulario de registro: username={username}, email={email}")

            existing_user = User.query.filter(
                (User.username == username) | 
                (User.email == email)
            ).first()

            if existing_user:
                app.logger.warning(f"[WARN] Usuario o correo ya existe: username={username}, email={email}")
                flash('Usuario o correo ya existe. Por favor, elige otro.', 'signup_error')
            else:
                new_user = User(username=username, email=email)
                new_user.set_password(password)
                app.logger.info(f"[INFO] Registrando nuevo usuario: {username}")

                try:
                    db.session.add(new_user)
                    db.session.commit()
                    flash('¡Cuenta creada exitosamente! Has iniciado sesión.', 'success')
                    login_user(new_user)
                    app.logger.info(f"[INFO] Usuario registrado y autenticado: {username}")
                    return redirect(url_for('dashboard'))
                except Exception as e:
                    db.session.rollback()
                    app.logger.error(f"[ERROR] Error al registrar usuario: {e}")
                    flash(f'Error inesperado: {str(e)}', 'signup_error')
        else:
            app.logger.warning("[WARN] Errores en la validación del formulario de registro.")
            for field, errors in signup_form.errors.items():
                for error in errors:
                    app.logger.warning(f"[WARN] Error en campo {field}: {error}")
                    flash(f"Error en {field}: {error}", 'signup_error')

    return render_template(
        'index.html', 
        login_form=login_form, 
        signup_form=signup_form, 
        login_open=login_open, 
        signup_open=signup_open
    )

# Ruta del dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# Ruta para el panel de administración personalizado
@app.route('/admin_dashboard_no_base')
@admin_required
def admin_dashboard():
    from sqlalchemy import inspect, text
    import json

    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    db_contents = {}

    for table in tables:
        try:
            columns = [column['name'] for column in inspector.get_columns(table)]
            rows = db.session.execute(text(f"SELECT * FROM {table}")).fetchall()
            rows_dict = [dict(zip(columns, row)) for row in rows]
            db_contents[table] = {"columns": columns, "rows": rows_dict}
        except Exception as e:
            db_contents[table] = {"error": str(e)}

    app.logger.info(f"[DEBUG] db_contents: {json.dumps(db_contents, indent=4)}")

    return render_template('admin_dashboard_no_base.html', db_contents=db_contents)



#ruta para obtener datos financieros y subirlos al admin en modal
@app.route('/financial_data/<int:company_id>')
@login_required
def financial_data(company_id):
    financial_record = DatosFinancieros.query.filter_by(compania_id=company_id).first()
    if financial_record and financial_record.datos:
        return jsonify(financial_record.datos)
    else:
        return jsonify({"error": "Datos no encontrados"}), 404


# Ruta para cerrar sesión
@app.route('/logout')
@login_required
def logout():
    app.logger.info(f"[LOGOUT] Usuario actual antes de cerrar sesión: {current_user.username}")
    logout_user()
    app.logger.info("[LOGOUT] Sesión cerrada. Verificando estado de usuario...")
    app.logger.info(f"[LOGOUT] Usuario autenticado después de logout: {current_user.is_authenticated}")
    flash('Has cerrado sesión.', 'info')
    return redirect(url_for('index'))


# Formularios
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, Regexp

class LoginForm(FlaskForm):
    email_or_username = StringField('Email o Usuario', validators=[
        DataRequired(),
        Length(min=2, max=20)
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired()
    ])
    submit = SubmitField('Iniciar Sesión')

class SignupForm(FlaskForm):
    username = StringField('Usuario', validators=[
        DataRequired(),
        Length(min=2, max=20)
    ])
    email = StringField('Email', validators=[
        DataRequired(),
        Email()
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired(),
        Length(min=8),
       Regexp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$', message="La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.")

    ])
    submit = SubmitField('Registrarse')
#configuracion para que escuche online a todo el mundo
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

#Interaccion con ChatGPT

