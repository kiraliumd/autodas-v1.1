// Importação condicional para evitar erros de compilação
let loadStripe: any = null

// Tentativa de importação dinâmica
try {
  // Importação dinâmica para evitar erros de compilação
  const stripeModule = require("@stripe/stripe-js")
  loadStripe = stripeModule.loadStripe
} catch (error) {
  console.error("Erro ao carregar o módulo Stripe:", error)
  // Função substituta para evitar erros
  loadStripe = () => Promise.resolve(null)
}

// Singleton para o cliente Stripe
let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error("Chave pública do Stripe não encontrada")
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
