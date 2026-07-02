import http from "node:http";
import worker from "../src/worker.js";
import { createFakeD1 } from "./fake-d1.mjs";

const port = Number(process.env.PORT || 8787);
const env = {
  APP_PIN: process.env.APP_PIN || "734921",
  SESSION_SECRET: process.env.SESSION_SECRET || "local-preview-secret",
  DB: createFakeD1(),
};

const server = http.createServer(async (incoming, outgoing) => {
  try {
    const origin = `http://${incoming.headers.host || `127.0.0.1:${port}`}`;
    const request = await toRequest(incoming, origin);
    const response = await worker.fetch(request, env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const buffer = Buffer.from(await response.arrayBuffer());
      outgoing.end(buffer);
    } else {
      outgoing.end();
    }
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    outgoing.end("Local preview error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`VibeCubby preview: http://127.0.0.1:${port}`);
  console.log(`PIN: ${env.APP_PIN}`);
});

function toRequest(incoming, origin) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    incoming.on("data", (chunk) => chunks.push(chunk));
    incoming.on("error", reject);
    incoming.on("end", () => {
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      resolve(new Request(origin + incoming.url, {
        method: incoming.method,
        headers: incoming.headers,
        body,
      }));
    });
  });
}
