#!/usr/bin/env node

import { createServer } from './server.js'
import { runStdioTransport } from './transports/stdio.js'
import { runHttpTransport } from './transports/http.js'

interface CLIArgs {
  authDir: string
  transport: 'stdio' | 'http'
  port?: number
  apiKey?: string
  withAntiban: boolean
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2)
  const result: CLIArgs = {
    authDir: './wa-auth',
    transport: 'stdio',
    withAntiban: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--auth-dir':
        result.authDir = args[++i]
        break
      case '--transport':
        result.transport = args[++i] as 'stdio' | 'http'
        break
      case '--port':
        result.port = parseInt(args[++i], 10)
        break
      case '--api-key':
        result.apiKey = args[++i]
        break
      case '--with-antiban':
        result.withAntiban = true
        break
      case '--help':
      case '-h':
        console.log(`
WhatsApp MCP Server - First MCP server for WhatsApp via Baileys

Usage:
  baileys-mcp [options]

Options:
  --auth-dir <path>       Directory for WhatsApp auth state (default: ./wa-auth)
  --transport <type>      Transport type: stdio | http (default: stdio)
  --port <number>         HTTP server port (default: 3001, only with --transport http)
  --api-key <key>         API key for HTTP authentication (optional)
  --with-antiban          Enable baileys-antiban integration (optional)
  -h, --help              Show this help message

Examples:
  # Stdio mode (for Claude Desktop / Cursor)
  baileys-mcp --auth-dir ~/.wa-mcp

  # HTTP mode with API key
  baileys-mcp --transport http --port 3001 --api-key secret123

  # With antiban protection
  baileys-mcp --with-antiban --auth-dir ~/.wa-mcp
        `)
        process.exit(0)
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`)
          process.exit(1)
        }
    }
  }

  return result
}

async function main() {
  const args = parseArgs()

  console.error(`Starting WhatsApp MCP Server...`)
  console.error(`Auth directory: ${args.authDir}`)
  console.error(`Transport: ${args.transport}`)
  console.error(`Antiban: ${args.withAntiban ? 'enabled' : 'disabled'}`)

  const server = await createServer(args.authDir, args.withAntiban)

  if (args.transport === 'stdio') {
    await runStdioTransport(server)
  } else if (args.transport === 'http') {
    await runHttpTransport(server, args.port || 3001, args.apiKey)
  } else {
    throw new Error(`Invalid transport: ${args.transport}`)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
