"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, Lock, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import { encryptFile } from "@/lib/crypto"

type EncryptionState = "idle" | "encrypting" | "success" | "error"

export function EncryptTab() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, setState] = useState<EncryptionState>("idle")
  const [progress, setProgress] = useState(0)
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null)
  const [backupCopy, setBackupCopy] = useState(false)
  const [stealthMode, setStealthMode] = useState(false)
  const { toast } = useToast()

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setState("idle")
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setState("idle")
    }
  }, [])

  const handleEncrypt = async () => {
    if (!file || !password) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a password",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    setState("encrypting")
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const encrypted = await encryptFile(file, password)

      clearInterval(progressInterval)
      setProgress(100)
      setEncryptedBlob(encrypted)
      setState("success")

      toast({
        title: "Encryption successful",
        description: "Your file has been encrypted securely",
        className: "bg-success text-success-foreground",
      })
    } catch (error) {
      setState("error")
      toast({
        title: "Encryption failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!encryptedBlob || !file) return

    const extension = stealthMode ? ".dat" : ".enc"
    const url = URL.createObjectURL(encryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.name}${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    if (backupCopy) {
      setTimeout(() => {
        const backupUrl = URL.createObjectURL(encryptedBlob)
        const backupLink = document.createElement("a")
        backupLink.href = backupUrl
        backupLink.download = `${file.name}.backup${extension}`
        document.body.appendChild(backupLink)
        backupLink.click()
        document.body.removeChild(backupLink)
        URL.revokeObjectURL(backupUrl)
      }, 500)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setConfirmPassword("")
    setState("idle")
    setProgress(0)
    setEncryptedBlob(null)
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
                  <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">Drop file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Any file type supported</p>
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
              placeholder="Enter a strong password"
              disabled={state === "encrypting"}
            />
          </div>

          {password && <PasswordStrengthMeter password={password} />}

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={state === "encrypting"}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="backup-copy" className="text-base">
                Create backup copy
              </Label>
              <p className="text-sm text-muted-foreground">Download two copies of the encrypted file</p>
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
              <p className="text-sm text-muted-foreground">Use .dat extension instead of .enc</p>
            </div>
            <Switch
              id="stealth-mode"
              checked={stealthMode}
              onCheckedChange={setStealthMode}
              disabled={state === "encrypting"}
            />
          </div>
        </div>

        {/* Progress */}
        {state === "encrypting" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Encrypting...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
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
            <AlertDescription>Encryption failed. Please try again.</AlertDescription>
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
              disabled={!file || !password || !confirmPassword || state === "encrypting"}
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
