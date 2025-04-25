export type Profile = {
  id: string
  full_name: string | null
  cnpj: string | null
  whatsapp: string | null
  security_code: string | null
  created_at: string
  updated_at: string
}

export type Subscription = {
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
}

export type UserWithProfile = {
  id: string
  email: string
  profile: Profile | null
  subscription: Subscription | null
}
