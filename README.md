# WhatsApp MCP Server

**First MCP server for WhatsApp. Plug Claude / Cursor / GPT into Baileys via Model Context Protocol.**

[![npm version](https://img.shields.io/npm/v/baileys-mcp.svg)](https://www.npmjs.com/package/baileys-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why MCP Matters

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is Anthropic's emerging standard for connecting LLMs to external services. Instead of building custom integrations for each AI tool, MCP provides a universal interface. This server makes WhatsApp (via [Baileys](https://github.com/WhiskeySockets/Baileys)) callable from:

- **Claude Desktop** - Native WhatsApp tools in your Claude conversations
- **Claude Code** - WhatsApp automation in your coding workflows  
- **Cursor** - Send messages, parse auction bids directly from your editor
- **OpenAI Custom GPTs** - Extend ChatGPT with WhatsApp capabilities
- **Any MCP client** - Universal compatibility

## Quick Start

### Installation

```bash
npm install -g baileys-mcp
```

### Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "npx",
      "args": [
        "baileys-mcp",
        "--auth-dir",
        "/Users/yourname/.wa-mcp"
      ]
    }
  }
}
```

Restart Claude Desktop. You'll now have WhatsApp tools available.

### Claude Code Setup

```bash
claude mcp add whatsapp -- npx baileys-mcp --auth-dir ~/.wa-mcp
```

### Cursor Setup

Add to Cursor settings (`Settings > MCP`):

```json
{
  "mcp": {
    "servers": {
      "whatsapp": {
        "command": "npx",
        "args": ["baileys-mcp", "--auth-dir", "~/.wa-mcp"]
      }
    }
  }
}
```

### First Run

On first start, scan the QR code with WhatsApp mobile:

1. Ask Claude: "Show me the WhatsApp QR code"
2. The `auth_qr` tool will return a QR data URI
3. Open the image and scan with WhatsApp mobile app
4. Once paired, credentials are saved to `--auth-dir`

## Tools Reference

| Tool | Description | Params | Returns |
|------|-------------|--------|---------|
| `send_text` | Send WhatsApp text message | `to`, `text` | `messageId`, `status` |
| `send_image` | Send image with optional caption | `to`, `imageUrl` OR `imageBase64`, `caption?` | `messageId`, `status` |
| `list_groups` | List all WhatsApp groups | - | `groups[]` |
| `list_messages` | Get recent messages (cached) | `jid`, `limit?` | `messages[]` |
| `parse_bid` | Parse South African auction bids | `text`, `currencyHint?` | `amount`, `currency`, `confidence` |
| `connection_status` | Get connection state & uptime | - | `connected`, `jid`, `uptimeMs`, `antibanEnabled` |
| `auth_qr` | Get QR code for pairing | - | `qrDataUri`, `paired`, `pairingCode` |
| `resolve_jid` | Resolve JID with LID/PN | `jid` | `canonicalJid`, `lid`, `pn` |

### Example Agent Prompts

**Send a message:**
```
Send "Bid received: R500" to 27821234567 via WhatsApp
```

**List groups:**
```
Show me all my WhatsApp groups
```

**Parse auction bid:**
```
Parse this bid: "I'll go R750 my bru"
```

**Check status:**
```
Is WhatsApp connected? Show me the status
```

## Composes with `baileys-antiban`

This server optionally integrates with [baileys-antiban](https://github.com/kobie3717/baileys-antiban) for rate limiting and anti-ban protection:

```bash
npm install -g baileys-antiban
baileys-mcp --with-antiban --auth-dir ~/.wa-mcp
```

When enabled:
- Intelligent rate limiting (dynamic delays, traffic shaping)
- LID resolution via `resolve_jid` tool
- Reduced ban risk for high-volume automation

## Transports

### Stdio (Default)

For local AI tools (Claude Desktop, Cursor, Claude Code):

```bash
baileys-mcp --auth-dir ~/.wa-mcp
```

Reads from stdin, writes to stdout. No network exposure.

### HTTP/SSE

For remote agents or web-based tools:

```bash
baileys-mcp --transport http --port 3001 --api-key secret123
```

Connect via `http://localhost:3001/sse`. Requires `X-API-Key` header.

## CLI Options

```
baileys-mcp [options]

Options:
  --auth-dir <path>       Directory for WhatsApp auth state (default: ./wa-auth)
  --transport <type>      Transport type: stdio | http (default: stdio)
  --port <number>         HTTP server port (default: 3001)
  --api-key <key>         API key for HTTP authentication
  --with-antiban          Enable baileys-antiban integration
  -h, --help              Show help
```

## Architecture

```
┌─────────────┐
│ Claude/GPT  │
└──────┬──────┘
       │ MCP Protocol
┌──────▼──────────────┐
│ baileys-mcp │
└──────┬──────────────┘
       │ Baileys
┌──────▼──────┐
│  WhatsApp   │
└─────────────┘
```

- **MCP SDK** - Standard protocol handling
- **Baileys** - WhatsApp Web multi-device API
- **Zod** - Runtime type validation
- **qrcode** - QR generation for pairing
- **baileys-antiban** (optional) - Anti-ban protection

## Development

```bash
git clone https://github.com/kobie3717/baileys-mcp.git
cd baileys-mcp
npm install
npm run build
npm test
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector dist/cli.js
```

Opens web UI showing all 8 registered tools.

## Roadmap v0.2

- [ ] **subscribe_messages** - Long-poll/SSE for real-time message streaming
- [ ] **media_download** - Download audio/video/documents from messages  
- [ ] **group_send** - Broadcast to multiple groups efficiently
- [ ] **reactions** - Send/receive message reactions
- [ ] **presence** - Set online/offline/typing status
- [ ] **contacts** - Sync and manage WhatsApp contacts
- [ ] **persistent_cache** - SQLite storage for message history

## Related Projects

- [baileys-antiban](https://github.com/kobie3717/baileys-antiban) - Anti-ban middleware (25⭐, 1.5k DL/wk)
- [WaSP](https://github.com/kobie3717/wasp-protocol) - WhatsApp session protocol
- [baileys-rest](https://github.com/kobie3717/baileys-rest) - REST API wrapper
- [n8n-nodes-baileys-antiban](https://github.com/kobie3717/n8n-nodes-baileys-antiban) - n8n integration

## License

MIT - see [LICENSE](LICENSE)

## Author

**Kobus Wentzel** - [kobie@pop.co.za](mailto:kobie@pop.co.za)

---

Built with ❤️ for the AI agent ecosystem
