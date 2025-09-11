import { Hono } from "hono";
import app from "./hono";

const port = process.env.PORT || 3001;

try {
  console.log(`🔄 Starting Hono server on port ${port}...`);
  
  // Create a server that mounts the app at /api
  const server = new Hono();
  server.route('/api', app);
  
  // Add a root health check
  server.get('/', (c) => {
    return c.json({ 
      status: 'ok', 
      message: 'Backend server is running',
      timestamp: new Date().toISOString(),
      port: Number(port)
    });
  });
  
  // Start the server with error handling
  const bunServer = Bun.serve({
    port: Number(port),
    fetch: server.fetch,
    error(error) {
      console.error('❌ Server error:', error);
      return new Response('Internal Server Error', { status: 500 });
    },
  });
  
  console.log(`✅ Backend server successfully started!`);
  console.log(`🚀 Server running at: http://localhost:${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
  console.log(`🏥 Health check: http://localhost:${port}/api`);
  console.log(`📊 Root status: http://localhost:${port}`);
  console.log('');
  console.log('💡 To test the server:');
  console.log(`   curl http://localhost:${port}/api`);
  console.log('');
  console.log('🛑 Press Ctrl+C to stop the server');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    bunServer.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down server...');
    bunServer.stop();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('EADDRINUSE')) {
      console.error(`\n🚨 Port ${port} is already in use!`);
      console.error('💡 Try one of these solutions:');
      console.error('   1. Kill the process using the port:');
      console.error(`      lsof -ti:${port} | xargs kill -9`);
      console.error('   2. Use a different port:');
      console.error(`      PORT=3002 bun run backend/server.ts`);
      console.error('   3. Find what\'s using the port:');
      console.error(`      lsof -i :${port}`);
    } else if (error.message.includes('EACCES')) {
      console.error(`\n🚨 Permission denied for port ${port}!`);
      console.error('💡 Try using a port above 1024 or run with sudo (not recommended)');
    }
  }
  
  process.exit(1);
}