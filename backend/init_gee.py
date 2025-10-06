import ee
import os
import json
import tempfile

def init_gee():
    """
    Inicializa Google Earth Engine usando el método de autenticación estándar
    a través de una variable de entorno que apunta a un archivo de credenciales.
    """
    # Intentamos el método de producción primero
    service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
    if service_account_json_str:
        print("✅ Found SERVICE_ACCOUNT_JSON. Attempting production authentication...")
        try:
            # 1. Creamos un archivo temporal y escribimos el contenido del JSON en él
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                temp_creds_file.write(service_account_json_str)
                temp_file_path = temp_creds_file.name
            
            # 2. Le decimos al sistema dónde encontrar este archivo de credenciales
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file_path
            print(f"✅ Set GOOGLE_APPLICATION_CREDENTIALS to: {temp_file_path}")

            # 3. Llamamos a Initialize() SIN ARGUMENTOS.
            # La librería buscará la variable de entorno que acabamos de crear.
            ee.Initialize()
            
            print("✅ Earth Engine initialized successfully in production mode.")
            return # Éxito
        except Exception as e:
            print(f"❌ ERROR during production initialization: {e}")
            raise e
    
    # Si no estamos en producción, intentamos el método local
    print("⚠️ Production credentials not found. Falling back to local authentication...")
    try:
        ee.Initialize()
        print("✅ Earth Engine initialized with local credentials.")
    except Exception as e:
        print(f"❌ ERROR during local initialization: {e}")
        raise e
