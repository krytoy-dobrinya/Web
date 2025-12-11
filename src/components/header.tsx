import Link from "next/link"
import { Video, History, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>Video Summarizer</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/summarize">
            <Button variant="ghost" size="sm">
              <Video className="mr-2 h-4 w-4" />
              Summarize
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
