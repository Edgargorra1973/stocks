import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Clave secreta para proteger las sesiones (obligatoria en producción)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'clave_por_defecto')


    # Configuración de la URI de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'site.db') + '?timeout=30'

    # Validar el uso de SQLite en producción
    if 'sqlite' in SQLALCHEMY_DATABASE_URI and not os.getenv('FLASK_ENV') == 'development':
        raise ValueError("SQLite no es adecuado para producción. Configura una base de datos adecuada.")

    # Desactiva la modificación de seguimiento (ahorra recursos)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de cookies de sesión
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Tiempo de vida de la sesión
    PERMANENT_SESSION_LIFETIME = int(os.environ.get('SESSION_LIFETIME', 3600))

    # Configuración de migraciones (opcional)
    ALEMBIC = {
        'script_location': 'migrations'
    }

    # Depuración (por defecto apagada en producción)
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
