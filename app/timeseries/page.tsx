"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
// --- CAMBIO 1: Importamos el componente Spinner ---
import { Spinner } from "@/components/ui/spinner"

// Tipos de datos para mayor claridad
type RegionId = "alaska" | "manaos" | "cdmx";

// Objeto de datos estáticos para la página
const regionData = {
  alaska: {
    id: "alaska" as RegionId,
    name: "ALASKA",
    fullName: "Alaska (Columbia Glacier)",
    index: "ndsi",
    color: "hsl(190, 100%, 50%)",
    image: "/alaska.jpg",
    analysis: `Satellite imagery analysis from 1990 to 2025 reveals significant changes in Alaska's Columbia Glacier. The NDSI index shows a clear declining trend over the 35-year period.\n\nPeak values were observed in the early 1990s, with a gradual decrease that became more pronounced after 2010. This pattern correlates with documented glacier retreat in the region.\n\nThe rate of change has accelerated in recent years, with the most dramatic shifts occurring between 2015 and 2025. This acceleration warrants continued monitoring and analysis.\n\nSeasonal variations and interannual fluctuations are visible in the data, highlighting the complex dynamics of environmental change in this critical Arctic region.`,
  },
  manaos: {
    id: "manaos" as RegionId,
    name: "MANAOS",
    fullName: "Manaus (Amazon)",
    index: "ndvi",
    color: "hsl(145, 80%, 45%)",
    image: "/manaos.jpg",
    analysis: `Satellite monitoring of the Amazon region near Manaus from 1990 to 2025 shows concerning patterns of vegetation loss. The NDVI index reflects a steady decline in vegetation health and density.\n\nData reveals periods of accelerated deforestation, particularly during the 2000s and 2010s. Urban expansion and agricultural activities have significantly contributed to these changes.\n\nDespite conservation efforts, the overall trend remains negative. Primary forest areas have been replaced by agricultural lands and urban zones.\n\nTemporal analysis shows the urgent need for more effective conservation policies to protect this vital ecosystem and its unique biodiversity.`,
  },
  cdmx: {
    id: "cdmx" as RegionId,
    name: "CDMX",
    fullName: "Mexico City",
    index: "ndbi",
    color: "hsl(45, 95%, 55%)",
    image: "/cdmx.jpg",
    analysis: `Analysis of Mexico City's urban expansion between 1990 and 2025 using the NDBI index reveals dramatic urban growth. The built-up area has increased significantly during this period.\n\nSatellite data shows consistent expansion toward peripheral areas, with particularly accelerated growth after 2000. Urban infrastructure has progressively replaced agricultural and natural zones.\n\nThe increasing NDBI trend reflects not only the city's horizontal expansion but also the densification of already urbanized areas. This growth presents significant challenges for sustainable urban planning.\n\nContinuous monitoring is essential to manage the environmental impact of urban development and ensure quality of life for the millions of inhabitants of this megalopolis.`,
  },
}

type ChartDataPoint = {
  year: number;
  value: number | null;
};

export default function TimeSeriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#1a1f3a] to-[#2a2f4a]">
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
        </nav>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {(Object.keys(regionData) as RegionId[]).map((regionId) => {
          const data = regionData[regionId];
          return <RegionTimeSeriesCard key={regionId} data={data} />
        })}
      </div>
    </div>
  )
}

function RegionTimeSeriesCard({ data }: { data: (typeof regionData)[RegionId] }) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/get-timeseries?region=${data.id}&index=${data.index}&start=1990&end=2025`);
        if (!response.ok) {
          throw new Error("Failed to fetch time series data from the server.");
        }
        const apiData = await response.json();

        if (apiData.error) {
          throw new Error(apiData.error);
        }

        const formattedData = apiData.years.map((year: number, index: number) => ({
          year: year,
          value: apiData.values[index]
        }));

        setChartData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSeries();
  }, [data.id, data.index]);

  return (
    <div className="bg-[#0f1220]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3f5a] px-4 md:px-8 py-3 md:py-4 border-b border-white/10">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{data.name}</h2>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-[#1a1f3a] rounded-lg p-4 md:p-6 aspect-video relative shadow-lg border border-white/5">
              <div className="absolute top-4 left-4 text-xs md:text-sm text-white/50">{data.index.toUpperCase()} Index</div>
              <div className="absolute bottom-4 right-4 text-xs md:text-sm text-white/50">1990 → 2025</div>
              
              {/* --- CAMBIO 2: Reemplazamos Skeleton por un mensaje de carga --- */}
              {loading && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Spinner className="size-6 text-cyan-400" />
                  <p className="text-white/70 text-sm animate-pulse">Loading chart data...</p>
                </div>
              )}
              {/* --- FIN DE CAMBIO --- */}

              {error && !loading && <div className="w-full h-full flex items-center justify-center text-center text-red-400 text-sm p-4">{error}</div>}
              
              {!loading && !error && chartData.length > 0 && (
                <ChartContainer config={{
                  value: {
                    label: data.index.toUpperCase(),
                    color: data.color,
                  },
                }} className="w-full h-full">
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: -10 }}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `'${value.toString().slice(2)}`}
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                    />
                     <YAxis
                      domain={['dataMin - 0.1', 'dataMax + 0.1']}
                      tickLine={false}
                      axisLine={false}
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => payload[0]?.payload.year} />}
                    />
                    <defs>
                      <linearGradient id={`fill-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={data.color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={data.color} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="value"
                      type="natural"
                      fill={`url(#fill-${data.id})`}
                      stroke={data.color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="aspect-video rounded-lg relative overflow-hidden shadow-lg">
                <Image src={data.image} alt={`${data.name} in 1990`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/70 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 rounded-full">
                  <span className="text-white text-xs md:text-sm font-semibold">1990</span>
                </div>
              </div>
              <div className="aspect-video rounded-lg relative overflow-hidden shadow-lg">
                <Image src={data.image} alt={`${data.name} in 2025`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/70 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 rounded-full">
                  <span className="text-white text-xs md:text-sm font-semibold">2025</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f3a] rounded-lg p-4 md:p-6 shadow-lg border border-white/5">
            <div className="space-y-3 md:space-y-4 text-white/70 text-xs md:text-sm leading-relaxed">
              {data.analysis.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}