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
import { Upload, Unlock, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { decryptFile } from "@/lib/crypto"

type DecryptionState = "idle" | "decrypting" | "success" | "error"

export function DecryptTab() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [state, setState] = useState<DecryptionState>("idle")
  const [progress, setProgress] = useState(0)
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null)
  const [originalFilename, setOriginalFilename] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setState("idle")
      setErrorMessage("")
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setState("idle")
      setErrorMessage("")
    }
  }, [])

  const handleDecrypt = async () => {
    if (!file || !password) {
      toast({
        title: "Missing information",
        description: "Please select an encrypted file and enter the password",
        variant: "destructive",
      })
      return
    }

    setState("decrypting")
    setProgress(0)
    setErrorMessage("")

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await decryptFile(file, password)

      clearInterval(progressInterval)
      setProgress(100)
      setDecryptedBlob(result.blob)
      setOriginalFilename(result.filename)
      setState("success")

      toast({
        title: "Decryption successful",
        description: "Your file has been decrypted",
        className: "bg-success text-success-foreground",
      })
    } catch (error) {
      setState("error")
      const message = error instanceof Error ? error.message : "An error occurred"
      setErrorMessage(message)
      toast({
        title: "Decryption failed",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!decryptedBlob) return

    const url = URL.createObjectURL(decryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = originalFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setState("idle")
    setProgress(0)
    setDecryptedBlob(null)
    setOriginalFilename("")
    setErrorMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Unlock className="h-5 w-5 text-primary" />
          Decrypt File
        </CardTitle>
        <CardDescription>Upload an encrypted file and enter the password to decrypt it</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="decrypt-file-upload">Select Encrypted File</Label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <input
              id="decrypt-file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".enc,.dat"
              className="hidden"
              disabled={state === "decrypting"}
            />
            <label htmlFor="decrypt-file-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">Drop encrypted file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Accepts .enc or .dat files</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="decrypt-password">Password</Label>
          <Input
            id="decrypt-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the encryption password"
            disabled={state === "decrypting"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && file && password) {
                handleDecrypt()
              }
            }}
          />
        </div>

        {/* Progress */}
        {state === "decrypting" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Decrypting...</span>
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
              File decrypted successfully! Original filename: <strong>{originalFilename}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {state === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || "Decryption failed. Please check your password and try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {state === "success" ? (
            <>
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Decrypted File
              </Button>
              <Button onClick={handleReset} variant="outline">
                Decrypt Another
              </Button>
            </>
          ) : (
            <Button
              onClick={handleDecrypt}
              disabled={!file || !password || state === "decrypting"}
              className="w-full gap-2"
            >
              <Unlock className="h-4 w-4" />
              {state === "decrypting" ? "Decrypting..." : "Decrypt File"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
