"use client"

import { ArrowLeft, Video, Clock, Calendar, Download, Copy, Share2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

type HistoryItem = {
  id: string
  url: string
  title: string
  summary: string
  transcription: string
  date: string
  duration: string
  status: string
}

export default function HistoryItemPage() {
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<HistoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchItem = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/history/${id}`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch item")
      }
      const data = await response.json()
      setItem(data)
    } catch (error) {
      console.error("[v0] Error fetching item:", error)
      setItem(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchItem()
  }, [id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAll = () => {
    if (!item) return

    const content = `
Title: ${item.title}
URL: ${item.url}
Date: ${new Date(item.date).toLocaleDateString()}
Duration: ${item.duration}
Status: ${item.status}

SUMMARY:
${item.summary}

FULL TRANSCRIPTION:
${item.transcription}
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.title.replace(/[^a-z0-9]/gi, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareItem = () => {
    if (!item) return

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: item.summary,
          url: window.location.href,
        })
        .catch((err) => console.error("[v0] Error sharing:", err))
    } else {
      copyToClipboard(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested summary could not be found.</p>
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link href="/history">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to History
              </Button>
            </Link>
            {item.status === "processing" && (
              <Button variant="outline" size="sm" onClick={fetchItem} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>
            )}
          </div>

          {/* Header */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-balance">{item.title}</h1>
                  <p className="text-muted-foreground break-all">{item.url}</p>
                </div>
                <Badge
                  variant={
                    item.status === "completed" ? "default" : item.status === "processing" ? "secondary" : "destructive"
                  }
                >
                  {item.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {item.duration}
                </span>
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Summary
                </span>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadAll}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.summary)}>
                  {copied ? (
                    "Copied!"
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={shareItem}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            {item.status === "processing" ? (
              <p className="text-muted-foreground italic">Processing in progress... Check back soon.</p>
            ) : (
              <p className="text-foreground leading-relaxed">{item.summary}</p>
            )}
          </Card>

          {/* Transcription */}
          {item.transcription && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Full Transcription</h2>
              <Textarea value={item.transcription} readOnly className="min-h-[300px] font-mono text-sm" />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
