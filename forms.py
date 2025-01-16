# forms.py

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length

class LoginForm(FlaskForm):
    email_or_username = StringField('Email o Usuario', validators=[
        DataRequired(message="Este campo es obligatorio."),
        Length(min=2, max=20, message="Debe tener entre 2 y 20 caracteres.")
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired(message="Este campo es obligatorio.")
    ])
    submit = SubmitField('Iniciar Sesión')

class SignupForm(FlaskForm):
    username = StringField('Usuario', validators=[
        DataRequired(message="Este campo es obligatorio."),
        Length(min=2, max=20, message="Debe tener entre 2 y 20 caracteres.")
    ])
    email = StringField('Email', validators=[
        DataRequired(message="Este campo es obligatorio."),
        Email(message="Debe ser un email válido.")
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired(message="Este campo es obligatorio.")
    ])
    submit = SubmitField('Registrarse')
