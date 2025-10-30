import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Key, Server, Eye, FileCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-balance mb-3">How VaultKey Works</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Understanding the security and encryption behind VaultKey
          </p>
        </div>

        <div className="space-y-6">
          {/* Zero-Knowledge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Zero-Knowledge Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                VaultKey operates entirely in your browser. Your files and passwords never leave your device. We cannot
                access, view, or recover your encrypted files or passwords.
              </p>
              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  <strong>Your privacy is guaranteed:</strong> All encryption and decryption happens locally in your
                  browser using JavaScript. No data is sent to any server.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Encryption Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Encryption Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">AES-256-GCM Encryption</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use AES-256-GCM (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode), the same
                    encryption standard used by governments and financial institutions worldwide.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">PBKDF2 Key Derivation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your password is converted into a cryptographic key using PBKDF2-SHA256 with 250,000 iterations, making
                    brute-force attacks computationally infeasible.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Random Salt & IV</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Each encryption uses a unique random salt (16 bytes) and initialization vector (12 bytes), ensuring that encrypting
                    the same file twice produces different outputs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Password Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong className="text-foreground">Use at least 12 characters</strong>
                    <p className="text-sm text-muted-foreground">Longer passwords are exponentially harder to crack. VaultKey requires a minimum of 12 characters.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong className="text-foreground">Mix character types</strong>
                    <p className="text-sm text-muted-foreground">
                      Combine uppercase, lowercase, numbers, and special characters for maximum strength
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong className="text-foreground">Avoid common words and patterns</strong>
                    <p className="text-sm text-muted-foreground">
                      Don't use dictionary words, names, dates, or predictable patterns. VaultKey analyzes password strength in real-time.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong className="text-foreground">Store passwords securely</strong>
                    <p className="text-sm text-muted-foreground">
                      Use a password manager or write it down and store it in a physically secure location
                    </p>
                  </div>
                </li>
              </ul>
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <strong>Warning:</strong> If you lose your password, your encrypted files cannot be recovered. There
                  is no password reset or recovery mechanism.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* No Server Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                No Server Uploads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Unlike cloud-based encryption services, VaultKey never uploads your files to any server. All processing
                happens locally in your browser using the Web Crypto API.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">What this means for you:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Complete privacy - no one can intercept your files</li>
                  <li>✓ Works offline - no internet connection required after loading</li>
                  <li>✓ Large file support - encrypt files up to 500MB</li>
                  <li>✓ No account required - use VaultKey anonymously</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* File Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Encrypted File Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                VaultKey uses a custom file format with a header that contains all the information needed for decryption
                (except the password). The file extension is .enc by default, or .dat in stealth mode.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2">File structure (Version 1):</div>
                <div className="space-y-1">
                  <div>• Magic bytes: "VK" (2 bytes) - File identifier</div>
                  <div>• Version: 0x01 (1 byte) - Format version</div>
                  <div>• Salt: 16 bytes - For key derivation</div>
                  <div>• IV: 12 bytes - Initialization vector</div>
                  <div>• Filename length: 4 bytes - Size of encrypted name</div>
                  <div>• Encrypted filename - Original file name</div>
                  <div>• Encrypted file data - Your file content</div>
                </div>
              </div>
              <Alert className="bg-muted/30 border-muted">
                <AlertDescription className="text-sm">
                  The encrypted filename and file data are authenticated with AES-GCM, preventing tampering.
                  Any modification to the file will cause decryption to fail.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Additional Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">Backup Copy Option</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Optionally create a plaintext backup of your original file alongside the encrypted version.
                    This backup is saved with a <code className="text-xs bg-muted px-1 py-0.5 rounded">.backup</code> extension.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Stealth Mode</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Stealth mode uses the <code className="text-xs bg-muted px-1 py-0.5 rounded">.dat</code> extension
                    instead of <code className="text-xs bg-muted px-1 py-0.5 rounded">.enc</code> and hides the original
                    file extension, making encrypted files less conspicuous.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">File Size Limit</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VaultKey supports files up to 500MB to ensure reliable browser performance. This covers most document,
                    image, and video files.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}