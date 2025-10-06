# indices.py
import ee
from datetime import datetime

# ==============================
# STUDY REGIONS
# ==============================
REGIONS = {
    "alaska": ee.Geometry.Rectangle([-147.8, 61.0, -146.2, 61.6]),
    "manaos": ee.Geometry.Rectangle([-60.2, -3.3, -59.8, -2.9]),
    "cdmx": ee.Geometry.Rectangle([-99.3, 19.2, -98.9, 19.6])
}

# ==============================
# VISUALIZATION
# ==============================
# --- CAMBIO AQUÍ: Se elimina 'white' de las paletas ---
VIS = {
    # ANTES: "NDVI": {"min": -1, "max": 1, "palette": ['blue', 'white', 'green']},
    # DESPUÉS:
    "NDVI": {"min": -1, "max": 1, "palette": ['blue', 'green']},
    
    # ANTES: "NDSI": {"min": -1, "max": 1, "palette": ['red', 'white', 'cyan']},
    # DESPUÉS:
    "NDSI": {"min": -1, "max": 1, "palette": ['red', 'cyan']},
    
    # ANTES: "NDBI": {"min": -1, "max": 1, "palette": ['blue', 'white', 'yellow']},
    # DESPUÉS:
    "NDBI": {"min": -1, "max": 1, "palette": ['blue', 'yellow']}
}
# --- FIN DE CAMBIO ---

# ==============================
# Helpers: rename by sensor
# ==============================
def _rename_l57(img):
    return img.select(
        ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
        ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
    )

def _rename_l8(img):
    return img.select(
        ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
        ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
    )

# ==============================
# Build Landsat collections
# ==============================
def get_landsat_collection_for_period(region, start_date, end_date, cloud_thresh=40):
    col5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2") \
        .filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)) \
        .map(_rename_l57)
    col7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2") \
        .filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)) \
        .map(_rename_l57)
    col8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2") \
        .filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)) \
        .map(_rename_l8)
    col9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2") \
        .filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)) \
        .map(_rename_l8)

    merged = col5.merge(col7).merge(col8).merge(col9)
    return merged

# ==============================
# Image composition
# ==============================
def _compose_from_collection(col, region, limit=5):
    col_sorted = col.sort('CLOUD_COVER').limit(limit)
    size = col_sorted.size().getInfo()
    if size == 0:
        return None
    img = col_sorted.mean().clip(region)
    try:
        bnames = img.bandNames().getInfo()
    except Exception:
        bnames = []
    if not bnames:
        return None
    return img

def get_image(region, year, cloud_thresh=40, limit=5, prefer_summer=False):
    if prefer_summer:
        start = f"{year}-06-01"
        end = f"{year}-08-31"
    else:
        start = f"{year}-01-01"
        end = f"{year}-12-31"

    col = get_landsat_collection_for_period(region, start, end, cloud_thresh)
    img = _compose_from_collection(col, region, limit=limit)
    if img:
        return img

    start2 = f"{max(year-1, 1972)}-01-01"
    end2 = f"{year+1}-12-31"
    col2 = get_landsat_collection_for_period(region, start2, end2, cloud_thresh)
    img2 = _compose_from_collection(col2, region, limit=max(limit, 8))
    if img2:
        return img2

    raise RuntimeError(f"No images available for the region in {year}.")

# ==============================
# Index calculations
# ==============================
def compute_ndvi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    ndvi = img.normalizedDifference(['NIR', 'RED']).rename('NDVI')
    return ndvi

def compute_ndsi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    ndsi = img.normalizedDifference(['GREEN', 'SWIR1']).rename('NDSI')
    return ndsi

def compute_ndbi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    ndbi = img.normalizedDifference(['SWIR1', 'NIR']).rename('NDBI')
    return ndbi

# ==============================
# Generators for frontend
# ==============================
def generar_thumb_url_from_img(img, region, vis, dimensions=512):
    params = {
        'min': vis['min'],
        'max': vis['max'],
        'palette': vis['palette'],
        'region': region.bounds().getInfo(),
        'dimensions': dimensions,
        'format': 'png'
    }
    return img.getThumbURL(params)

def generate_tile_url(index, region_name, year, thumb_dimensions=256, scale=60, prefer_summer=False, limit=5):
    region_name = region_name.lower()
    if region_name not in REGIONS:
        raise ValueError(f"Region '{region_name}' is not valid.")
    region = REGIONS[region_name]

    if index == "ndvi":
        img = compute_ndvi(region, year, prefer_summer=prefer_summer, limit=limit)
    elif index == "ndsi":
        img = compute_ndsi(region, year, prefer_summer=prefer_summer, limit=limit)
    elif index == "ndbi":
        img = compute_ndbi(region, year, prefer_summer=prefer_summer, limit=limit)
    else:
        raise ValueError("Invalid index.")

    vis = VIS[index.upper()]

    try:
        mapid_dict = img.getMapId({'min': vis['min'], 'max': vis['max'], 'palette': vis['palette'], 'scale': scale})
    except Exception as e:
        raise RuntimeError(f"Error generating mapid (tiles): {e}")

    tile_url = None
    mapid = None
    token = None

    try:
        if isinstance(mapid_dict, dict):
            tf = mapid_dict.get('tile_fetcher')
            if tf and hasattr(tf, 'url_format'):
                tile_url = tf.url_format
            mapid = mapid_dict.get('mapid')
            token = mapid_dict.get('token')
            if not tile_url and mapid and token:
                tile_url = f"https://earthengine.googleapis.com/map/{mapid}/{{z}}/{{x}}/{{y}}?token={token}"
        else:
            try:
                tf = getattr(mapid_dict, 'tile_fetcher', None)
                if tf and hasattr(tf, 'url_format'):
                    tile_url = tf.url_format
            except Exception:
                tile_url = None
    except Exception:
        tile_url = None

    try:
        thumb_url = generar_thumb_url_from_img(img, region, vis, dimensions=thumb_dimensions)
    except Exception:
        thumb_url = None

    try:
        bbox = region.bounds().getInfo()
    except Exception:
        bbox = None

    out = {
        'tile_url': tile_url,
        'url': thumb_url,
        'bbox': bbox,
        'mapid': mapid,
        'token': token
    }
    return out