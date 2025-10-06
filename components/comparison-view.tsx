"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { REGIONS, RegionId } from "@/lib/constants"; 

interface ComparisonViewProps {
  region: RegionId
  yearA: number
  yearB: number
}

export default function ComparisonView({ region, yearA, yearB }: ComparisonViewProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [imageA, setImageA] = useState<string | null>(null)
  const [imageB, setImageB] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const regionInfo = REGIONS[region] || { name: region.toUpperCase(), index: "n/a" }

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      setError(null)
      setImageA(null)
      setImageB(null)
      console.log("[ComparisonView] Fetching images for:", { region, yearA, yearB, index: regionInfo.index })

      try {
        const [responseA, responseB] = await Promise.all([
          fetch(`/api/get-image?region=${region}&year=${yearA}&index=${regionInfo.index}`),
          fetch(`/api/get-image?region=${region}&year=${yearB}&index=${regionInfo.index}`),
        ])

        if (!responseA.ok || !responseB.ok) {
          throw new Error("Failed to fetch images from backend")
        }

        const [dataA, dataB] = await Promise.all([responseA.json(), responseB.json()])
        console.log("[ComparisonView] Received images:", { dataA, dataB })

        const urlA = dataA.url || dataA.thumbnailUrl;
        const urlB = dataB.url || dataB.thumbnailUrl;

        if (dataA.error || dataB.error) {
          setError(dataA.apology || dataB.apology || "Images not available for one or both dates.")
        } else if (urlA && urlB) {
          setImageA(urlA)
          setImageB(urlB)
        } else {
          setError("Images URLs not found in the response")
        }
      } catch (err) {
        console.error("[ComparisonView] Error fetching images:", err)
        setError("Failed to load satellite images")
      } finally {
        setLoading(false)
      }
    }

    if (region && yearA && yearB) {
      fetchImages()
    }
  }, [region, yearA, yearB, regionInfo.index])

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDragging])

  return (
    <div
      className="relative w-full h-full bg-[#1a1f3a] overflow-hidden touch-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/90 px-6 py-4 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-medium">Loading Comparison...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#1a1f3a]">
          <div className="text-center space-y-2 p-4">
            <div className="text-yellow-400 text-lg font-semibold">{error}</div>
            <div className="text-white/60 text-sm">Please try different years or check the backend connection.</div>
          </div>
        </div>
      )}

      {!loading && !error && imageA && imageB && (
        <>
          {/* --- CAMBIO 1: Imagen A (Izquierda) --- */}
          {/* Se elimina el style con clipPath de aquí. Esta capa siempre es visible por debajo. */}
          <div className="absolute inset-0">
            <Image
              src={imageA}
              alt={`${regionInfo.name} ${yearA}`}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/70 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg">
              <span className="text-white font-bold text-sm md:text-base">MAP 1 - {yearA}</span>
              <div className="text-[#00d4ff] text-xs md:text-sm font-mono">{regionInfo.index.toUpperCase()}</div>
            </div>
          </div>

          {/* --- CAMBIO 2: Imagen B (Derecha) --- */}
          {/* Se AÑADE el style con clipPath aquí. Esta es la capa de encima que se recorta. */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}>
            <Image
              src={imageB}
              alt={`${regionInfo.name} ${yearB}`}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg">
              <span className="text-white font-bold text-sm md:text-base">MAP 2 - {yearB}</span>
              <div className="text-[#10b981] text-xs md:text-sm font-mono">{regionInfo.index.toUpperCase()}</div>
            </div>
          </div>
          {/* --- FIN DE CAMBIOS --- */}

          {/* Divisor del Slider (sin cambios) */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#00d4ff] cursor-ew-resize z-50 shadow-[0_0_20px_rgba(0,212,255,0.5)]"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#00d4ff] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-[#1a1f3a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Grid overlay decorativo (sin cambios) */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  )
}