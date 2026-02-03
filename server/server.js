const path = require("node:path");
require("dotenv").config();
const http = require("node:http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { Server: SocketIOServer } = require("socket.io");
const { resolveMockRequest, listMocks } = require("./lib/mock-resolver");
const { setupStreamNamespace } = require("./lib/streaming");
const { buildOpenApiSpec } = require("./lib/openapi");

function createServer(options = {}) {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*"
    }
  });

  const mocksDir = options.mocksDir || path.resolve(__dirname, "..", "mocks");

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString()
    });
  });

  app.get("/__mocks", (req, res) => {
    res.json({
      root: mocksDir,
      files: listMocks(mocksDir)
    });
  });

  app.get("/__openapi", (req, res) => {
    const files = listMocks(mocksDir);
    const spec = buildOpenApiSpec(mocksDir, files);
    res.json(spec);
  });

  app.post("/__stream/:topic", (req, res) => {
    if (process.env.ALLOW_STREAM_PUBLISH !== "1") {
      res.status(403).json({ error: "Streaming publish disabled." });
      return;
    }

    const payload = {
      topic: req.params.topic,
      event: req.body?.event || "message",
      data: req.body?.data ?? req.body
    };

    io.of("/stream").emit("event", payload);
    res.json({ ok: true, published: payload });
  });

  app.all("*", async (req, res) => {
    try {
      const result = await resolveMockRequest(req, mocksDir);

      if (!result.found) {
        res.status(404).json({
          error: "Mock not found",
          method: req.method,
          path: req.path,
          candidates: result.candidates
        });
        return;
      }

      const { status, headers, delayMs, body, contentType } = result;

      if (delayMs) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      res.status(status).send(body);
    } catch (error) {
      res.status(500).json({
        error: "Failed to resolve mock",
        message: error.message
      });
    }
  });

  setupStreamNamespace(io, mocksDir);

  function start(port = Number(process.env.PORT || 3000)) {
    return new Promise((resolve) => {
      server.listen(port, () => {
        const address = server.address();
        const resolvedPort = typeof address === "object" ? address.port : port;
        console.log(
          `Hippie mock server running on http://localhost:${resolvedPort}`
        );
        console.log(`Mocks directory: ${mocksDir}`);
        console.log("Socket.IO namespace: /stream");
        resolve(resolvedPort);
      });
    });
  }

  return { app, server, io, start };
}

if (require.main === module) {
  const { start } = createServer();
  start();
}

module.exports = { createServer };
