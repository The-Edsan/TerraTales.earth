"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useRegionAudio } from "@/hooks/use-region-audio"

const ComparisonView = dynamic(() => import("@/components/comparison-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1f3a]">
      <div className="text-white text-xl">Loading comparison...</div>
    </div>
  ),
})

const regions = [
  {
    id: "alaska",
    name: "ALASKA",
    image: "/alaska.jpg",
    index: "ndsi",
  },
  {
    id: "manaos",
    name: "MANAOS",
    image: "/manaos.jpg",
    index: "ndvi",
  },
  {
    id: "cdmx",
    name: "CDMX",
    image: "/cdmx.jpg",
    index: "ndbi",
  },
]

export default function ComparePage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [yearA, setYearA] = useState(1990)
  const [yearB, setYearB] = useState(2025)
  const [showComparison, setShowComparison] = useState(false)
  const { playRegionAudio } = useRegionAudio()

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId)
    playRegionAudio(regionId as "alaska" | "manaos" | "cdmx")
  }

  const handleCompare = () => {
    if (selectedRegion) {
      setShowComparison(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f1a] via-[#1a1f3a] to-[#2a2f4a]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0f1419]/90 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="relative w-32 h-10 md:w-40 md:h-12">
          <Image src="/logo.png" alt="TerraTales.earth Logo" fill className="object-contain" priority />
        </Link>
        <nav className="flex gap-4 md:gap-8">
          <Link
            href="/timeseries"
            className="text-white text-sm md:text-base font-semibold hover:text-[#00d4ff] transition-colors"
          >
            TIME SERIES
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Comparison Maps Section */}
        <div className="flex-1 relative bg-[#1a1f3a] min-h-[500px] lg:min-h-0">
          {showComparison && selectedRegion ? (
            <ComparisonView region={selectedRegion} yearA={yearA} yearB={yearB} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl">
                <div className="aspect-video bg-[#2a3f5a] rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl md:text-4xl font-bold opacity-30">MAP 1</span>
                </div>
                <div className="aspect-video bg-[#2a3f5a] rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl md:text-4xl font-bold opacity-30">MAP 2</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - becomes bottom panel on mobile */}
        <div className="w-full lg:w-[400px] bg-[#0f1419]/80 backdrop-blur-md p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/10">
          {/* Year Selection Controls */}
          <div className="bg-gradient-to-br from-[#1a2332] to-[#2a3f5a] rounded-xl p-4 md:p-6 border border-white/10 shadow-lg">
            <h3 className="text-white font-semibold text-base md:text-lg mb-4 text-center">
              SELECT THE YEARS TO COMPARE
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">YEAR A</label>
                <input
                  type="number"
                  min="1990"
                  max="2025"
                  value={yearA}
                  onChange={(e) => setYearA(Number.parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg font-semibold focus:outline-none focus:border-[#00d4ff] transition-colors"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">YEAR B</label>
                <input
                  type="number"
                  min="1990"
                  max="2025"
                  value={yearB}
                  onChange={(e) => setYearB(Number.parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg font-semibold focus:outline-none focus:border-[#00d4ff] transition-colors"
                />
              </div>

              <button
                onClick={handleCompare}
                disabled={!selectedRegion}
                className="w-full py-3 bg-[#00d4ff] hover:bg-[#00b8e6] disabled:bg-white/10 disabled:text-white/30 text-[#0f1419] font-bold rounded-lg transition-all shadow-lg hover:shadow-[#00d4ff]/50"
              >
                COMPARE
              </button>
            </div>
          </div>

          {/* Region Selection */}
          <div className="bg-gradient-to-br from-[#1a2332] to-[#2a3f5a] rounded-xl p-4 md:p-6 border border-white/10 shadow-lg">
            <h3 className="text-white font-semibold text-center mb-4 text-sm md:text-base">
              SELECT THE REGION TO COMPARE
            </h3>

            <div className="flex flex-col gap-3 md:gap-4">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionSelect(region.id)}
                  className={`relative h-20 md:h-24 rounded-xl overflow-hidden transition-all shadow-lg ${
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
                    <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">{region.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
