import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: (origin) => {
    // Allow requests with no origin (mobile apps)
    if (!origin) return origin;
    
    // Allow specific origins
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:3000', 
      'http://localhost:19006',
    ];
    
    if (allowedOrigins.includes(origin)) return origin;
    
    // Allow rork.com domains
    if (origin.includes('rork.com')) return origin;
    
    // Allow any localhost port for development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return origin;
    
    // Allow Expo development URLs
    if (/^http:\/\/.*\.local:\d+$/.test(origin)) return origin;
    
    return null;
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});



export default app;