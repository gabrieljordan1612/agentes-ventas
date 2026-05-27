import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

export function encriptarApiKey(apiKey) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encriptado = Buffer.concat([cipher.update(apiKey), cipher.final()])
  return iv.toString('hex') + ':' + encriptado.toString('hex')
}

export function desencriptarApiKey(apiKeyEncriptada) {
  const [ivHex, encriptadoHex] = apiKeyEncriptada.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encriptado = Buffer.from(encriptadoHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  const desencriptado = Buffer.concat([decipher.update(encriptado), decipher.final()])
  return desencriptado.toString()
}

export async function llamarClaude(apiKey, systemPrompt, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Error llamando a Claude')
  }

  const data = await response.json()
  return data.content[0].text
}