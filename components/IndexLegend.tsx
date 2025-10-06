'use client'

import { REGIONS, RegionId } from "@/lib/constants";

// Definimos las paletas de colores para cada índice
// Los colores aquí son representaciones visuales para la leyenda.
// Los colores reales en el mapa los define Google Earth Engine en la llamada al backend.
const legendData = {
  NDSI: {
    name: "Snow/Ice Index",
    description: "Red (low) → Cyan (high)",
    gradient: "from-red-500 to-cyan-400",
  },
  NDVI: {
    name: "Vegetation Index",
    description: "Blue (low) → Green (high)",
    gradient: "from-blue-500 to-green-500",
  },
  NDBI: {
    name: "Urban Area Index",
    description: "Blue (low) → Yellow (high)",
    gradient: "from-blue-500 to-yellow-400",
  },
};

interface IndexLegendProps {
  selectedRegion: RegionId | null;
}

export default function IndexLegend({ selectedRegion }: IndexLegendProps) {
  if (!selectedRegion) {
    return null; // No muestra nada si no hay región seleccionada
  }

  const regionInfo = REGIONS[selectedRegion];
  const indexKey = regionInfo.index.toUpperCase() as keyof typeof legendData;
  const currentLegend = legendData[indexKey];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-[#1a1f3a]/80 backdrop-blur-md p-4 rounded-lg border border-white/10 w-64 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-3">INDEX LEGEND</h3>
      <div className="space-y-3">
        {Object.entries(legendData).map(([key, data]) => (
          <div 
            key={key} 
            // La leyenda activa tiene opacidad completa, las otras están semitransparentes
            className={`transition-opacity duration-300 ${indexKey === key ? 'opacity-100' : 'opacity-40'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-5 rounded-sm bg-gradient-to-r ${data.gradient}`} />
              <div>
                <p className="text-white font-semibold text-xs leading-tight">{data.name}</p>
                <p className="text-white/60 text-[10px] leading-tight">{data.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}