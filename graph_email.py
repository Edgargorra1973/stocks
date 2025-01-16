# graph_email.py

import os
import msal
import requests

# Configuración de OAuth2
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
TENANT_ID = os.environ.get('TENANT_ID')
AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
SCOPE = ['https://graph.microsoft.com/.default']

def get_graph_access_token():
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

def send_graph_email(subject, body, to_recipients, from_email=None):
    access_token = get_graph_access_token()
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body
            },
            "toRecipients": [{"emailAddress": {"address": addr}} for addr in to_recipients]
        }
    }
    if from_email:
        email_msg["message"]["from"] = {"emailAddress": {"address": from_email}}

    response = requests.post('https://graph.microsoft.com/v1.0/users/{}/sendMail'.format(from_email or 'me'), headers=headers, json=email_msg)
    if response.status_code == 202:
        print("Correo enviado exitosamente.")
    else:
        print(f"Error al enviar el correo: {response.status_code}, {response.text}")
        raise Exception(f"Error al enviar el correo: {response.status_code}, {response.text}")
