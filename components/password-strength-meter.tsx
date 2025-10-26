"use client"

import { useMemo } from "react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    let score = 0
    if (!password) return { score: 0, label: "", color: "" }

    // Length
    if (password.length >= 8) score += 20
    if (password.length >= 12) score += 20
    if (password.length >= 16) score += 10

    // Character variety
    if (/[a-z]/.test(password)) score += 10
    if (/[A-Z]/.test(password)) score += 10
    if (/[0-9]/.test(password)) score += 15
    if (/[^a-zA-Z0-9]/.test(password)) score += 15

    let label = ""
    let color = ""

    if (score < 30) {
      label = "Weak"
      color = "bg-destructive"
    } else if (score < 50) {
      label = "Fair"
      color = "bg-warning"
    } else if (score < 70) {
      label = "Good"
      color = "bg-primary"
    } else {
      label = "Strong"
      color = "bg-success"
    }

    return { score, label, color }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span className="font-medium">{strength.label}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use at least 12 characters with a mix of letters, numbers, and symbols
      </p>
    </div>
  )
}
