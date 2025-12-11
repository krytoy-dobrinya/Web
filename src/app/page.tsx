import { Video, Sparkles, History, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-balance">Video Summarizer</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Transform any video into concise, actionable summaries. Simply paste a link and let AI do the work.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link href="/summarize">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Summarize Video</h3>
                    <p className="text-muted-foreground text-sm">
                      Paste a video URL and get an AI-generated summary with transcription
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">View History</h3>
                    <p className="text-muted-foreground text-sm">
                      Access all your previously summarized videos and transcriptions
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* How It Works */}
          <Card className="p-8 bg-card/50 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold">Paste URL</h3>
                <p className="text-sm text-muted-foreground">
                  Copy and paste any video link from YouTube, Vimeo, or other platforms
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold">AI Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Video is downloaded, audio extracted, transcribed, and analyzed
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold">Get Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a concise summary with key points and full transcription
                </p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/summarize">
              <Button size="lg" className="font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
