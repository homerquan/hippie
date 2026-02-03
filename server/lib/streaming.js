const fs = require("node:fs");
const path = require("node:path");

function loadStreamEvents(mocksDir, topic) {
  const baseDir = path.join(mocksDir, "streams");
  const jsonPath = path.join(baseDir, `${topic}.json`);
  const ndjsonPath = path.join(baseDir, `${topic}.ndjson`);

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [data];
  }

  if (fs.existsSync(ndjsonPath)) {
    const raw = fs.readFileSync(ndjsonPath, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  return null;
}

function scheduleEvents(socket, topic, events) {
  const timers = [];
  let offset = 0;

  events.forEach((event) => {
    const delay = Number(event.delayMs || 0);
    offset += delay;

    const payload = {
      topic,
      event: event.event || "message",
      data: event.data ?? event
    };

    const timer = setTimeout(() => {
      socket.emit("event", payload);
    }, offset);

    timers.push(timer);
  });

  return timers;
}

function setupStreamNamespace(io, mocksDir) {
  const namespace = io.of("/stream");
  const activeTimers = new Map();

  namespace.on("connection", (socket) => {
    socket.emit("ready", {
      id: socket.id,
      time: new Date().toISOString(),
      publishEnabled: process.env.ALLOW_STREAM_PUBLISH === "1"
    });

    socket.on("subscribe", (payload = {}) => {
      const topic = payload.topic || "default";
      const events = loadStreamEvents(mocksDir, topic);

      if (!events) {
        socket.emit("error", {
          message: `No stream mock found for topic: ${topic}`
        });
        return;
      }

      const timers = scheduleEvents(socket, topic, events);
      activeTimers.set(`${socket.id}:${topic}`, timers);
      socket.emit("subscribed", { topic, count: events.length });
    });

    socket.on("unsubscribe", (payload = {}) => {
      const topic = payload.topic || "default";
      const key = `${socket.id}:${topic}`;
      const timers = activeTimers.get(key) || [];
      timers.forEach((timer) => clearTimeout(timer));
      activeTimers.delete(key);
      socket.emit("unsubscribed", { topic });
    });

    socket.on("publish", (payload = {}) => {
      if (process.env.ALLOW_STREAM_PUBLISH !== "1") {
        socket.emit("error", { message: "Publishing disabled on server." });
        return;
      }

      namespace.emit("event", {
        topic: payload.topic || "default",
        event: payload.event || "message",
        data: payload.data ?? payload
      });
    });

    socket.on("disconnect", () => {
      Array.from(activeTimers.keys())
        .filter((key) => key.startsWith(socket.id))
        .forEach((key) => {
          const timers = activeTimers.get(key) || [];
          timers.forEach((timer) => clearTimeout(timer));
          activeTimers.delete(key);
        });
    });
  });
}

module.exports = {
  setupStreamNamespace
};
