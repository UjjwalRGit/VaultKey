"use client"

import { useMemo } from "react"
import zxcvbn from "zxcvbn"

interface PasswordStrengthMeterProps {
  password: string
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
  percentage: number
  feedback: string[]
  crackTime: string
  isValid: boolean
  meetsLengthRequirement: boolean
  meetsScoreRequirement: boolean
}

/**
 * Custom hook to calculate password strength
 * Use this in parent components to get strength without callbacks
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "",
        color: "",
        percentage: 0,
        feedback: [],
        crackTime: "",
        isValid: false,
        meetsLengthRequirement: false,
        meetsScoreRequirement: false,
      }
    }

    const result = zxcvbn(password)

    const meetsLengthRequirement = password.length >= 12
    const meetsScoreRequirement = result.score >= 3

    let label = ""
    let color = ""
    let percentage = 0

    switch (result.score) {
      case 0:
        label = "Very Weak"
        color = "bg-destructive"
        percentage = 20
        break
      case 1:
        label = "Weak"
        color = "bg-destructive"
        percentage = 40
        break
      case 2:
        label = "Fair"
        color = "bg-warning"
        percentage = 60
        break
      case 3:
        label = "Good"
        color = "bg-primary"
        percentage = 80
        break
      case 4:
        label = "Strong"
        color = "bg-success"
        percentage = 100
        break
    }

    const feedback: string[] = []
    if (result.feedback.warning) {
      feedback.push(result.feedback.warning)
    }
    if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
      feedback.push(...result.feedback.suggestions)
    }

    return {
      score: result.score,
      label,
      color,
      percentage,
      feedback,
      crackTime: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
      isValid: meetsLengthRequirement && meetsScoreRequirement,
      meetsLengthRequirement,
      meetsScoreRequirement,
    }
  }, [password])
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = usePasswordStrength(password)

  if (!password) return null

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`font-medium ${strength.isValid ? "text-success" : "text-foreground"}`}>
            {strength.label}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`h-4 w-4 rounded-full flex items-center justify-center ${
              strength.meetsLengthRequirement ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {strength.meetsLengthRequirement ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-xs">×</span>
            )}
          </div>
          <span className={strength.meetsLengthRequirement ? "text-foreground" : "text-muted-foreground"}>
            At least 12 characters
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div
            className={`h-4 w-4 rounded-full flex items-center justify-center ${
              strength.meetsScoreRequirement ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {strength.meetsScoreRequirement ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-xs">×</span>
            )}
          </div>
          <span className={strength.meetsScoreRequirement ? "text-foreground" : "text-muted-foreground"}>
            Strong complexity (score ≥ 3)
          </span>
        </div>
      </div>

      {strength.feedback.length > 0 && (
        <div className="bg-muted/50 rounded-md p-3 space-y-1">
          <p className="text-xs font-medium text-foreground">Suggestions:</p>
          {strength.feedback.map((suggestion, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {suggestion}
            </p>
          ))}
        </div>
      )}

      {strength.isValid && (
        <p className="text-xs text-success">
          ✓ Password meets security requirements (estimated crack time: {strength.crackTime})
        </p>
      )}

      {!strength.isValid && password.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Use a mix of uppercase, lowercase, numbers, and special characters. Avoid common words and patterns.
        </p>
      )}
    </div>
  )
}