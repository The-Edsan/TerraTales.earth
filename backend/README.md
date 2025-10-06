# GeoTales Backend

Backend Flask para GeoTales que proporciona acceso a imágenes satelitales de Google Earth Engine.

## Requisitos

- Python 3.8+
- Cuenta de Google Earth Engine
- Credenciales de Earth Engine configuradas

## Instalación

1. Instalar dependencias:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Autenticar con Google Earth Engine:
\`\`\`bash
earthengine authenticate
\`\`\`

3. Configurar el proyecto de Earth Engine:
   - Edita `init_gee.py` y actualiza el `project_id` con tu proyecto de GEE

## Ejecución

\`\`\`bash
python app.py
\`\`\`

El servidor se ejecutará en `http://localhost:5000`

## Endpoints

### GET /get_image
Obtiene una imagen satelital para una región, índice y año específicos.

**Parámetros:**
- `sitio`: alaska, manaus, o cdmx
- `indice`: ndvi, ndsi, o ndbi
- `year`: año (1990-2025)
- `scale`: escala opcional (default: 60)
- `thumb`: dimensiones del thumbnail opcional

**Ejemplo:**
\`\`\`
GET /get_image?sitio=alaska&indice=ndsi&year=2020
\`\`\`

### GET /get_timeseries
Obtiene una serie temporal de valores de índice para una región.

**Parámetros:**
- `sitio`: alaska, manaus, o cdmx
- `indice`: ndvi, ndsi, o ndbi
- `start`: año inicial (default: 1990)
- `end`: año final (default: 2025)
- `force`: forzar recálculo (default: false)

**Ejemplo:**
\`\`\`
GET /get_timeseries?sitio=alaska&indice=ndsi&start=1990&end=2025
\`\`\`

### GET /tile_proxy/<mapid>/<z>/<x>/<y>.png
Proxy para tiles de Google Earth Engine con caché local.

## Configuración de CORS

El backend está configurado para aceptar peticiones desde:
- http://localhost:3000 (desarrollo local)
- https://*.vercel.app (producción Vercel)
- https://*.v0.app (preview v0)

## Caché

El backend cachea:
- Thumbnails en `static/cache/thumbs/`
- Tiles en `static/cache/tiles/`
- Series temporales en `static/cache/timeseries/`

## Conectar con Next.js

En tu aplicación Next.js, configura la variable de entorno:

\`\`\`
BACKEND_URL=http://localhost:5000
\`\`\`

Para producción, actualiza con la URL de tu backend desplegado.
