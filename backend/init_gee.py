import ee
import os
import json

def init_gee():
    """
    Inicializa Google Earth Engine con credenciales locales y el proyecto correcto.
    """
    try:
        credentials_path = os.path.expanduser("~/.config/earthengine/credentials")
        if not os.path.exists(credentials_path):
            print("⚠️ No se encontraron credenciales locales. Ejecuta:")
            print("   earthengine authenticate")
            return

        with open(credentials_path) as f:
            creds = json.load(f)
        project_id = creds.get("project", "banded-object-293822")

        ee.Initialize(project=project_id)
        print(f"✅ Earth Engine inicializado correctamente con el proyecto: {project_id}")

    except Exception as e:
        print(f"❌ Error al inicializar Earth Engine: {e}")
        raise
