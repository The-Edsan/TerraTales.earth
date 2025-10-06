import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const region = searchParams.get("region")
  const year = searchParams.get("year")
  const index = searchParams.get("index")

  const backendUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "")

  console.log("[v0] API route called with:", { region, year, index })

  try {
    const url = `${backendUrl}/get_image?region=${region}&year=${year}&index=${index}`
    console.log("[v0] Fetching from backend:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend error response:", errorText)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Backend response data:", data)

    if (data.url && data.url.startsWith("/")) {
      data.thumbnailUrl = `${backendUrl}${data.url}`
    } else if (data.url) {
      data.thumbnailUrl = data.url
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching image from backend:", error)
    return NextResponse.json(
      { error: "Failed to fetch image from backend", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
