"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useRegionAudio } from "@/hooks/use-region-audio"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1f3a]">
      <div className="text-white text-xl">Loading map...</div>
    </div>
  ),
})

const regions = [
  {
    id: "alaska",
    name: "ALASKA",
    image: "/alaska.jpg",
    index: "ndsi",
    coords: { lat: 61.13, lng: -147.05, zoom: 8 },
  },
  {
    id: "manaos",
    name: "MANAOS",
    image: "/manaos.jpg",
    index: "ndvi",
    coords: { lat: -3.1, lng: -60.0, zoom: 8 },
  },
  {
    id: "cdmx",
    name: "CDMX",
    image: "/cdmx.jpg",
    index: "ndbi",
    coords: { lat: 19.4, lng: -99.1, zoom: 8 },
  },
]

const indexLegend = [
  {
    name: "NDSI",
    description: "Snow/Ice Index",
    gradient: "from-red-500 to-cyan-400",
    range: "Red (low) → Cyan (high)",
  },
  {
    name: "NDVI",
    description: "Vegetation Index",
    gradient: "from-blue-500 to-green-500",
    range: "Blue (low) → Green (high)",
  },
  {
    name: "NDBI",
    description: "Urban Area Index",
    gradient: "from-blue-500 to-yellow-400",
    range: "Blue (low) → Yellow (high)",
  },
]

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [year, setYear] = useState(1990)
  const { playRegionAudio } = useRegionAudio()

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId)
    playRegionAudio(regionId as "alaska" | "manaos" | "cdmx")
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#1a2332] via-[#2a3f5a] to-[#3a5f7a]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0f1419]/90 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="relative w-32 h-10 md:w-40 md:h-12">
          <Image src="/logo.png" alt="TerraTales.earth Logo" fill className="object-contain" priority />
        </Link>
        <nav className="flex gap-4 md:gap-8">
          <Link
            href="/compare"
            className="text-white text-sm md:text-base font-semibold hover:text-[#00d4ff] transition-colors"
          >
            COMPARISON
          </Link>
          <Link
            href="/timeseries"
            className="text-white text-sm md:text-base font-semibold hover:text-[#00d4ff] transition-colors"
          >
            TIME SERIES
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative min-h-[300px] md:min-h-0">
          <MapView selectedRegion={selectedRegion} year={year} regions={regions} />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[400px] bg-[#0f1419]/80 backdrop-blur-md p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto border-t md:border-t-0 md:border-l border-white/10">
          {/* Timeline */}
          <div className="bg-gradient-to-br from-[#1a2332] to-[#2a3f5a] rounded-xl p-4 md:p-6 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-white font-semibold text-sm md:text-base">TIMELINE</span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-[#00d4ff] font-bold text-lg md:text-xl">{year}</span>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-white/50 text-xs">1990</span>
                  <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-white/50 text-xs">2025</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="1990"
              max="2025"
              value={year}
              onChange={(e) => setYear(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${((year - 1990) / 35) * 100}%, rgba(255,255,255,0.1) ${((year - 1990) / 35) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>

          {/* Legend */}
          <div className="bg-gradient-to-br from-[#1a2332] to-[#2a3f5a] rounded-xl p-4 md:p-6 border border-white/10 shadow-lg">
            <h3 className="text-white font-semibold mb-3 text-sm md:text-base">INDEX LEGEND</h3>
            <div className="space-y-3">
              {indexLegend.map((index) => (
                <div key={index.name} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-8 rounded bg-gradient-to-r ${index.gradient} shadow-lg`} />
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{index.name}</div>
                      <div className="text-white/60 text-xs">{index.description}</div>
                    </div>
                  </div>
                  <div className="text-white/40 text-xs pl-[76px]">{index.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Region Buttons */}
          <div className="flex flex-col gap-3 md:gap-4">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region.id)}
                className={`relative h-20 md:h-28 rounded-xl overflow-hidden transition-all shadow-lg ${
                  selectedRegion === region.id ? "ring-4 ring-[#00d4ff] scale-105" : "hover:scale-102"
                }`}
                style={{
                  backgroundImage: `url(${region.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                <div className="relative h-full flex items-center justify-center">
                  <span className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">{region.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
