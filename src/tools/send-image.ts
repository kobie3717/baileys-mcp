import { z } from 'zod'
import type { ServerState } from '../types.js'
import { normalizeJid } from '../jid.js'
import axios from 'axios'

export const SendImageInput = z.object({
  to: z.string().describe('Phone digits or full JID'),
  imageUrl: z.string().url().optional().describe('Image URL to download and send'),
  imageBase64: z.string().optional().describe('Base64-encoded image data'),
  caption: z.string().optional().describe('Optional image caption')
}).refine(
  (data) => (data.imageUrl && !data.imageBase64) || (!data.imageUrl && data.imageBase64),
  { message: 'Exactly one of imageUrl or imageBase64 must be provided' }
)

export const SendImageOutput = z.object({
  messageId: z.string(),
  status: z.enum(['queued', 'sent'])
})

export async function sendImageHandler(args: unknown, state: ServerState) {
  if (!state.sock || !state.connected) {
    throw new Error('WhatsApp not connected')
  }

  const { to, imageUrl, imageBase64, caption } = SendImageInput.parse(args)
  const jid = normalizeJid(to)

  let imageBuffer: Buffer

  if (imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    imageBuffer = Buffer.from(response.data)
  } else if (imageBase64) {
    imageBuffer = Buffer.from(imageBase64, 'base64')
  } else {
    throw new Error('No image source provided')
  }

  const result = await state.sock.sendMessage(jid, {
    image: imageBuffer,
    caption: caption || undefined
  })

  return {
    content: [{ type: 'text' as const, text: `Sent image to ${jid}` }],
    structuredContent: {
      messageId: result?.key?.id || 'unknown',
      status: 'sent' as const
    }
  }
}
