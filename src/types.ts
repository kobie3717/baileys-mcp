import type { WASocket } from '@whiskeysockets/baileys'

export interface MCPServerOptions {
  authDir: string
  withAntiban?: boolean
  transport?: 'stdio' | 'http'
  port?: number
  apiKey?: string
}

export interface MessageCache {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
    imageMessage?: { caption?: string }
    videoMessage?: { caption?: string }
  }
  messageTimestamp?: number | Long
}

export interface ServerState {
  sock: WASocket | null
  connected: boolean
  jid: string | null
  startTime: number
  antibanEnabled: boolean
  messageCache: Map<string, MessageCache[]>
}

export interface Long {
  low: number
  high: number
  unsigned: boolean
  toNumber(): number
}
