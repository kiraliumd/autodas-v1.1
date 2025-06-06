export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          cnpj: string | null
          whatsapp: string | null
          security_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          cnpj?: string | null
          whatsapp?: string | null
          security_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          cnpj?: string | null
          whatsapp?: string | null
          security_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: "active" | "canceled" | "expired" | "trial"
          plan_type: string
          price: number
          start_date: string
          end_date: string
          auto_renew: boolean
          created_at: string
          updated_at: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status: "active" | "canceled" | "expired" | "trial"
          plan_type?: string
          price: number
          start_date?: string
          end_date: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: "active" | "canceled" | "expired" | "trial"
          plan_type?: string
          price?: number
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      stripe_sessions: {
        Row: {
          id: string
          session_id: string
          metadata: { [key: string]: string } | null
          status: string
          customer_email: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          metadata?: { [key: string]: string } | null
          status: string
          customer_email?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          metadata?: { [key: string]: string } | null
          status?: string
          customer_email?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      stripe_session_usage: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          used_at: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          used_at: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          used_at?: string
          created_at?: string
          expires_at?: string | null
        }
      }
    }
  }
}
