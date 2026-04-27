#!/bin/bash
# Add WhatsApp MCP server to Claude Code

claude mcp add whatsapp -- npx baileys-mcp --auth-dir ~/.wa-mcp

echo "WhatsApp MCP server added to Claude Code!"
echo "You can now use tools like:"
echo "  - send_text"
echo "  - list_groups"
echo "  - parse_bid"
echo ""
echo "Try: 'Send a WhatsApp message to 27821234567 saying hello'"
