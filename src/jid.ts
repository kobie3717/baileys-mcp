/**
 * Normalize phone number or JID to full WhatsApp JID format
 * @param input Phone digits (27821234567) or full JID (27821234567@s.whatsapp.net)
 * @returns Normalized JID
 */
export function normalizeJid(input: string): string {
  // Already a JID
  if (input.includes('@')) {
    return input
  }

  // Strip non-digits
  const digits = input.replace(/\D/g, '')

  if (!digits) {
    throw new Error(`Invalid JID/phone: ${input}`)
  }

  // Default to s.whatsapp.net for individual chats
  return `${digits}@s.whatsapp.net`
}

/**
 * Extract text content from Baileys message object
 */
export function extractMessageText(message: any): string | null {
  if (!message) return null

  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    null
  )
}
