"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, Lock, Download, CheckCircle2, AlertCircle, Loader2, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PasswordStrengthMeter, usePasswordStrength } from "@/components/password-strength-meter"
import { encryptFile, validateFileSize, formatFileSize, FileSizeError } from "@/lib/crypto"

type EncryptionState = "idle" | "encrypting" | "success" | "error"

export function EncryptTab() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, setState] = useState<EncryptionState>("idle")
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null)
  const [backupCopy, setBackupCopy] = useState(true) // Default enabled as per spec
  const [stealthMode, setStealthMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  // Use the hook to get password strength without callback
  const passwordStrength = usePasswordStrength(password)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size
      if (!validateFileSize(selectedFile)) {
        toast({
          variant: "destructive",
          title: "📦 File Too Large",
          description: `Your file (${formatFileSize(selectedFile.size)}) exceeds the maximum size of 500MB. Please select a smaller file.`,
        })
        return
      }
      setFile(selectedFile)
      setState("idle")
      setErrorMessage("")
    }
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      // Validate file size
      if (!validateFileSize(droppedFile)) {
        toast({
          variant: "destructive",
          title: "📦 File Too Large",
          description: `Your file (${formatFileSize(droppedFile.size)}) exceeds the maximum size of 500MB. Please select a smaller file.`,
        })
        return
      }
      setFile(droppedFile)
      setState("idle")
      setErrorMessage("")
    }
  }, [toast])

  const handleEncrypt = async () => {
    if (!file || !password) {
      toast({
        variant: "destructive",
        title: "⚠️ Missing Information",
        description: "Please select a file and enter a password before encrypting.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "❌ Password Mismatch",
        description: "The passwords you entered do not match. Please make sure both password fields are identical.",
      })
      return
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      toast({
        variant: "destructive",
        title: "🔒 Password Too Weak",
        description: "Your password must be at least 12 characters long with a strength score of 3 or higher. Try adding numbers, symbols, and mixing upper/lowercase letters.",
      })
      return
    }

    setState("encrypting")
    setErrorMessage("")

    try {
      const encrypted = await encryptFile(file, password)

      setEncryptedBlob(encrypted)
      setState("success")

      toast({
        title: "✅ Encryption Successful",
        description: "Your file has been encrypted securely. Click the download button below to save it.",
      })
    } catch (error) {
      setState("error")
      const message = error instanceof Error ? error.message : "An error occurred during encryption"
      setErrorMessage(message)
      toast({
        variant: "destructive",
        title: "❌ Encryption Failed",
        description: message,
      })
    }
  }

  const handleDownload = () => {
    if (!encryptedBlob || !file) return

    // Determine extension based on stealth mode
    const extension = stealthMode ? ".dat" : ".enc"
    
    // For stealth mode, strip the original extension to obscure file type
    let downloadName = file.name
    if (stealthMode) {
      // Remove the last extension (e.g., document.pdf -> document)
      const lastDotIndex = downloadName.lastIndexOf(".")
      if (lastDotIndex > 0) {
        downloadName = downloadName.substring(0, lastDotIndex)
      }
    }

    // Download encrypted file
    const url = URL.createObjectURL(encryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${downloadName}${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Download PLAINTEXT backup copy if enabled
    if (backupCopy) {
      setTimeout(() => {
        const backupUrl = URL.createObjectURL(file)
        const backupLink = document.createElement("a")
        backupLink.href = backupUrl
        backupLink.download = `${file.name}.backup`
        document.body.appendChild(backupLink)
        backupLink.click()
        document.body.removeChild(backupLink)
        URL.revokeObjectURL(backupUrl)

        toast({
          title: "💾 Backup Saved",
          description: "⚠️ Plaintext backup copy downloaded. Remember: this backup is NOT encrypted! Store it securely.",
        })
      }, 500)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setConfirmPassword("")
    setState("idle")
    setEncryptedBlob(null)
    setErrorMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Encrypt File
        </CardTitle>
        <CardDescription>Upload a file and set a strong password to encrypt it</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={state === "encrypting"}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">Drop file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Maximum file size: 500MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password (min 12 characters)"
              disabled={state === "encrypting"}
            />
          </div>

          {password && (
            <PasswordStrengthMeter password={password} />
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={state === "encrypting"}
              className={confirmPassword && password !== confirmPassword ? "border-destructive" : ""}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="backup-copy" className="text-base">
                  Create backup copy
                </Label>
                {backupCopy && (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Downloads a plaintext copy of your original file
              </p>
              {backupCopy && (
                <p className="text-xs text-warning">
                  ⚠️ Warning: Backup is unencrypted. Store it securely!
                </p>
              )}
            </div>
            <Switch
              id="backup-copy"
              checked={backupCopy}
              onCheckedChange={setBackupCopy}
              disabled={state === "encrypting"}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stealth-mode" className="text-base">
                Stealth mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use .dat extension and hide original file type
              </p>
            </div>
            <Switch
              id="stealth-mode"
              checked={stealthMode}
              onCheckedChange={setStealthMode}
              disabled={state === "encrypting"}
            />
          </div>
        </div>

        {/* Encrypting State with Spinner */}
        {state === "encrypting" && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Encrypting your file...</span>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              File encrypted successfully! Download your encrypted file below.
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {state === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage || "Encryption failed. Please try again."}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {state === "success" ? (
            <>
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Encrypted File
              </Button>
              <Button onClick={handleReset} variant="outline">
                Encrypt Another
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEncrypt}
              disabled={!file || !password || !confirmPassword || !passwordStrength.isValid || state === "encrypting"}
              className="w-full gap-2"
            >
              <Lock className="h-4 w-4" />
              {state === "encrypting" ? "Encrypting..." : "Encrypt File"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}