const request = require("supertest");
const data = require("./data");

async function login(app) {
  const response = await request(app)
    .post("/user/status?action=login")
    .send({
      username: data.USERNAME,
      password: data.PASSWORD,
      remember: false
    })
    .set("Accept", "application/json");

  return response.body?.access_token || response.body?.sessionId || null;
}

module.exports = { login };
