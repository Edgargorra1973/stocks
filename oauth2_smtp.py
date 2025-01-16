# oauth2_smtp.py

import base64
import smtplib
import msal
import os

# Configuración de OAuth2
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
TENANT_ID = os.environ.get('TENANT_ID')
AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
SCOPE = ['https://outlook.office365.com/.default']

def get_access_token():
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=SCOPE)
    if 'access_token' in result:
        return result['access_token']
    else:
        raise Exception(f"Error obteniendo el token: {result.get('error')}, {result.get('error_description')}")

def generate_oauth2_string(username, access_token):
    auth_string = f"user={username}\1auth=Bearer {access_token}\1\1"
    return base64.b64encode(auth_string.encode()).decode()

def send_email(subject, body, to_recipients, sender=None):
    if sender is None:
        sender = os.environ.get('EMAIL_USER')
    
    access_token = get_access_token()
    auth_string = generate_oauth2_string(sender, access_token)
    
    msg = f"""From: {sender}
To: {", ".join(to_recipients)}
Subject: {subject}

{body}
"""
    
    try:
        with smtplib.SMTP('smtp-mail.outlook.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.docmd('AUTH', 'XOAUTH2 ' + auth_string)
            server.sendmail(sender, to_recipients, msg)
            print("Correo enviado exitosamente.")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
        raise e
