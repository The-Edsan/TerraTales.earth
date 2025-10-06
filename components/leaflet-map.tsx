"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  selectedRegion: string | null
  year: number
  imageData: {
    // La propiedad 'url' es la que contiene la ruta correcta
    url?: string 
    bbox?: [[number, number], [number, number]]
    tile_url?: string
    mapid?: string
    token?: string
  } | null
  loading: boolean
  onScaleChange: (newScale: number) => void
}

// Coordenadas para centrar el mapa en cada región
const REGION_COORDS: Record<string, [number, number]> = {
  alaska: [61.13, -147.05],
  manaos: [-3.1, -60.0],
  cdmx: [19.4, -99.1],
}

const ZOOM_THRESHOLD = 11;
const SCALE_LOW = 60;
const SCALE_HIGH = 30;

export default function LeafletMap({ selectedRegion, year, imageData, loading, onScaleChange }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const overlayRef = useRef<L.ImageOverlay | L.TileLayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentScale, setCurrentScale] = useState(SCALE_LOW)
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicialización del mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Manejador de eventos de zoom para cambiar la escala
  useEffect(() => {
    if (!mapRef.current || !selectedRegion) return

    const handleZoomEnd = () => {
      if (!mapRef.current) return
      const zoom = mapRef.current.getZoom()
      const desiredScale = zoom >= ZOOM_THRESHOLD ? SCALE_HIGH : SCALE_LOW

      if (desiredScale !== currentScale) {
        console.log(`[Leaflet] Zoom changed to ${zoom}, requesting new scale: ${desiredScale}`)
        setCurrentScale(desiredScale)

        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current)
        }
        
        zoomTimeoutRef.current = setTimeout(() => {
          onScaleChange(desiredScale)
        }, 500)
      }
    }

    mapRef.current.on("zoomend", handleZoomEnd)

    return () => {
      if (mapRef.current) {
        mapRef.current.off("zoomend", handleZoomEnd)
      }
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }
    }
  }, [currentScale, selectedRegion, year, onScaleChange])

  // Centrar el mapa al seleccionar una región
  useEffect(() => {
    if (!mapRef.current) return

    if (selectedRegion && REGION_COORDS[selectedRegion]) {
      const coords = REGION_COORDS[selectedRegion]
      mapRef.current.flyTo(coords, 8, {
        duration: 1.5,
      })
    } else {
      mapRef.current.flyTo([20, 0], 2, {
        duration: 1.5,
      })
    }
  }, [selectedRegion])

  // Añadir o quitar la capa de imagen satelital
  useEffect(() => {
    if (!mapRef.current) return

    if (overlayRef.current) {
      mapRef.current.removeLayer(overlayRef.current)
      overlayRef.current = null
    }

    // --- CAMBIO AQUÍ: Usamos imageData.url en lugar de thumbnailUrl ---
    if (imageData && selectedRegion && imageData.url && imageData.bbox) {
      // ANTES: const overlay = L.imageOverlay(imageData.thumbnailUrl, imageData.bbox, { ... })
      // DESPUÉS:
      const overlay = L.imageOverlay(imageData.url, imageData.bbox, {
        opacity: 0.85,
        interactive: false,
      }).addTo(mapRef.current)
    // --- FIN DE CAMBIO ---

      overlayRef.current = overlay

      mapRef.current.fitBounds(imageData.bbox, {
        maxZoom: 12,
        padding: [40, 40],
      })
    }
  }, [imageData, selectedRegion])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full bg-gray-800" />

      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-slate-900/90 px-6 py-4 rounded-lg flex items-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-medium">Loading Satellite Imagery...</span>
          </div>
        </div>
      )}

      {!selectedRegion && !loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
          <div className="bg-slate-900/90 px-8 py-6 rounded-lg text-center shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Welcome to TerraTales.earth</h3>
            <p className="text-slate-300">Select a region to view satellite imagery</p>
          </div>
        </div>
      )}
    </div>
  )
}