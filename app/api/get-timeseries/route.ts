import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const region = searchParams.get("region")
  const index = searchParams.get("index")

  // Backend URL - adjust this to your Flask backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

  try {
    const response = await fetch(`${backendUrl}/get_timeseries?region=${region}&index=${index}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching timeseries from backend:", error)
    return NextResponse.json({ error: "Failed to fetch timeseries from backend" }, { status: 500 })
  }
}
