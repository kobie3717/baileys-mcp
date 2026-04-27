# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-27

### Added
- Initial release of WhatsApp MCP Server
- 8 tools for WhatsApp integration:
  - `send_text` - Send text messages
  - `send_image` - Send images with captions
  - `list_groups` - List WhatsApp groups
  - `list_messages` - Get recent messages from cache
  - `parse_bid` - Parse South African auction bids
  - `connection_status` - Check connection status
  - `auth_qr` - Get QR code for authentication
  - `resolve_jid` - Resolve JIDs with LID support
- Stdio transport for Claude Desktop / Cursor / Claude Code
- HTTP/SSE transport for remote agents
- Optional baileys-antiban integration
- TypeScript strict mode with full type safety
- Comprehensive test suite (15+ tests)
- Example configs for Claude Desktop, Cursor, Claude Code

[0.1.0]: https://github.com/kobie3717/whatsapp-mcp-server/releases/tag/v0.1.0
