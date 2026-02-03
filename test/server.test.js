const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { io } = require("socket.io-client");
const { createServer } = require("../server/server");

let serverHandle;
let app;
let port;

before(async () => {
  const created = createServer();
  app = created.app;
  serverHandle = created.server;
  port = await created.start(0);
});

after(async () => {
  if (serverHandle) {
    await new Promise((resolve) => serverHandle.close(resolve));
  }
});

test("health endpoint", async () => {
  const response = await request(app).get("/health").expect(200);
  assert.equal(response.body.status, "ok");
  assert.ok(response.body.time);
});

test("legacy mock resolution", async () => {
  const response = await request(app).get("/book").expect(200);
  assert.equal(response.body.id, 123);
  assert.equal(response.body.title, "Sayings of the Century");
});

test("openapi generation", async () => {
  const response = await request(app).get("/__openapi").expect(200);
  assert.equal(response.body.openapi, "3.1.0");
  assert.ok(response.body.paths["/book"].get);
  assert.ok(response.body.paths["/search"].get);
  const params = response.body.paths["/search"].get.parameters;
  assert.ok(params.some((param) => param.name === "q"));
});

test("missing mock returns 404", async () => {
  const response = await request(app).get("/missing-path").expect(404);
  assert.equal(response.body.error, "Mock not found");
});

test("socket stream delivers mock events", async () => {
  const socket = io(`http://localhost:${port}/stream`, {
    transports: ["websocket"]
  });

  const event = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), 3000);

    socket.on("ready", () => {
      socket.emit("subscribe", { topic: "heartbeat" });
    });

    socket.on("event", (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

  assert.equal(event.topic, "heartbeat");
  assert.equal(event.event, "heartbeat");
  socket.disconnect();
});
