import ee
import os
import json
import tempfile 

# --- CAMBIO 1: Definimos los permisos (scopes) necesarios ---
EE_SCOPES = [
    'https://www.googleapis.com/auth/earthengine',
    'https://www.googleapis.com/auth/cloud-platform'
]
# --- FIN DE CAMBIO ---

def init_gee():
    """
    Inicializa Google Earth Engine.
    Usa un archivo temporal y scopes explícitos en producción.
    """
    try:
        # Método 1: Producción
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Setting up credentials via temporary file...")
            try:
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                    temp_creds_file.write(service_account_json_str)
                    temp_file_path = temp_creds_file.name
                
                print(f"✅ Credentials written to temp file: {temp_file_path}")

                creds = ee.ServiceAccountCredentials(
                    account=None, # El email se lee desde el archivo
                    key_file=temp_file_path
                )
                
                # --- CAMBIO 2: Pasamos los scopes al inicializar ---
                ee.Initialize(credentials=creds, opt_scopes=EE_SCOPES)
                # --- FIN DE CAMBIO ---
                
                print("✅ Earth Engine initialized successfully in production mode.")
                return
            except Exception as e:
                print(f"❌ Failed during production initialization: {e}")
                raise e
        
        # Método 2: Fallback para desarrollo local
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
