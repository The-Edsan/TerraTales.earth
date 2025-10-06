import ee
import os
import json

def init_gee():
    """
    Inicializa Google Earth Engine.
    Prioriza las credenciales de producción desde la variable de entorno SERVICE_ACCOUNT_JSON.
    """
    try:
        # Método 1: Producción (lee la variable de entorno con el JSON)
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON environment variable. Initializing Earth Engine...")
            try:
                # Parsea el string JSON a un diccionario de Python
                creds_info = json.loads(service_account_json_str)
                
                # Crea las credenciales a partir de la información del JSON
                creds = ee.ServiceAccountCredentials(
                    client_email=creds_info['client_email'], 
                    key_data=creds_info['private_key']
                )
                
                # Inicializa Earth Engine con estas credenciales
                ee.Initialize(credentials=creds)
                print("✅ Earth Engine initialized successfully in production mode.")
                return # Termina la función exitosamente
            except Exception as e:
                print(f"❌ Failed to parse or use SERVICE_ACCOUNT_JSON: {e}")
                raise e
        
        # Método 2: Fallback para desarrollo local (si la variable de arriba no existe)
        print("⚠️ No SERVICE_ACCOUNT_JSON found. Falling back to local authentication...")
        try:
            ee.Initialize()
            print("✅ Earth Engine initialized with local credentials.")
        except Exception as e:
            print(f"❌ Failed to initialize with local credentials: {e}")
            raise e

    except Exception as e:
        print(f"❌ An unexpected error occurred during GEE initialization: {e}")
        raise e
