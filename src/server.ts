import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { ServerState } from './types.js'
import { initializeSocket } from './socket.js'
import { setLastQR } from './tools/auth-qr.js'

// Tool handlers
import { sendTextHandler, SendTextInput } from './tools/send-text.js'
import { sendImageHandler, SendImageInput } from './tools/send-image.js'
import { listGroupsHandler, ListGroupsInput } from './tools/list-groups.js'
import { listMessagesHandler, ListMessagesInput } from './tools/list-messages.js'
import { parseBidHandler, ParseBidInput } from './tools/parse-bid.js'
import { connectionStatusHandler, ConnectionStatusInput } from './tools/connection-status.js'
import { authQRHandler, AuthQRInput } from './tools/auth-qr.js'
import { resolveJidHandler, ResolveJidInput } from './tools/resolve-jid.js'

export async function createServer(authDir: string, withAntiban: boolean = false): Promise<Server> {
  const server = new Server(
    {
      name: 'baileys-mcp',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )

  // Server state
  const state: ServerState = {
    sock: null,
    connected: false,
    jid: null,
    startTime: Date.now(),
    antibanEnabled: false,
    messageCache: new Map()
  }

  // Initialize WhatsApp socket
  await initializeSocket(authDir, withAntiban, state)

  // Hook into QR generation
  if (state.sock) {
    state.sock.ev.on('connection.update', (update) => {
      if (update.qr) {
        setLastQR(update.qr)
      }
    })
  }

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'send_text',
        description: 'Send a WhatsApp text message to a phone number or JID.',
        inputSchema: SendTextInput as any,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      },
      {
        name: 'send_image',
        description: 'Send an image via WhatsApp with optional caption.',
        inputSchema: SendImageInput as any,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      },
      {
        name: 'list_groups',
        description: 'List all WhatsApp groups the account is participating in.',
        inputSchema: ListGroupsInput as any,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: true
        }
      },
      {
        name: 'list_messages',
        description: 'List recent messages from a chat (from in-memory cache).',
        inputSchema: ListMessagesInput as any,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: true
        }
      },
      {
        name: 'parse_bid',
        description: 'Parse bid amounts from South African auction text (pure function).',
        inputSchema: ParseBidInput as any,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      {
        name: 'connection_status',
        description: 'Get WhatsApp connection status and uptime.',
        inputSchema: ConnectionStatusInput as any,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: true
        }
      },
      {
        name: 'auth_qr',
        description: 'Get QR code for WhatsApp authentication (if not already paired).',
        inputSchema: AuthQRInput as any,
        annotations: {
          readOnlyHint: true,
          openWorldHint: true
        }
      },
      {
        name: 'resolve_jid',
        description: 'Resolve JID to canonical form with LID/PN (uses baileys-antiban if available).',
        inputSchema: ResolveJidInput as any,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: true
        }
      }
    ]
  }))

  // Register tool call handlers
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as { name: string; arguments: unknown }

    switch (name) {
      case 'send_text':
        return await sendTextHandler(args, state)
      case 'send_image':
        return await sendImageHandler(args, state)
      case 'list_groups':
        return await listGroupsHandler(args, state)
      case 'list_messages':
        return await listMessagesHandler(args, state)
      case 'parse_bid':
        return await parseBidHandler(args, state)
      case 'connection_status':
        return await connectionStatusHandler(args, state)
      case 'auth_qr':
        return await authQRHandler(args, state)
      case 'resolve_jid':
        return await resolveJidHandler(args, state)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  })

  return server
}
