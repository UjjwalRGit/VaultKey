import { Header } from "@/components/header"
import { EncryptTab } from "@/components/encrypt-tab"
import { DecryptTab } from "@/components/decrypt-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance mb-3">Secure File Encryption</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Zero-knowledge encryption and decryption, entirely in your browser
          </p>
        </div>

        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="encrypt" className="text-base">
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="text-base">
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
      </main>
    </div>
  )
}
