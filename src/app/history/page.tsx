"use client"

import { Clock, Video, FileText, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

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

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/history", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }
      const data = await response.json()
      setHistoryItems(data)
    } catch (error) {
      console.error("[v0] Error fetching history:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      setHistoryItems(historyItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
    }
  }

  const totalDuration = historyItems.reduce((acc, item) => {
    const [minutes] = item.duration.split(":").map(Number)
    return acc + (minutes || 0)
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Summarization History</h1>
              <p className="text-muted-foreground">View and manage all your video summaries</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchHistory} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link href="/summarize">
                <Button>New Summary</Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{historyItems.length}</p>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {historyItems.filter((item) => item.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDuration}m</p>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                </div>
              </div>
            </Card>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {historyItems.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No summaries yet</h3>
                <p className="text-muted-foreground mb-4">Start by summarizing your first video</p>
                <Link href="/summarize">
                  <Button>Summarize Video</Button>
                </Link>
              </Card>
            ) : (
              historyItems.map((item) => (
                <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="space-y-1">
                          <Link href={`/history/${item.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors truncate">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.duration}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <Badge
                            variant={
                              item.status === "completed"
                                ? "default"
                                : item.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="ml-2"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/history/${item.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
