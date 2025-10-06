import ee
import os
import json
import tempfile # Importamos la librería para crear archivos temporales

def init_gee():
    """
    Inicializa Google Earth Engine.
    Usa un archivo temporal para las credenciales en producción.
    """
    try:
        # Método 1: Producción (lee la variable de entorno y la escribe en un archivo temporal)
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Writing to temp file for authentication...")
            try:
                # Creamos un archivo temporal y escribimos el contenido del JSON en él
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                    temp_creds_file.write(service_account_json_str)
                    temp_file_path = temp_creds_file.name
                
                print(f"✅ Credentials written to temporary file: {temp_file_path}")

                # Ahora, inicializamos Earth Engine usando la ruta de ese archivo temporal
                # Este es el método de autenticación más estándar y robusto
                creds = ee.ServiceAccountCredentials(
                    account='', # El email se lee desde el archivo
                    key_file=temp_file_path
                )
                ee.Initialize(credentials=creds)
                
                print("✅ Earth Engine initialized successfully in production mode.")
                return # Termina la función exitosamente
            except Exception as e:
                print(f"❌ Failed during temporary credential file setup: {e}")
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
