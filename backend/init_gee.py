import ee
import os

def init_gee():
    """
    Inicializa Google Earth Engine.
    Prioriza las credenciales de producción (Secret File en Render)
    y usa la autenticación local como alternativa para desarrollo.
    """
    try:
        # Verificamos si estamos en un entorno de producción como Render
        # Render crea automáticamente la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
        # cuando se configura un "Secret File".
        if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
            print("✅ Production credentials found. Initializing Earth Engine...")
            # La librería de 'ee' detecta la variable de entorno automáticamente.
            # No necesitamos pasarle nada.
            ee.Initialize()
            print("✅ Earth Engine initialized successfully in production mode.")
        else:
            # Si no, usamos el método de autenticación local para desarrollo
            print("⚠️ No production credentials found. Falling back to local authentication...")
            # Este es el flujo que usas en tu PC
            ee.Initialize()
            print("✅ Earth Engine initialized with local credentials.")

    except Exception as e:
        print(f"❌ Failed to initialize Earth Engine: {e}")
        # Es importante lanzar la excepción para que el servidor falle y te muestre el error
        raise e
