# send_email_graph.py

import requests
from msal import ConfidentialClientApplication

CLIENT_ID = 'TU_CLIENT_ID'
CLIENT_SECRET = 'TU_CLIENT_SECRET'
TENANT_ID = 'TU_TENANT_ID'
AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
SCOPE = ['https://graph.microsoft.com/.default']

def get_access_token():
    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=SCOPE)
    if 'access_token' in result:
        return result['access_token']
    else:
        raise Exception(f"Error obteniendo el token: {result.get('error')}, {result.get('error_description')}")

def send_email(subject, body, to_recipients, from_email):
    access_token = get_access_token()
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
            "toRecipients": [{"emailAddress": {"address": addr}} for addr in to_recipients],
            "from": {"emailAddress": {"address": from_email}}
        }
    }
    response = requests.post('https://graph.microsoft.com/v1.0/me/sendMail', headers=headers, json=email_msg)
    if response.status_code == 202:
        print("Correo enviado exitosamente.")
    else:
        print(f"Error al enviar el correo: {response.status_code}, {response.text}")

if __name__ == "__main__":
    subject = "Correo de Prueba desde Microsoft Graph API"
    body = "<p>Este es un correo de prueba enviado usando Microsoft Graph API.</p>"
    to_recipients = ['destinatario@ejemplo.com']
    from_email = 'support@mygeedee.com'
    send_email(subject, body, to_recipients, from_email)
