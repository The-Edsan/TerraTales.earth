import ee
import os
import json
import tempfile 

# Definimos los permisos (scopes) correctos que la API necesita
EE_SCOPES = [
    'https://www.googleapis.com/auth/earthengine',
    'https://www.googleapis.com/auth/cloud-platform'
]

def init_gee():
    """
    Inicializa Google Earth Engine usando el método de autenticación estándar
    a través de una variable de entorno y especificando los scopes correctos.
    """
    try:
        # Método de producción
        service_account_json_str = os.getenv('SERVICE_ACCOUNT_JSON')
        if service_account_json_str:
            print("✅ Found SERVICE_ACCOUNT_JSON. Attempting production authentication...")
            try:
                # 1. Creamos el archivo temporal
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_creds_file:
                    temp_creds_file.write(service_account_json_str)
                    temp_file_path = temp_creds_file.name
                
                # 2. Le decimos al sistema dónde encontrarlo
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file_path
                print(f"✅ Set GOOGLE_APPLICATION_CREDENTIALS to: {temp_file_path}")

                # --- EL CAMBIO FINAL Y CLAVE ---
                # 3. Inicializamos, dejando que encuentre las credenciales automáticamente,
                #    PERO especificando los permisos (scopes) correctos.
                ee.Initialize(opt_scopes=EE_SCOPES)
                # --- FIN DEL CAMBIO ---
                
                print("✅✅✅ Earth Engine initialized successfully in production mode! ✅✅✅")
                return 
            except Exception as e:
                print(f"❌ ERROR during production initialization: {e}")
                raise e
    
        # Fallback para desarrollo local
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
