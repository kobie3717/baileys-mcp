import { z } from 'zod'
// @ts-ignore - no types available for qrcode
import QRCode from 'qrcode'
import type { ServerState } from '../types.js'

export const AuthQRInput = z.object({})

export const AuthQROutput = z.object({
  qrDataUri: z.string().nullable(),
  paired: z.boolean(),
  pairingCode: z.string().nullable()
})

let lastQR: string | null = null

// Store QR code when socket emits it
export function setLastQR(qr: string | null) {
  lastQR = qr
}

export async function authQRHandler(args: unknown, state: ServerState) {
  AuthQRInput.parse(args)

  // Already paired
  if (state.connected && state.jid) {
    return {
      content: [{ type: 'text' as const, text: `Already paired as ${state.jid}` }],
      structuredContent: {
        qrDataUri: null,
        paired: true,
        pairingCode: null
      }
    }
  }

  // Generate QR data URI if we have a QR code
  let qrDataUri: string | null = null
  if (lastQR) {
    try {
      qrDataUri = await QRCode.toDataURL(lastQR)
    } catch (error) {
      console.error('QR generation failed:', error)
    }
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: qrDataUri
          ? 'QR code available (scan with WhatsApp mobile app)'
          : 'No QR code available. Waiting for connection...'
      }
    ],
    structuredContent: {
      qrDataUri,
      paired: false,
      pairingCode: null
    }
  }
}
