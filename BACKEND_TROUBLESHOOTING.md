# Backend Connection Troubleshooting

## Backend Health Check Timeout Error

If you're seeing "Backend health check error: TimeoutError: signal timed out", here's how to fix it:

### Quick Fix

1. **Start the backend server:**
   ```bash
   bun run backend/server.ts
   ```
   
   Or use the startup script:
   ```bash
   chmod +x start-backend.sh
   ./start-backend.sh
   ```

2. **Verify the server is running:**
   ```bash
   curl http://localhost:3001/api
   ```
   
   You should see: `{"status":"ok","message":"API is running"}`

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 bun run backend/server.ts
```

#### 2. Firewall/Security Software Blocking
- Check your firewall settings
- Temporarily disable antivirus/security software
- Allow Node.js/Bun through firewall

#### 3. Network Issues
- Check if localhost resolves: `ping localhost`
- Try using 127.0.0.1 instead of localhost
- Check if you're behind a corporate proxy

#### 4. Environment Variables
Make sure your `.env` file has:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3001
```

### Advanced Troubleshooting

#### Check Server Logs
The backend server provides detailed logging:
```bash
bun run backend/server.ts
```

Look for:
- ✅ Backend server successfully started!
- 🚀 Server running at: http://localhost:3001
- 📡 tRPC endpoint: http://localhost:3001/api/trpc

#### Test Individual Components

1. **Test basic server:**
   ```bash
   curl http://localhost:3001
   ```

2. **Test API endpoint:**
   ```bash
   curl http://localhost:3001/api
   ```

3. **Test tRPC endpoint:**
   ```bash
   curl http://localhost:3001/api/trpc
   ```

#### Mobile Development
For mobile development, you might need to:
1. Use your computer's IP address instead of localhost
2. Update the `.env` file with your network IP:
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:3001
   ```

### Offline Mode
If you can't get the backend working, the app now supports offline mode:
1. Try connecting 3 times
2. Click "オフラインで続行" (Continue Offline)
3. Limited functionality will be available

### Getting Help
If none of these solutions work:
1. Check the console logs in your browser/app
2. Look at the terminal output from the backend server
3. Ensure all dependencies are installed: `bun install`
4. Try restarting your development environment