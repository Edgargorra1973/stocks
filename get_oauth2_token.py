# get_oauth2_token.py

import msal

CLIENT_ID = 'TU_CLIENT_ID'
CLIENT_SECRET = 'TU_CLIENT_SECRET'
TENANT_ID = 'TU_TENANT_ID'
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

if __name__ == "__main__":
    token = get_access_token()
    print(token)
