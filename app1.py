# app.py

from flask import Flask, render_template, redirect, url_for, request, flash
from config import Config
from models import db, bcrypt, User
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf import CSRFProtect
from sqlalchemy.exc import IntegrityError
from functools import wraps
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

app = Flask(__name__)
app.config.from_object(Config)

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

# Ruta principal (index)
@app.route('/', methods=['GET', 'POST'])
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    login_form = LoginForm()
    signup_form = SignupForm()
    
    # Manejo del formulario de registro
    if signup_form.submit.data and signup_form.validate_on_submit():
        username = signup_form.username.data.strip()
        email = signup_form.email.data.strip().lower()
        password = signup_form.password.data

        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Usuario o correo ya existe. Por favor, elige otro.', 'danger')
            return redirect(url_for('index'))

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash('¡Cuenta creada exitosamente! Has iniciado sesión.', 'success')
            login_user(new_user)
            return redirect(url_for('dashboard'))
        except IntegrityError:
            db.session.rollback()
            flash('Error al crear la cuenta. Por favor, inténtalo de nuevo.', 'danger')
            return redirect(url_for('index'))

    # Manejo del formulario de inicio de sesión
    if login_form.submit.data and login_form.validate_on_submit():
        email_or_username = login_form.email_or_username.data.strip()
        password = login_form.password.data

        user = User.query.filter(
            (User.email == email_or_username.lower()) | 
            (User.username == email_or_username)
        ).first()

        if user and user.check_password(password):
            login_user(user)
            flash('Has iniciado sesión exitosamente.', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Credenciales inválidas. Inténtalo de nuevo.', 'danger')
            return redirect(url_for('index'))

    return render_template('index.html', login_form=login_form, signup_form=signup_form)

# Ruta del dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# Ruta para el panel de administración personalizado
@app.route('/admin_dashboard')
@admin_required
def admin_dashboard():
    from sqlalchemy import inspect, text
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    db_contents = {}

    for table in tables:
        if table == 'alembic_version':  # Opcionalmente excluye esta tabla
            continue
        # Obtener los nombres de las columnas
        columns = [column['name'] for column in inspector.get_columns(table)]
        # Convertir filas a diccionarios
        rows = db.session.execute(text(f"SELECT * FROM {table}")).fetchall()
        rows_dict = [dict(zip(columns, row)) for row in rows]
        db_contents[table] = {
            'columns': columns,
            'rows': rows_dict
        }

    return render_template('admin_dashboard.html', db_contents=db_contents, tables=tables)


# Ruta para cerrar sesión
@app.route('/logout')
@login_required
def logout():
    logout_user()
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

if __name__ == '__main__':
    app.run(debug=True)
