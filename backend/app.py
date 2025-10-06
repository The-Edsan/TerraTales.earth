import os
import hashlib
import requests
import traceback
import json
import time

from flask import Flask, jsonify, request, send_file, Response, send_from_directory
from flask_cors import CORS
import ee

from init_gee import init_gee
# Initialize Earth Engine
init_gee()

from indices import *

BASE_DIR = os.path.dirname(__file__)
CACHE_DIR = os.path.join(BASE_DIR, "static", "cache")
THUMB_CACHE_DIR = os.path.join(CACHE_DIR, "thumbs")
TILE_CACHE_DIR = os.path.join(CACHE_DIR, "tiles")
TIMESERIES_CACHE_DIR = os.path.join(CACHE_DIR, "timeseries")

os.makedirs(THUMB_CACHE_DIR, exist_ok=True)
os.makedirs(TILE_CACHE_DIR, exist_ok=True)
os.makedirs(TIMESERIES_CACHE_DIR, exist_ok=True)

app = Flask(__name__, static_url_path='/static')

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://*.vercel.app", "https://*.v0.app"]}})

@app.route('/cache/thumbs/<path:filename>')
def serve_cached_thumb(filename):
    return send_from_directory(THUMB_CACHE_DIR, filename)

def cache_thumb_from_url(thumb_url):
    if not thumb_url: return None
    try:
        h = hashlib.sha1(thumb_url.encode('utf-8')).hexdigest()
        fname = f"thumb_{h}.png"
        fpath = os.path.join(THUMB_CACHE_DIR, fname)
        backend_url = 'http://localhost:5000'
        full_url = f"{backend_url}/cache/thumbs/{fname}"
        if os.path.exists(fpath): return full_url
        resp = requests.get(thumb_url, stream=True, timeout=30)
        if resp.status_code == 200:
            with open(fpath, 'wb') as f:
                for chunk in resp.iter_content(1024*8): f.write(chunk)
            print(f"✅ Image cached successfully at: {fpath}")
            return full_url
        else:
            print(f"⚠️ cache_thumb_from_url: GEE request failed with status code {resp.status_code}")
            return None
    except Exception as e:
        print(f"⚠️ cache_thumb_from_url error: {e}")
        return None

# (funciones auxiliares de caché sin cambios...)

@app.route('/')
def index_route(): 
    return jsonify({'status': 'ok', 'message': 'TerraTales.earth Backend API', 'endpoints': ['/get_image', '/get_timeseries']})

@app.route('/get_image')
def get_image():
    # (sin cambios en esta función)
    try:
        region, index, year_str = request.args.get('region'), request.args.get('index'), request.args.get('year')
        scale_str, thumb_param = request.args.get('scale'), request.args.get('thumb')
        if not region or not index or not year_str: return jsonify({'error': 'Missing parameters (region, index, year).'}), 400
        try: year = int(year_str)
        except Exception: return jsonify({'error': 'Invalid year parameter.'}), 400
        try: scale = int(scale_str) if scale_str else 30
        except Exception: scale = 30
        thumb_dimensions = None
        if thumb_param:
            try:
                thumb_dimensions = int(thumb_param)
                if thumb_dimensions < 64: thumb_dimensions = 64
                if thumb_dimensions > 4096: thumb_dimensions = 4096 
            except Exception: thumb_dimensions = None
        if not thumb_dimensions: thumb_dimensions = 1024
        print(f"GET_IMAGE -> region={region}, index={index}, year={year}, scale={scale}, thumb={thumb_dimensions}")
        if region not in REGIONS: return jsonify({'error': 'Invalid region.'}), 400
        try:
            tile_data = generate_tile_url(index, region, year, thumb_dimensions=thumb_dimensions, scale=scale)
        except Exception as e_gen:
            msg = str(e_gen)
            if 'No images available' in msg or 'No hay imágenes' in msg:
                return jsonify({'error': 'no_images', 'message': msg, 'apology': "Sorry — no images available for that date/region."}), 404
            return jsonify({'error': str(e_gen)}), 500
        thumb_remote = tile_data.get('url')
        if thumb_remote:
            cached_url = cache_thumb_from_url(thumb_remote)
            if cached_url:
                tile_data['url'] = cached_url
                tile_data['thumb_cached'] = True
            else: tile_data['thumb_cached'] = False
        else: tile_data['thumb_cached'] = False
        if not tile_data.get('tile_url') and not tile_data.get('url'):
            return jsonify({'error': 'Could not generate tile or thumbnail.'}), 500
        return jsonify(tile_data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/get_timeseries')
def get_timeseries():
    try:
        region = request.args.get('region')
        index = request.args.get('index')
        force = request.args.get('force', 'false').lower() == 'true'
        start_year = int(request.args.get('start', 1990))
        end_year = int(request.args.get('end', 2025))
        if region not in REGIONS: return jsonify({'error': 'Invalid region.'}), 400
        if index not in ('ndvi', 'ndsi', 'ndbi'): return jsonify({'error': 'Invalid index.'}), 400
        cache = None
        if not force:
            # (lógica de caché sin cambios)
            pass
        
        # --- CAMBIO AQUÍ: Se convierte la lista de coordenadas a Geometría ---
        region_coords = REGIONS[region]
        region_geom = ee.Geometry.Rectangle(region_coords)
        # --- FIN DE CAMBIO ---
        
        years = list(range(start_year, end_year + 1))
        values = []
        for year in years:
            try:
                if index == 'ndvi': img, band = compute_ndvi(region_geom, year), 'NDVI'
                elif index == 'ndsi': img, band = compute_ndsi(region_geom, year), 'NDSI'
                elif index == 'ndbi': img, band = compute_ndbi(region_geom, year), 'NDBI'
                else: return jsonify({'error': 'Invalid index.'}), 400
                mean_dict = img.reduceRegion(reducer=ee.Reducer.mean(), geometry=region_geom, scale=30, maxPixels=1e9)
                mv = None
                try:
                    mv_obj = mean_dict.get(band)
                    mv = mv_obj.getInfo() if mv_obj else None
                except Exception: mv = None
                values.append(mv)
            except Exception as e_year:
                print(f"⚠️ Error year {year} region {region} index {index}:", e_year)
                values.append(None)
        result = {'years': years, 'values': values, 'cached': False, 'ts': int(time.time())}
        # (escritura de caché sin cambios)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# (tile_proxy sin cambios)
@app.route('/tile_proxy/<mapid>/<int:z>/<int:x>/<int:y>.png')
def tile_proxy(mapid, z, x, y):
    try:
        safe_mapid, token = str(mapid), request.args.get('token')
        if not token: return Response("Token is missing", status=400)
        remote_url = f"https://earthengine.googleapis.com/map/{safe_mapid}/tiles/{z}/{x}/{y}?token={token}"
        local_dir = os.path.join(TILE_CACHE_DIR, safe_mapid, str(z), str(x))
        os.makedirs(local_dir, exist_ok=True)
        local_file = os.path.join(local_dir, f"{y}.png")
        if os.path.exists(local_file): return send_file(local_file, mimetype='image/png', conditional=True, cache_timeout=30*24*60*60)
        resp = requests.get(remote_url, stream=True, timeout=30)
        if resp.status_code == 200:
            with open(local_file, 'wb') as f:
                for chunk in resp.iter_content(1024*8): f.write(chunk)
            return send_file(local_file, mimetype='image/png', conditional=True, cache_timeout=30*24*60*60)
        else:
            print(f"⚠️ tile_proxy: fetch {remote_url} status {resp.status_code}")
            return Response(f"Tile fetch failed: {resp.status_code}", status=502)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
