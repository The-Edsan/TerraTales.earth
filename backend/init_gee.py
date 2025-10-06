import ee
import os
import json
# --- CAMBIO 1: Importamos la librería de autenticación principal de Google ---
from google.oauth2 import service_account

# Definimos los permisos (scopes) correctos que la API necesita
EE_SCOPES = [
    'https://www.googleapis.com/auth/earthengine',
    'https://www.googleapis.com/auth/cloud-platform'
]

def init_gee():
    """
    Inicializa Google Earth Engine usando la librería google-auth para crear
    las credenciales con los scopes correctos antes de pasarlas a ee.Initialize.
    """
    try:
        # Método de producción
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Using google-auth library for credentials...")
            try:
                # 1. Parseamos el JSON que viene de la variable de entorno
                creds_info = json.loads(service_account_json_str)
                
                # --- CAMBIO 2: Usamos la librería oficial de Google para crear las credenciales ---
                # Esto nos permite especificar los scopes de forma segura.
                credentials = service_account.Credentials.from_service_account_info(
                    creds_info, 
                    scopes=EE_SCOPES
                )
                
                # 3. Inicializamos Earth Engine pasándole el objeto de credenciales ya listo.
                ee.Initialize(credentials=credentials)
                # --- FIN DEL CAMBIO ---
                
                print("✅✅✅ Earth Engine initialized successfully in production mode! ✅✅✅")
                return
            except Exception as e:
                print(f"❌ ERROR during production initialization: {e}")
                raise e
        
        # Método de Fallback para desarrollo local
        print("⚠️ Production credentials not found. Falling back to local authentication...")
        try:
            ee.Initialize()
            print("✅ Earth Engine initialized with local credentials.")
        except Exception as e:
            print(f"❌ ERROR during local initialization: {e}")
            raise e

    except Exception as e:
        print(f"❌ An unexpected error occurred during GEE initialization: {e}")
        raise e
