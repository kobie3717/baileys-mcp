import { describe, it, expect, beforeEach } from 'vitest'
import type { ServerState } from '../src/types.js'
import { parseBidHandler } from '../src/tools/parse-bid.js'
import { connectionStatusHandler } from '../src/tools/connection-status.js'

// Mock server state
function createMockState(): ServerState {
  return {
    sock: null,
    connected: false,
    jid: null,
    startTime: Date.now(),
    antibanEnabled: false,
    messageCache: new Map()
  }
}

describe('Tool Handlers', () => {
  let state: ServerState

  beforeEach(() => {
    state = createMockState()
  })

  describe('parse_bid tool', () => {
    it('should parse valid bid', async () => {
      const result = await parseBidHandler({ text: 'R500', currencyHint: 'ZAR' }, state)

      expect(result.structuredContent).toEqual({
        amount: 500,
        currency: 'ZAR',
        confidence: 'high'
      })
      expect(result.content[0].text).toContain('500')
    })

    it('should handle invalid bid', async () => {
      const result = await parseBidHandler({ text: 'no bid' }, state)

      expect(result.structuredContent.amount).toBeNull()
      expect(result.content[0].text).toContain('No bid')
    })

    it('should validate input schema', async () => {
      await expect(parseBidHandler({}, state)).rejects.toThrow()
      await expect(parseBidHandler({ text: 123 }, state)).rejects.toThrow()
    })
  })

  describe('connection_status tool', () => {
    it('should return disconnected status', async () => {
      const result = await connectionStatusHandler({}, state)

      expect(result.structuredContent.connected).toBe(false)
      expect(result.structuredContent.jid).toBeNull()
      expect(result.structuredContent.uptimeMs).toBeGreaterThanOrEqual(0)
      expect(result.structuredContent.antibanEnabled).toBe(false)
    })

    it('should return connected status', async () => {
      state.connected = true
      state.jid = '27821234567@s.whatsapp.net'
      state.antibanEnabled = true

      const result = await connectionStatusHandler({}, state)

      expect(result.structuredContent.connected).toBe(true)
      expect(result.structuredContent.jid).toBe('27821234567@s.whatsapp.net')
      expect(result.structuredContent.antibanEnabled).toBe(true)
      expect(result.content[0].text).toContain('Connected')
    })
  })
})
