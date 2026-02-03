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

test("user creation mock", async () => {
  const response = await request(app)
    .post("/user")
    .send({ username: "bob" })
    .set("Accept", "application/json")
    .expect(200);

  assert.equal(response.body.userId, 123);
  assert.ok(response.body.sessionId);
});
