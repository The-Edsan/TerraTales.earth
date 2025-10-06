import ee
import os
import json
import tempfile 

def init_gee():
    """
    Inicializa Google Earth Engine.
    Usa un archivo temporal y una variable de entorno en producción.
    """
    try:
        # Método 1: Producción (lee la variable de entorno y crea un archivo temporal)
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Setting up credentials via temporary file...")
            try:
                # Creamos un archivo temporal y escribimos el contenido del JSON
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                    temp_creds_file.write(service_account_json_str)
                    temp_file_path = temp_creds_file.name
                
                print(f"✅ Credentials written to temp file: {temp_file_path}")

                # --- EL PASO CLAVE Y DEFINITIVO ---
                # Le decimos al sistema operativo dónde encontrar nuestro archivo de credenciales.
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file_path

                # Ahora, inicializamos SIN PASARLE NADA. La librería buscará la variable
                # de entorno que acabamos de crear y se autenticará automáticamente.
                ee.Initialize()
                # --- FIN DEL CAMBIO ---
                
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
