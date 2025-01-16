# eliminar_usuarios.py

from app import app, db
from models import User

def eliminar_todos_los_usuarios():
    with app.app_context():
        usuarios = User.query.all()
        for usuario in usuarios:
            db.session.delete(usuario)
        db.session.commit()
        print("Todos los usuarios han sido eliminados exitosamente.")

def eliminar_usuario_por_email(email):
    with app.app_context():
        usuario = User.query.filter_by(email=email).first()
        if usuario:
            db.session.delete(usuario)
            db.session.commit()
            print(f"Usuario {usuario.username} eliminado exitosamente.")
        else:
            print("Usuario no encontrado.")

if __name__ == "__main__":
    # Eliminar todos los usuarios
    eliminar_todos_los_usuarios()
    
    # O bien, eliminar un usuario específico
    # eliminar_usuario_por_email('usuario@ejemplo.com')
