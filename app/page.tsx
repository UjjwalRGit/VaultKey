import { Header } from "@/components/header"
import { EncryptTab } from "@/components/encrypt-tab"
import { DecryptTab } from "@/components/decrypt-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Unlock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Secure File Encryption
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encrypt and decrypt your files locally in your browser with military-grade AES-256-GCM encryption.
            Zero-knowledge architecture ensures complete privacy.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="encrypt" className="gap-2">
              <Lock className="h-4 w-4" />
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="gap-2">
              <Unlock className="h-4 w-4" />
              Decrypt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt">
            <EncryptTab />
          </TabsContent>

          <TabsContent value="decrypt">
            <DecryptTab />
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            🔒 All encryption happens in your browser. Your files never leave your device.
          </p>
        </div>
      </main>
    </div>
  )
}
