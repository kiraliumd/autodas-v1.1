"use server"

import { revalidatePath } from "next/cache"

/**
 * Server action to process abandoned onboarding sessions
 * This keeps the API key secure on the server
 */
export async function processAbandonedSessions() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.autodas.com.br"
    const response = await fetch(`${appUrl}/api/onboarding/process-abandoned`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ONBOARDING_RECOVERY_API_KEY}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to process abandoned sessions: ${response.status}`)
    }

    const result = await response.json()

    // Revalidate the admin page to show updated data
    revalidatePath("/admin/recovery-emails")

    return { success: true, data: result }
  } catch (error) {
    console.error("Error processing abandoned sessions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Server action to save recovery email settings
 */
export async function saveRecoveryEmailSettings(settings: any) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.autodas.com.br"
    const response = await fetch(`${appUrl}/api/admin/recovery-emails/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.status}`)
    }

    // Revalidate the admin page to show updated data
    revalidatePath("/admin/recovery-emails")

    return { success: true }
  } catch (error) {
    console.error("Error saving recovery email settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
