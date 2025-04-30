// Função para obter a URL base da aplicação
export function getBaseUrl() {
  // Usar a URL personalizada em produção
  const customDomain = "https://www.autodas.com.br"

  // Em desenvolvimento, usar localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // Em produção, usar o domínio personalizado
  return customDomain
}
