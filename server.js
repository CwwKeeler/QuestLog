const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { exec } = require("child_process");

const HOST = "localhost";
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    logMessage(`Incoming ${request.method} ${requestUrl.pathname}${formatSearchForLog(requestUrl)}`);

    if (requestUrl.pathname.startsWith("/api/steam/")) {
      await handleSteamProxy(requestUrl, response);
      return;
    }

    serveStaticFile(requestUrl.pathname, response);
  } catch (error) {
    console.error("Server error:", error);
    sendJson(response, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, HOST, () => {
  const appUrl = `http://${HOST}:${PORT}`;
  logMessage(`QuestLog is running at ${appUrl}`);
  openBrowser(appUrl);
});

function serveStaticFile(pathname, response) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.normalize(path.join(ROOT_DIR, safePath));

  if (!resolvedPath.startsWith(ROOT_DIR)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(resolvedPath, (error, fileBuffer) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "File not found." });
        return;
      }

      sendJson(response, 500, { error: "Could not read file." });
      return;
    }

    const extension = path.extname(resolvedPath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(fileBuffer);
  });
}

async function handleSteamProxy(requestUrl, response) {
  const routeMap = {
    "/api/steam/owned-games": "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
    "/api/steam/player-achievements": "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/",
    "/api/steam/schema": "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
  };

  const targetUrl = routeMap[requestUrl.pathname];

  if (!targetUrl) {
    sendJson(response, 404, { error: "Unknown Steam proxy route." });
    return;
  }

  const upstreamUrl = new URL(targetUrl);

  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  logMessage(`Proxying Steam request to ${maskUrlForLog(upstreamUrl)}`);
  const upstreamResponse = await fetchJson(upstreamUrl);
  logMessage(`Steam responded with ${upstreamResponse.statusCode} for ${requestUrl.pathname}`);
  sendJson(response, upstreamResponse.statusCode, upstreamResponse.body);
}

function fetchJson(targetUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(targetUrl, (upstreamResponse) => {
        const chunks = [];

        upstreamResponse.on("data", (chunk) => chunks.push(chunk));
        upstreamResponse.on("end", () => {
          const bodyText = Buffer.concat(chunks).toString("utf8");
          let parsedBody;

          try {
            parsedBody = bodyText ? JSON.parse(bodyText) : {};
          } catch (error) {
            parsedBody = { error: "Steam returned a non-JSON response.", raw: bodyText };
          }

          resolve({
            statusCode: upstreamResponse.statusCode || 500,
            body: parsedBody
          });
        });
      })
      .on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function logMessage(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function formatSearchForLog(requestUrl) {
  return requestUrl.search ? requestUrl.search : "";
}

function maskUrlForLog(urlLike) {
  const safeUrl = new URL(urlLike.toString());

  ["key"].forEach((param) => {
    if (safeUrl.searchParams.has(param)) {
      safeUrl.searchParams.set(param, maskValue(safeUrl.searchParams.get(param)));
    }
  });

  return safeUrl.pathname + safeUrl.search;
}

function maskValue(value) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "********";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function openBrowser(url) {
  if (process.env.QUESTLOG_NO_OPEN === "1") {
    return;
  }

  let command = "";

  if (process.platform === "win32") {
    command = `start "" "${url}"`;
  } else if (process.platform === "darwin") {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.warn(`Could not open the browser automatically. Open ${url} manually.`);
    }
  });
}
