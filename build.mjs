import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");
const server = resolve(dist, "server");
const hostingDir = resolve(dist, ".openai");

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await mkdir(hostingDir, { recursive: true });

await Promise.all([
  cp(resolve(root, "assets"), resolve(client, "assets"), { recursive: true }),
  cp(resolve(root, "index.html"), resolve(client, "index.html")),
  cp(resolve(root, "archiv.html"), resolve(client, "archiv.html")),
  cp(resolve(root, "archive-data.js"), resolve(client, "archive-data.js")),
  cp(resolve(root, "archive.js"), resolve(client, "archive.js")),
  cp(resolve(root, "styles.css"), resolve(client, "styles.css")),
  cp(resolve(root, "script.js"), resolve(client, "script.js")),
  cp(resolve(root, ".openai", "hosting.json"), resolve(hostingDir, "hosting.json")),
]);

const workerSource = `
export default {
  async fetch(request, env) {
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Static asset binding is unavailable.", { status: 500 });
    }

    const url = new URL(request.url);
    const isDocumentRequest =
      request.method === "GET" &&
      (url.pathname === "/" || !url.pathname.split("/").pop().includes("."));

    if (url.pathname === "/") {
      url.pathname = "/index.html";
    }

    let response = await env.ASSETS.fetch(new Request(url, request));

    if (response.status === 404 && isDocumentRequest) {
      url.pathname = "/index.html";
      response = await env.ASSETS.fetch(new Request(url, request));
    }

    return response;
  },
};
`;

await writeFile(resolve(server, "index.js"), workerSource.trimStart(), "utf8");

const hosting = JSON.parse(
  await readFile(resolve(hostingDir, "hosting.json"), "utf8"),
);

if (!hosting.project_id) {
  throw new Error("Missing project_id in dist/.openai/hosting.json");
}

console.log("Built static site into dist/client with a Sites worker entrypoint.");
