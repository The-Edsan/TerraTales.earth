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
                creds_info = json.loads(service_account_json_str)
                
                # --- CAMBIO AQUÍ: Usamos los nombres de parámetros correctos ---
                creds = ee.ServiceAccountCredentials(
                    creds_info['client_email'],    # El email es el primer argumento, sin nombre de parámetro
                    key=creds_info['private_key']  # El nombre del parámetro es 'key', no 'key_data'
                )
                # --- FIN DE CAMBIO ---
                
                ee.Initialize(credentials=creds)
                print("✅ Earth Engine initialized successfully in production mode.")
                return 
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
