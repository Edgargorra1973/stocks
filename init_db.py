from models import db, User, Compania, DatosFinancieros
from app import app

# Inicializar la aplicación y el contexto de la base de datos
with app.app_context():
    print("Creando tablas en la base de datos...")
    db.create_all()  # Esto crea todas las tablas que faltan en la base de datos
    print("Tablas creadas con éxito.")
