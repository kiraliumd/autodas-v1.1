export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // Existing tables...

      onboarding_sessions: {
        Row: {
          id: string
          stripe_session_id: string | null
          current_step: number
          data: Json
          email: string | null
          last_activity: string
          created_at: string
          completed: boolean
          abandoned: boolean
          recovery_emails_sent: number
          last_recovery_email: string | null
          recovery_token: string | null
        }
        Insert: {
          id?: string
          stripe_session_id?: string | null
          current_step: number
          data: Json
          email?: string | null
          last_activity?: string
          created_at?: string
          completed?: boolean
          abandoned?: boolean
          recovery_emails_sent?: number
          last_recovery_email?: string | null
          recovery_token?: string | null
        }
        Update: {
          id?: string
          stripe_session_id?: string | null
          current_step?: number
          data?: Json
          email?: string | null
          last_activity?: string
          created_at?: string
          completed?: boolean
          abandoned?: boolean
          recovery_emails_sent?: number
          last_recovery_email?: string | null
          recovery_token?: string | null
        }
      }

      recovery_email_logs: {
        Row: {
          id: string
          onboarding_session_id: string
          email: string
          sent_at: string
          email_type: string
          status: string
          resend_id: string | null
        }
        Insert: {
          id?: string
          onboarding_session_id: string
          email: string
          sent_at?: string
          email_type: string
          status?: string
          resend_id?: string | null
        }
        Update: {
          id?: string
          onboarding_session_id?: string
          email?: string
          sent_at?: string
          email_type?: string
          status?: string
          resend_id?: string | null
        }
      }

      // Admin tables
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          name: string
          role: string
          created_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          created_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
    }
  }
}
