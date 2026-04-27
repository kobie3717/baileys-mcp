import { z } from 'zod'
import type { ServerState } from '../types.js'
import { normalizeJid } from '../jid.js'

export const SendTextInput = z.object({
  to: z.string().describe('Phone digits (27821234567) or full JID (27821234567@s.whatsapp.net)'),
  text: z.string().min(1).describe('Message text content')
})

export const SendTextOutput = z.object({
  messageId: z.string(),
  status: z.enum(['queued', 'sent'])
})

export async function sendTextHandler(args: unknown, state: ServerState) {
  if (!state.sock || !state.connected) {
    throw new Error('WhatsApp not connected')
  }

  const { to, text } = SendTextInput.parse(args)
  const jid = normalizeJid(to)

  const result = await state.sock.sendMessage(jid, { text })

  return {
    content: [{ type: 'text' as const, text: `Sent message to ${jid}` }],
    structuredContent: {
      messageId: result?.key?.id || 'unknown',
      status: 'sent' as const
    }
  }
}
