"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0f14] flex items-center justify-center">
      <div className="text-white text-lg">Loading map...</div>
    </div>
  ),
})

interface Region {
  id: string
  name: string
  index: string
  coords: { lat: number; lng: number; zoom: number }
}

interface MapViewProps {
  selectedRegion: string | null
  year: number
  regions: Region[]
}

export default function MapView({ selectedRegion, year, regions }: MapViewProps) {
  const [imageData, setImageData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(60); // Inicia con la escala por defecto para vistas alejadas

  const region = regions.find((r) => r.id === selectedRegion)

  const fetchImage = useCallback(async (currentScale: number) => {
    if (!selectedRegion || !region) {
      setImageData(null);
      return;
    }
  
    setLoading(true);
    setError(null);
    console.log(`[MapView] Fetching image for:`, { region: selectedRegion, year, index: region.index, scale: currentScale });
  
    try {
      const response = await fetch(`/api/get-image?region=${selectedRegion}&year=${year}&index=${region.index}&scale=${currentScale}`);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.apology || `Failed to fetch image: ${response.status}`;
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log("[MapView] Received image data:", data);
  
      if (data.error) {
         setError(data.apology || "An error occurred while fetching the image.");
      } else {
        setImageData(data);
      }
    } catch (err) {
      console.error("[MapView] Error fetching image:", err);
      setError(err instanceof Error ? err.message : "Failed to load satellite image");
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, year, region]);

  useEffect(() => {
    fetchImage(scale);
  }, [selectedRegion, year, scale, fetchImage]);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0f14]">
      {error && !loading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-slate-900/90 text-center p-6 rounded-lg max-w-sm">
             <h3 className="text-lg font-semibold text-yellow-400 mb-2">Could Not Load Image</h3>
             <p className="text-slate-300 text-sm">{error}</p>
           </div>
        </div>
      )}
      <LeafletMap 
        selectedRegion={selectedRegion} 
        year={year} 
        imageData={imageData} 
        loading={loading}
        onScaleChange={handleScaleChange}
      />
    </div>
  )
}