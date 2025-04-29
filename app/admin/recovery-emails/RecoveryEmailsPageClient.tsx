"use client"

import { Suspense, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { processAbandonedSessions, saveRecoveryEmailSettings } from "../actions"
import { RecoveryEmailsList } from "@/components/admin/recovery-emails-list"

export default function RecoveryEmailsPageClient() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [abandonmentThreshold, setAbandonmentThreshold] = useState(2)
  const [maxEmails, setMaxEmails] = useState(3)
  const [emailDelays, setEmailDelays] = useState([2, 24, 72])
  const [isSaving, setIsSaving] = useState(false)
  const [isRunningManually, setIsRunningManually] = useState(false)
  const [lastRunResult, setLastRunResult] = useState<any>(null)
  const [emailTemplates, setEmailTemplates] = useState({
    first: "",
    second: "",
    third: "",
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/recovery-emails/settings")
        if (response.ok) {
          const data = await response.json()
          setIsEnabled(data.isEnabled)
          setAbandonmentThreshold(data.abandonmentThreshold)
          setMaxEmails(data.maxEmails)
          setEmailDelays(data.emailDelays)
          setEmailTemplates(data.emailTemplates)
        }
      } catch (error) {
        console.error("Error loading recovery email settings:", error)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const settings = {
        isEnabled,
        abandonmentThreshold,
        maxEmails,
        emailDelays,
        emailTemplates,
      }

      const result = await saveRecoveryEmailSettings(settings)

      if (!result.success) {
        throw new Error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunManually = async () => {
    setIsRunningManually(true)

    try {
      const result = await processAbandonedSessions()

      if (!result.success) {
        throw new Error(result.error || "Failed to run recovery process")
      }

      setLastRunResult(result.data)
    } catch (error) {
      console.error("Error running recovery process:", error)
    } finally {
      setIsRunningManually(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emails de Recuperação</h1>
        <p className="text-muted-foreground">Gerenciamento de emails de recuperação para cadastros abandonados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessões com Emails de Recuperação</CardTitle>
          <CardDescription>Cadastros abandonados que receberam emails de recuperação</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Carregando...</p>}>
            <RecoveryEmailsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
