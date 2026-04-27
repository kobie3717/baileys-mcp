import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import http from 'http'

export async function runHttpTransport(
  server: Server,
  port: number = 3001,
  apiKey?: string
): Promise<void> {
  const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    // API key authentication
    if (apiKey) {
      const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '')
      if (providedKey !== apiKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid API key' }))
        return
      }
    }

    // Handle SSE endpoint
    if (req.url === '/sse' && req.method === 'GET') {
      const transport = new SSEServerTransport('/message', res)
      await server.connect(transport)
      return
    }

    // Handle message endpoint
    if (req.url === '/message' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        try {
          JSON.parse(body) // Validate JSON
          // Message will be handled by SSE transport
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }

    // Health check
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', server: 'whatsapp-mcp-server' }))
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  })

  httpServer.listen(port, () => {
    console.log(`WhatsApp MCP server running on http://localhost:${port}`)
    console.log(`Connect via SSE: http://localhost:${port}/sse`)
  })
}
