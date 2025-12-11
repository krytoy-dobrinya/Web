import { NextResponse } from "next/server"

export async function GET() {
  try {
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    console.log("[v0] History API: Fetching from:", `${pythonBackendUrl}/get-all-items`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 10 second timeout

    try {
      const response = await fetch(`${pythonBackendUrl}/get-all-items`, {
        cache: "no-store",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("[v0] History API: Backend returned error status:", response.status)
        throw new Error("Failed to fetch history from backend")
      }

      const data = await response.json()
      console.log("[v0] History API: Fetched items:", data.length)

      // Transform backend response to match frontend expectations
      const transformedData = data.map((item: any) => ({
        id: item.id.toString(),
        title: `Video ${item.id}`,
        url: item.url,
        date: item.created_at || new Date().toISOString(),
        duration: "Unknown",
        status: item.summary && item.summary.length > 0 ? "completed" : "processing",
        summary: item.summary || "",
        transcription: "",
        keyPoints: [],
      }))

      return NextResponse.json(transformedData)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[v0] History API: Request timeout")
        throw new Error("Request timeout")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] History API: Error fetching history:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch history"

    if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Cannot connect to Python backend. Make sure it's running on http://localhost:8000",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // You can add a delete endpoint to your FastAPI backend later
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting history item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
