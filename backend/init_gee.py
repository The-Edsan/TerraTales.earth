import ee
import os
import json
import tempfile 

# Definimos los permisos (scopes) necesarios para la API
EE_SCOPES = [
    'https://www.googleapis.com/auth/earthengine',
    'https://www.googleapis.com/auth/cloud-platform'
]

def init_gee():
    """
    Inicializa Google Earth Engine.
    Usa un archivo temporal y scopes explícitos en producción.
    """
    try:
        # Método 1: Producción (lee la variable de entorno y crea un archivo temporal)
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Setting up credentials via temporary file...")
            try:
                # Creamos un archivo temporal para guardar las credenciales
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                    temp_creds_file.write(service_account_json_str)
                    temp_file_path = temp_creds_file.name
                
                print(f"✅ Credentials written to temp file: {temp_file_path}")

                # Creamos el objeto de credenciales usando la ruta al archivo temporal
                creds = ee.ServiceAccountCredentials(
                    account=None, # El email se lee desde el propio archivo
                    key_file=temp_file_path
                )
                
                # Inicializamos pasando explícitamente las credenciales y los scopes
                ee.Initialize(credentials=creds, opt_scopes=EE_SCOPES)
                
                print("✅ Earth Engine initialized successfully in production mode.")
                return
            except Exception as e:
                print(f"❌ Failed during production initialization: {e}")
                raise e
        
        # Método 2: Fallback para desarrollo local (si la variable de producción no existe)
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
