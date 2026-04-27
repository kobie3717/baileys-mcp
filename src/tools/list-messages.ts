import { z } from 'zod'
import type { ServerState } from '../types.js'
import { getCachedMessages } from '../socket.js'

export const ListMessagesInput = z.object({
  jid: z.string().describe('JID or phone number of chat'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum messages to return')
})

export const ListMessagesOutput = z.object({
  messages: z.array(
    z.object({
      key: z.object({
        remoteJid: z.string(),
        fromMe: z.boolean(),
        id: z.string()
      }),
      fromMe: z.boolean(),
      timestamp: z.number(),
      text: z.string().nullable(),
      type: z.string()
    })
  )
})

export async function listMessagesHandler(args: unknown, state: ServerState) {
  if (!state.sock || !state.connected) {
    throw new Error('WhatsApp not connected')
  }

  const { jid, limit } = ListMessagesInput.parse(args)

  const messages = getCachedMessages(state, jid, limit)

  return {
    content: [{ type: 'text' as const, text: `Retrieved ${messages.length} messages from ${jid}` }],
    structuredContent: { messages }
  }
}
