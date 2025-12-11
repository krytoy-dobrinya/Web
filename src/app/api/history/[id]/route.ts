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
    
    // Бэкенд возвращает {id, url, summary}, а не {item_id, url, summary}
    // Используем data.id вместо data.item_id
    console.log("[v0] Backend response data:", data) // Для отладки

    // Transform backend response to match frontend expectations
    return NextResponse.json({
      id: data.id.toString(),  
      title: `Video ${data.id}`, 
      url: data.url || "",
      date: new Date().toISOString(),
      duration: "Unknown",
      status: data.summary && data.summary.length > 0 && data.summary !== "Processing..." ? "completed" : "processing",
      summary: data.summary || "",
      transcription: "",
      keyPoints: [],
    })
  } catch (error) {
    console.error("[v0] Error fetching history item:", error)
    return NextResponse.json({ error: "Failed to fetch history item" }, { status: 500 })
  }
}
