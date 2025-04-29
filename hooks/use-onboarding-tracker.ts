"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OnboardingService, type OnboardingData } from "@/lib/services/onboarding-service"

export function useOnboardingTracker(step: number, data: OnboardingData) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdRef = useRef<string | null>(null)
  const recoveryToken = searchParams.get("recovery_token")
  const onboardingService = new OnboardingService()

  // Track session and handle recovery
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // If we have a recovery token, load the session
        if (recoveryToken) {
          const session = await onboardingService.getSessionByRecoveryToken(recoveryToken)

          if (session && !session.completed) {
            // Update the session with current activity
            sessionIdRef.current = session.id
            await onboardingService.saveSession(session.data, step)

            // If the user is on an earlier step than where they left off,
            // redirect them to the correct step
            if (step < session.current_step) {
              router.push(`/onboarding/step${session.current_step}?recovery_token=${recoveryToken}`)
              return
            }
          }
        }

        // Save the current session state
        const sessionId = await onboardingService.saveSession(data, step)
        sessionIdRef.current = sessionId
      } catch (error) {
        console.error("Error tracking onboarding session:", error)
      }
    }

    initializeSession()

    // Update last activity periodically while the user is active
    const activityInterval = setInterval(async () => {
      if (sessionIdRef.current) {
        try {
          await onboardingService.saveSession(data, step)
        } catch (error) {
          console.error("Error updating session activity:", error)
        }
      }
    }, 60000) // Update every minute

    return () => {
      clearInterval(activityInterval)
    }
  }, [step, data, recoveryToken, router])

  // Function to mark session as completed
  const completeOnboarding = async () => {
    if (sessionIdRef.current) {
      try {
        await onboardingService.completeSession(sessionIdRef.current)
      } catch (error) {
        console.error("Error completing onboarding session:", error)
      }
    }
  }

  return { completeOnboarding }
}
