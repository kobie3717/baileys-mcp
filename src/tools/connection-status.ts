import { z } from 'zod'
import type { ServerState } from '../types.js'

export const ConnectionStatusInput = z.object({})

export const ConnectionStatusOutput = z.object({
  connected: z.boolean(),
  jid: z.string().nullable(),
  uptimeMs: z.number(),
  antibanEnabled: z.boolean()
})

export async function connectionStatusHandler(args: unknown, state: ServerState) {
  ConnectionStatusInput.parse(args)

  const uptimeMs = Date.now() - state.startTime

  const result = {
    connected: state.connected,
    jid: state.jid,
    uptimeMs,
    antibanEnabled: state.antibanEnabled
  }

  const summary = state.connected
    ? `Connected as ${state.jid} (uptime: ${Math.floor(uptimeMs / 1000)}s)`
    : 'Not connected'

  return {
    content: [{ type: 'text' as const, text: summary }],
    structuredContent: result
  }
}
