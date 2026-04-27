import { z } from 'zod'
import type { ServerState } from '../types.js'
import { getAntiban, isAntibanLoaded } from '../antiban.js'

export const ResolveJidInput = z.object({
  jid: z.string().describe('JID to resolve')
})

export const ResolveJidOutput = z.object({
  canonicalJid: z.string(),
  lid: z.string().nullable(),
  pn: z.string().nullable()
})

export async function resolveJidHandler(args: unknown, state: ServerState) {
  if (!state.sock || !state.connected) {
    throw new Error('WhatsApp not connected')
  }

  const { jid } = ResolveJidInput.parse(args)

  let lid: string | null = null
  let pn: string | null = null

  // Try to use baileys-antiban LID resolver if available
  if (isAntibanLoaded()) {
    const antiban = getAntiban()
    if (antiban.resolveLid && typeof antiban.resolveLid === 'function') {
      try {
        const resolved = await antiban.resolveLid(state.sock, jid)
        lid = resolved?.lid || null
        pn = resolved?.pn || null
      } catch (error) {
        console.warn('LID resolution failed:', error)
      }
    }
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: lid ? `Resolved ${jid} → LID: ${lid}` : `JID: ${jid} (no LID resolution)`
      }
    ],
    structuredContent: {
      canonicalJid: jid,
      lid,
      pn
    }
  }
}
