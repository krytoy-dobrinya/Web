"use client"

import type React from "react"

import { useState } from "react"
import { Video, Loader2, Download, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function Summarize() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<{
    summary: string
    transcription: string
    title: string
    id: string
  } | null>(null)
  const [copied, setCopied] = useState<"summary" | "transcription" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pollStatus = async (id: string) => {
    const maxAttempts = 60 // Poll for up to 5 minutes (60 * 5s)
    let attempts = 0

    const checkStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/history/${id}`)
        if (!response.ok) {
          throw new Error("Failed to check status")
        }

        const data = await response.json()

        if (data.status === "completed") {
          setProgress(100)
          setStatus("Complete!")
          setResult({
            title: data.title,
            summary: data.summary,
            transcription: data.transcription,
            id: data.id,
          })
          setIsProcessing(false)
          return
        } else if (data.status === "failed") {
          throw new Error(data.summary || "Processing failed")
        }

        // Still processing
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(() => checkStatus(), 5000) // Check every 5 seconds
        } else {
          throw new Error("Processing timeout - please check history later")
        }
      } catch (err) {
        console.error("[v0] Error polling status:", err)
        setError(err instanceof Error ? err.message : "Status check failed")
        setIsProcessing(false)
      }
    }

    checkStatus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsProcessing(true)
    setProgress(0)
    setResult(null)
    setError(null)
    setStatus("Sending to processing queue...")

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to process video")
      }

      const data = await response.json()

      // Start polling for status updates
      setStatus("Video is being processed...")
      setProgress(25)

      // Start polling
      pollStatus(data.id)
    } catch (error) {
      console.error("[v0] Error processing video:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      setStatus("Error: " + errorMessage)
      setProgress(0)
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, type: "summary" | "transcription") => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Summarize Video</h1>
              <p className="text-muted-foreground">Enter a video URL to generate a summary and transcription</p>
            </div>
            <Link href="/history">
              <Button variant="outline">View History</Button>
            </Link>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Video URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Video className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                      disabled={isProcessing}
                    />
                  </div>
                  <Button type="submit" disabled={isProcessing || !url.trim()}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Summarize"
                    )}
                  </Button>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    This may take several minutes. You can check the history page for updates.
                  </p>
                </div>
              )}

              {error && !isProcessing && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </form>
          </Card>

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h2 className="text-xl font-semibold">Summary</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.title}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.summary, "summary")}>
                    {copied === "summary" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold">Full Transcription</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.transcription, "transcription")}
                  >
                    {copied === "transcription" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Textarea value={result.transcription} readOnly className="min-h-[200px] font-mono text-sm" />
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => result && downloadText(result.summary, "summary.txt")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Summary
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => result && downloadText(result.transcription, "transcription.txt")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Transcription
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
