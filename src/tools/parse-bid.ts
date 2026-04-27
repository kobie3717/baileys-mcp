import { z } from 'zod'
import type { ServerState } from '../types.js'
import { parseBid } from '../parse-bid.js'

export const ParseBidInput = z.object({
  text: z.string().describe('Text message to parse for bid amount'),
  currencyHint: z.string().default('ZAR').describe('Currency code (default: ZAR)')
})

export const ParseBidOutput = z.object({
  amount: z.number().nullable(),
  currency: z.string(),
  confidence: z.enum(['high', 'medium', 'low'])
})

export async function parseBidHandler(args: unknown, _state: ServerState) {
  const { text, currencyHint } = ParseBidInput.parse(args)

  const result = parseBid(text, currencyHint)

  const summary = result.amount
    ? `Parsed ${result.currency} ${result.amount} (${result.confidence} confidence)`
    : 'No bid amount detected'

  return {
    content: [{ type: 'text' as const, text: summary }],
    structuredContent: result
  }
}
