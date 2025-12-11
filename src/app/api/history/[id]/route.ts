import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${pythonBackendUrl}/items/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch item from backend")
    }

    const data = await response.json()

    // Transform backend response to match frontend expectations
    return NextResponse.json({
      id: data.item_id.toString(),
      title: `Video ${data.item_id}`,
      url: data.url || "",
      date: new Date().toISOString(),
      duration: "Unknown",
      status: data.summary ? "completed" : "processing",
      summary: data.summary || "",
      transcription: "",
      keyPoints: [],
    })
  } catch (error) {
    console.error("[v0] Error fetching history item:", error)
    return NextResponse.json({ error: "Failed to fetch history item" }, { status: 500 })
  }
}
