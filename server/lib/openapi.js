const path = require("node:path");
const fs = require("node:fs");

const LEGACY_RE = /^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)__(#.*)\.json$/i;

function parseLegacyFilename(filename) {
  const match = filename.match(LEGACY_RE);
  if (!match) {
    return null;
  }

  const method = match[1].toLowerCase();
  const tail = match[2];

  const [pathPart, ...queryParts] = tail.split("@");
  const pathSegments = pathPart
    .replace(/^#/, "")
    .split("#")
    .filter(Boolean);
  const pathname = `/${pathSegments.join("/")}` || "/";

  const parameters = queryParts
    .map((pair) => pair.split("=")[0])
    .filter(Boolean)
    .map((name) => ({
      name,
      in: "query",
      required: true,
      schema: { type: "string" }
    }));

  return { pathname: pathname === "//" ? "/" : pathname, method, parameters };
}

function parseModernFilename(filename) {
  const parts = filename.split(path.sep);
  if (parts.length < 2) {
    return null;
  }

  const method = parts[0].toLowerCase();
  const basename = parts.slice(1).join("/").replace(/\.json$/i, "");
  if (!basename) {
    return null;
  }

  const pathname = basename === "index" ? "/" : `/${basename}`;
  return { pathname, method, parameters: [] };
}

function deriveSchema(example) {
  if (example === null) {
    return { type: "null" };
  }

  if (Array.isArray(example)) {
    if (example.length === 0) {
      return { type: "array", items: {} };
    }
    return { type: "array", items: deriveSchema(example[0]) };
  }

  if (typeof example === "object") {
    const properties = {};
    for (const [key, value] of Object.entries(example)) {
      properties[key] = deriveSchema(value);
    }
    return { type: "object", properties };
  }

  return { type: typeof example };
}

function loadMockExample(mocksDir, relativePath) {
  const full = path.join(mocksDir, relativePath);
  if (!fs.existsSync(full)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(full, "utf8");
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && parsed.__meta) {
      if (Object.prototype.hasOwnProperty.call(parsed, "__body")) {
        return parsed.__body;
      }

      const { __meta, __body, ...rest } = parsed;
      return rest;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

function buildOpenApiSpec(mocksDir, mockFiles) {
  const paths = {};

  mockFiles.forEach((file) => {
    if (file === "_fallback.json") {
      return;
    }

    let parsed = parseLegacyFilename(file);
    if (!parsed) {
      parsed = parseModernFilename(file);
    }

    if (!parsed) {
      return;
    }

    const { pathname, method, parameters } = parsed;
    if (!paths[pathname]) {
      paths[pathname] = {};
    }

    const example = loadMockExample(mocksDir, file);
    const schema = example ? deriveSchema(example) : undefined;

    paths[pathname][method] = {
      summary: `Mock response for ${method.toUpperCase()} ${pathname}`,
      parameters,
      responses: {
        200: {
          description: "Mock response",
          content: schema
            ? {
                "application/json": {
                  schema,
                  examples: {
                    example: { value: example }
                  }
                }
              }
            : {}
        }
      }
    };
  });

  return {
    openapi: "3.1.0",
    info: {
      title: "Hippie Mock API",
      version: "3.0.0",
      description: "Generated from mock JSON files."
    },
    servers: [{ url: "http://localhost:3000" }],
    paths
  };
}

module.exports = {
  buildOpenApiSpec
};
