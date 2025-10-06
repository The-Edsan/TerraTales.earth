# indices.py
import ee
from datetime import datetime

REGIONS = {
    "alaska": [-147.8, 61.0, -146.2, 61.6],
    "manaos": [-60.2, -3.3, -59.8, -2.9],
    "cdmx": [-99.3, 19.2, -98.9, 19.6]
}

VIS = {
    # --- CAMBIO AQUÍ: Ajustamos el 'min' de NDVI ---
    # ANTES: "min": 0.0
    # DESPUÉS: Le damos un rango negativo para que el agua no sature el color azul.
    "NDVI": {
        "min": -0.2, 
        "max": 0.9,
        "palette": ['blue', 'green']
    },
    # --- FIN DE CAMBIO ---
    
    "NDSI": {
        "min": 0.0, 
        "max": 0.8,
        "palette": ['red', 'cyan']
    },
    "NDBI": {
        "min": -0.3, 
        "max": 0.5,
        "palette": ['blue', 'yellow']
    }
}

def _rename_l57(img):
    return img.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],['BLUE','GREEN','RED','NIR','SWIR1','SWIR2'])
def _rename_l8(img):
    return img.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],['BLUE','GREEN','RED','NIR','SWIR1','SWIR2'])

def get_landsat_collection_for_period(region, start_date, end_date, cloud_thresh=40):
    col5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2").filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)).map(_rename_l57)
    col7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2").filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)).map(_rename_l57)
    col8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)).map(_rename_l8)
    col9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2").filterBounds(region).filterDate(start_date, end_date).filter(ee.Filter.lt("CLOUD_COVER", cloud_thresh)).map(_rename_l8)
    return col5.merge(col7).merge(col8).merge(col9)

def _compose_from_collection(col, region, limit=5):
    col_sorted = col.sort('CLOUD_COVER').limit(limit)
    size = col_sorted.size().getInfo()
    if size == 0: return None
    img = col_sorted.mean().clip(region)
    try: bnames = img.bandNames().getInfo()
    except Exception: bnames = []
    if not bnames: return None
    return img

def get_image(region, year, cloud_thresh=40, limit=5, prefer_summer=False):
    if prefer_summer: start, end = f"{year}-06-01", f"{year}-08-31"
    else: start, end = f"{year}-01-01", f"{year}-12-31"
    col = get_landsat_collection_for_period(region, start, end, cloud_thresh)
    img = _compose_from_collection(col, region, limit=limit)
    if img: return img
    start2, end2 = f"{max(year-1, 1972)}-01-01", f"{year+1}-12-31"
    col2 = get_landsat_collection_for_period(region, start2, end2, cloud_thresh)
    img2 = _compose_from_collection(col2, region, limit=max(limit, 8))
    if img2: return img2
    raise RuntimeError(f"No images available for the region in {year}.")

def compute_ndvi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    return img.normalizedDifference(['NIR', 'RED']).rename('NDVI')

def compute_ndsi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    return img.normalizedDifference(['GREEN', 'SWIR1']).rename('NDSI')

def compute_ndbi(region, year, **kwargs):
    img = get_image(region, year, **kwargs)
    return img.normalizedDifference(['SWIR1', 'NIR']).rename('NDBI')

def generar_thumb_url_from_img(img, region, vis, dimensions=512):
    params = {'min': vis['min'], 'max': vis['max'], 'palette': vis['palette'], 'region': region.bounds().getInfo(), 'dimensions': dimensions, 'format': 'png'}
    return img.getThumbURL(params)

def generate_tile_url(index, region_name, year, thumb_dimensions=256, scale=60, prefer_summer=False, limit=5):
    region_name = region_name.lower()
    if region_name not in REGIONS:
        raise ValueError(f"Region '{region_name}' is not valid.")
    
    region_coords = REGIONS[region_name]
    region = ee.Geometry.Rectangle(region_coords)

    if index == "ndvi": img = compute_ndvi(region, year, prefer_summer=prefer_summer, limit=limit)
    elif index == "ndsi": img = compute_ndsi(region, year, prefer_summer=prefer_summer, limit=limit)
    elif index == "ndbi": img = compute_ndbi(region, year, prefer_summer=prefer_summer, limit=limit)
    else: raise ValueError("Invalid index.")

    vis = VIS[index.upper()]

    try: mapid_dict = img.getMapId({'min': vis['min'], 'max': vis['max'], 'palette': vis['palette'], 'scale': scale})
    except Exception as e: raise RuntimeError(f"Error generating mapid (tiles): {e}")

    tile_url, mapid, token = None, None, None
    try:
        if isinstance(mapid_dict, dict):
            tf = mapid_dict.get('tile_fetcher'); mapid = mapid_dict.get('mapid'); token = mapid_dict.get('token')
            if tf and hasattr(tf, 'url_format'): tile_url = tf.url_format
            if not tile_url and mapid and token: tile_url = f"https://earthengine.googleapis.com/map/{mapid}/{{z}}/{{x}}/{{y}}?token={token}"
    except Exception: pass
    
    try: thumb_url = generar_thumb_url_from_img(img, region, vis, dimensions=thumb_dimensions)
    except Exception: thumb_url = None

    try:
        coords = region.bounds().getInfo()['coordinates'][0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        bbox = [[min(lats), min(lons)], [max(lats), max(lons)]]
    except Exception:
        bbox = None
    
    return {'tile_url': tile_url, 'url': thumb_url, 'bbox': bbox, 'mapid': mapid, 'token': token}
