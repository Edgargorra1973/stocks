from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin
from datetime import datetime, timedelta

# Inicialización de las extensiones
db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  # Campo para roles

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f"User('{self.username}', '{self.email}', Admin={self.is_admin})"

class Compania(db.Model):
    __tablename__ = 'companias'

    id = db.Column(db.Integer, primary_key=True)
    simbolo = db.Column(db.String(10), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=True)
    sector = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relación con DatosFinancieros
    datos_financieros = db.relationship('DatosFinancieros', backref='compania', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"Compania('{self.simbolo}', '{self.nombre}')"

class DatosFinancieros(db.Model):
    __tablename__ = 'datos_financieros'
    
    id = db.Column(db.Integer, primary_key=True)
    compania_id = db.Column(db.Integer, db.ForeignKey('companias.id'), nullable=False)
    tipo_tabla = db.Column(db.String(50), nullable=False)  # Ej: 'balance_sheet', 'ratios'
    frecuencia = db.Column(db.String(20), nullable=False)  # 'quarterly' o 'yearly'
    datos = db.Column(db.JSON, nullable=False)  # Almacena la tabla en formato JSON
    fecha_extraccion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_caducidad = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=30), nullable=False)

    def __repr__(self):
        return f"DatosFinancieros('{self.tipo_tabla}', '{self.frecuencia}', Caduca el {self.fecha_caducidad})"

