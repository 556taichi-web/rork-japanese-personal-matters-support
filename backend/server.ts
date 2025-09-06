import { Hono } from "hono";
import app from "./hono";

const port = process.env.PORT || 3001;
console.log(`Starting Hono server on port ${port}`);

// Create a server that mounts the app at /api
const server = new Hono();
server.route('/api', app);

// Start the server
Bun.serve({
  port: Number(port),
  fetch: server.fetch,
});

console.log(`🚀 Backend server running at http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);