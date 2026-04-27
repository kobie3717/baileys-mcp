import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import type { ServerState, MessageCache } from './types.js'
import { extractMessageText } from './jid.js'
import { loadAntiban, getAntiban, isAntibanLoaded } from './antiban.js'

const MAX_CACHE_PER_JID = 100

/**
 * Initialize Baileys socket with auth state
 */
export async function initializeSocket(
  authDir: string,
  withAntiban: boolean,
  state: ServerState
): Promise<WASocket> {
  const { state: authState, saveCreds } = await useMultiFileAuthState(authDir)
  const { version } = await fetchLatestBaileysVersion()

  // Load antiban if requested
  if (withAntiban) {
    const loaded = await loadAntiban()
    state.antibanEnabled = loaded
  }

  const sockConfig: any = {
    version,
    auth: {
      creds: authState.creds,
      keys: makeCacheableSignalKeyStore(authState.keys, {
        level: 'info',
        child: () => ({ level: 'info', child: () => ({}) as any }) as any
      } as any)
    },
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true
  }

  // Apply antiban if loaded
  if (isAntibanLoaded()) {
    const antiban = getAntiban()
    if (antiban.configureSocket) {
      antiban.configureSocket(sockConfig)
    }
  }

  const sock = makeWASocket(sockConfig)

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds)

  // Connection state tracking
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('QR code generated (use auth_qr tool to retrieve)')
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed. Reconnect:', shouldReconnect)

      if (shouldReconnect) {
        // Reconnect after delay
        setTimeout(() => {
          initializeSocket(authDir, withAntiban, state).then((newSock) => {
            state.sock = newSock
          })
        }, 3000)
      } else {
        state.connected = false
        state.jid = null
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened')
      state.connected = true
      state.jid = sock.user?.id || null
    }
  })

  // Message cache
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
      const jid = msg.key.remoteJid
      if (!jid) continue

      const cached: MessageCache = {
        key: {
          remoteJid: jid,
          fromMe: msg.key.fromMe || false,
          id: msg.key.id || ''
        },
        message: msg.message as any,
        messageTimestamp: msg.messageTimestamp as any
      }

      if (!state.messageCache.has(jid)) {
        state.messageCache.set(jid, [])
      }

      const cache = state.messageCache.get(jid)!
      cache.unshift(cached) // Newest first

      // Keep only last MAX_CACHE_PER_JID
      if (cache.length > MAX_CACHE_PER_JID) {
        cache.splice(MAX_CACHE_PER_JID)
      }
    }
  })

  state.sock = sock
  return sock
}

/**
 * Get cached messages for a JID
 */
export function getCachedMessages(state: ServerState, jid: string, limit: number = 20) {
  const cache = state.messageCache.get(jid) || []
  return cache.slice(0, limit).map((msg) => ({
    key: msg.key,
    fromMe: msg.key.fromMe,
    timestamp: typeof msg.messageTimestamp === 'object'
      ? (msg.messageTimestamp as any).toNumber()
      : msg.messageTimestamp || 0,
    text: extractMessageText(msg.message),
    type: getMessageType(msg.message)
  }))
}

function getMessageType(message: any): string {
  if (!message) return 'unknown'
  if (message.conversation) return 'text'
  if (message.extendedTextMessage) return 'text'
  if (message.imageMessage) return 'image'
  if (message.videoMessage) return 'video'
  if (message.audioMessage) return 'audio'
  if (message.documentMessage) return 'document'
  if (message.stickerMessage) return 'sticker'
  return 'unknown'
}
