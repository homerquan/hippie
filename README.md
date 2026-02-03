# Hippie 3.0

A modern mock + hypermedia API server with streaming (Socket.IO) and MCP support.

## Highlights
- File-based HTTP mocks (legacy `mocks/GET__#path@q=value.json` and new `mocks/get/path.json` styles)
- Socket.IO streaming mocks (`/stream` namespace)
- MCP stdio server backed by mock tool definitions
- Handy admin endpoints (`/health`, `/__mocks`)

## Quick Start
```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000` by default.

## Tests
```bash
npm test
npm run test:coverage
```

## HTTP Mocking
Place JSON files in `mocks/` and the server will resolve requests to the matching mock file.

Supported filename styles:
- Legacy: `GET__#book@id=123.json` maps to `GET /book?id=123`
- Legacy path segments: `GET__#t#101.json` maps to `GET /t/101`
- Modern: `mocks/get/book.json` maps to `GET /book`
- Fallback: `mocks/_fallback.json`

### Mock Metadata
Wrap metadata in `__meta` to control status, headers, or delay.
```json
{
  "__meta": {
    "status": 201,
    "delayMs": 250,
    "headers": {
      "x-mock": "true"
    }
  },
  "id": 123,
  "message": "created"
}
```

## Streaming (Socket.IO)
Connect to the `/stream` namespace. Use `subscribe` with a topic matching a file in `mocks/streams`.

Example client flow:
- Emit `subscribe` with `{ "topic": "heartbeat" }`
- Receive `event` payloads defined in `mocks/streams/heartbeat.json`

To allow publishing from clients or HTTP:
```bash
ALLOW_STREAM_PUBLISH=1 npm run dev
```

## MCP (Model Context Protocol)
Run the MCP server over stdio:
```bash
npm run mcp
```

- Tool definitions live in `mocks/mcp/tools/*.json`
- Tool responses live in `mocks/mcp/responses/<tool>.json`

## Admin Endpoints
- `GET /health`
- `GET /__mocks`
- `GET /__openapi`
- `POST /__stream/:topic` (requires `ALLOW_STREAM_PUBLISH=1`)

## License
The MIT license.
