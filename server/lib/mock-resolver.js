const fs = require("node:fs");
const path = require("node:path");

const JSON_EXT = ".json";

function listMocks(mocksDir) {
  if (!fs.existsSync(mocksDir)) {
    return [];
  }

  const entries = fs.readdirSync(mocksDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(entry.name);
    }

    if (entry.isDirectory()) {
      const nested = listMocks(path.join(mocksDir, entry.name));
      nested.forEach((file) => files.push(path.join(entry.name, file)));
    }
  }

  return files.sort();
}

function buildLegacyFilename(method, pathname, searchParams) {
  const segments = pathname.split("/").filter(Boolean);
  const pathPart = segments.length ? `#${segments.join("#")}` : "#";
  const queryPart = Array.from(searchParams.entries())
    .map(([key, value]) => `@${key}=${value}`)
    .join("");

  return `${method}__${pathPart}${queryPart}${JSON_EXT}`;
}

function buildLegacyFilenameSorted(method, pathname, searchParams) {
  const sorted = Array.from(searchParams.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const sortedParams = new URLSearchParams(sorted);
  return buildLegacyFilename(method, pathname, sortedParams);
}

function buildModernFilename(method, pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const base = segments.length ? path.join(...segments) : "index";
  return path.join(method.toLowerCase(), `${base}${JSON_EXT}`);
}

function buildCandidatePaths(req, mocksDir) {
  const url = new URL(req.originalUrl, `http://${req.headers.host || "localhost"}`);
  const method = req.method.toUpperCase();

  const candidates = [];

  const legacy = buildLegacyFilename(method, url.pathname, url.searchParams);
  candidates.push(path.join(mocksDir, legacy));

  if (url.searchParams.size > 1) {
    const legacySorted = buildLegacyFilenameSorted(
      method,
      url.pathname,
      url.searchParams
    );
    candidates.push(path.join(mocksDir, legacySorted));
  }

  if (url.searchParams.size > 0) {
    const legacyNoQuery = buildLegacyFilename(method, url.pathname, new URLSearchParams());
    candidates.push(path.join(mocksDir, legacyNoQuery));
  }

  const modern = buildModernFilename(method, url.pathname);
  candidates.push(path.join(mocksDir, modern));

  const flat = `${method}__${url.pathname.replace(/\//g, "#")}${JSON_EXT}`;
  candidates.push(path.join(mocksDir, flat));

  candidates.push(path.join(mocksDir, "_fallback.json"));

  return candidates;
}

function parseMockJson(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      body: data,
      status: 200,
      headers: null,
      delayMs: 0,
      contentType: "application/json; charset=utf-8"
    };
  }

  if (!Object.prototype.hasOwnProperty.call(data, "__meta")) {
    return {
      body: data,
      status: 200,
      headers: null,
      delayMs: 0,
      contentType: "application/json; charset=utf-8"
    };
  }

  const meta = data.__meta || {};
  let body = data;

  if (Object.prototype.hasOwnProperty.call(data, "__body")) {
    body = data.__body;
  } else {
    const { __meta, __body, ...rest } = data;
    body = rest;
  }

  return {
    body,
    status: Number(meta.status || 200),
    headers: meta.headers || null,
    delayMs: Number(meta.delayMs || 0),
    contentType: meta.contentType || "application/json; charset=utf-8"
  };
}

async function resolveMockRequest(req, mocksDir) {
  const candidates = buildCandidatePaths(req, mocksDir);

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const ext = path.extname(candidate).toLowerCase();
    const raw = fs.readFileSync(candidate, "utf8");

    if (ext === ".json") {
      const parsed = parseMockJson(JSON.parse(raw));
      return {
        found: true,
        file: candidate,
        candidates,
        status: parsed.status,
        headers: parsed.headers,
        delayMs: parsed.delayMs,
        body: parsed.body,
        contentType: parsed.contentType
      };
    }

    return {
      found: true,
      file: candidate,
      candidates,
      status: 200,
      headers: null,
      delayMs: 0,
      body: raw,
      contentType: "text/plain; charset=utf-8"
    };
  }

  return {
    found: false,
    candidates: candidates.map((candidate) => path.relative(mocksDir, candidate))
  };
}

module.exports = {
  resolveMockRequest,
  listMocks
};
