const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createServer } = require("../../server");

let serverHandle;
let app;

before(async () => {
  const created = createServer();
  app = created.app;
  serverHandle = created.server;
  await created.start(0);
});

after(async () => {
  if (serverHandle) {
    await new Promise((resolve) => serverHandle.close(resolve));
  }
});

test("suggestion API", async () => {
  const response = await request(app)
    .get("/suggestion?q=java")
    .expect(200);

  assert.ok(response.body);
});

test("search API", async () => {
  const response = await request(app)
    .get("/search?q=java")
    .expect(200);

  assert.ok(response.body);
});
