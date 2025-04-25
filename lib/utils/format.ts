// Função para formatar número de WhatsApp
export function formatWhatsApp(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, "")

  // Aplica a formatação (XX) XXXXX-XXXX
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  } else {
    // Limita a 11 dígitos (DDD + 9 dígitos)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

// Função para formatar CNPJ
export function formatCNPJ(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, "")

  // Aplica a formatação XX.XXX.XXX/XXXX-XX
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  } else {
    // Limita a 14 dígitos (padrão CNPJ)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }
}

// Função para validar CNPJ
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, "")

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) {
    return false
  }

  // Verifica se todos os dígitos são iguais (caso inválido)
  if (/^(\d)\1+$/.test(cnpj)) {
    return false
  }

  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  // Primeiro dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number.parseInt(digitos.charAt(0))) {
    return false
  }

  // Segundo dígito verificador
  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number.parseInt(digitos.charAt(1))) {
    return false
  }

  return true
}

// Função para limpar a formatação (remover caracteres não numéricos)
export function cleanFormat(value: string): string {
  return value.replace(/\D/g, "")
}
