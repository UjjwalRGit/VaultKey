import Link from "next/link"
import { Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">VaultKey</span>
        </Link>
        <Link href="/security">
          <Button variant="ghost" size="sm" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Security Notes</span>
            <span className="sm:hidden">Info</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
