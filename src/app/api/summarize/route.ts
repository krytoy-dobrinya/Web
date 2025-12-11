import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] API: Received POST request")
    const { url } = await request.json()
    console.log("[v0] API: Processing URL:", url)

    if (!url) {
      console.log("[v0] API: No URL provided")
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    console.log("[v0] API: Python backend URL:", pythonBackendUrl)

    // Generate a unique ID for the new summary
    const id = Date.now()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      console.log("[v0] API: Calling Python backend at:", `${pythonBackendUrl}/create`)
      const response = await fetch(`${pythonBackendUrl}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          url,
          summary: "", // Empty initially, will be filled by summarize_pipeline
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        console.error("[v0] API: Backend returned error:", errorData)
        throw new Error(errorData.detail || "Failed to process video")
      }

      const data = await response.json()
      console.log("[v0] API: Successfully created item:", data)

      // Return the created item
      return NextResponse.json({
        id: data.id.toString(),
        title: `Video ${data.id}`,
        url: data.url,
        date: new Date().toISOString(),
        duration: "Processing...",
        status: "processing",
        summary: data.summary,
        transcription: "",
        keyPoints: [],
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[v0] API: Request timeout")
        throw new Error("Request timeout - backend took too long to respond")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] API: Error processing video:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process video"

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
