from flask import Blueprint, jsonify
from models import db, Compania, DatosFinancieros

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/companies', methods=['GET'])
def get_companies():
    """
    Devuelve una lista de todas las compañías en la base de datos con sus símbolos y nombres.
    """
    companies = Compania.query.all()
    data = [{'simbolo': company.simbolo, 'nombre': company.nombre} for company in companies]
    return jsonify(data)

@api_bp.route('/companies/<string:simbolo>/financials', methods=['GET'])
def get_financials(simbolo):
    # Convertir el símbolo a minúsculas para buscarlo en la base de datos
    simbolo = simbolo.lower()
    print(f"[DEBUG] Buscando datos financieros para el símbolo: {simbolo}")
    
    # Buscar la compañía en la base de datos
    company = Compania.query.filter_by(simbolo=simbolo).first()
    if not company:
        print(f"[ERROR] Compañía no encontrada para el símbolo: {simbolo}")
        return jsonify({'message': 'Company not found'}), 404
    
    # Buscar datos financieros asociados a la compañía
    financials = DatosFinancieros.query.filter_by(compania_id=company.id).all()
    if not financials:
        print(f"[ERROR] No se encontraron datos financieros para la compañía con símbolo: {simbolo}")
        return jsonify({'message': 'Financial data not found'}), 404

    # Crear un diccionario con los datos financieros
    data = {f"{f.tipo_tabla}_{f.frecuencia}": f.datos for f in financials}
    return jsonify(data)

@api_bp.route('/companies/<string:simbolo>/charts', methods=['GET'])
def get_charts(simbolo):
    """
    Devuelve datos específicos como EPS (Basic) organizados para gráficos.
    """
    print(f"[DEBUG] Generando datos de gráficos para: {simbolo}")
    company = Compania.query.filter_by(simbolo=simbolo).first()
    if not company:
        print(f"[ERROR] No se encontró la compañía con símbolo: {simbolo}")
        return jsonify({'message': 'Company not found'}), 404

    income_statements = DatosFinancieros.query.filter_by(
        compania_id=company.id,
        tipo_tabla='income',
        frecuencia='yearly'
    ).first()

    if not income_statements:
        print(f"[ERROR] No se encontraron datos financieros para: {simbolo}")
        return jsonify({'message': 'Financial data not found'}), 404

    eps_data = []
    rows = income_statements.datos.get('rows', [])
    for row in rows:
        if row[0] == 'EPS (Basic)':  # Ajusta el nombre del campo según tu base de datos
            try:
                for i in range(1, len(row)):
                    eps = row[i]
                    period = income_statements.datos.get('headers', [])[i]
                    if eps and period:
                        eps_value = float(eps.replace(',', '').replace('N/A', '0'))
                        eps_data.append({'period': period, 'eps': eps_value})
            except (ValueError, IndexError) as e:
                print(f"[ERROR] Error al procesar EPS: {e}")

    print(f"[DEBUG] Datos EPS para gráficos: {eps_data}")
    return jsonify(sorted(eps_data, key=lambda x: x['period'], reverse=True))
