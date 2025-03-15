// websocketServer.ts
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import {prisma} from '../prisma/client';

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Set<WebSocket>();

// Handle WebSocket connections
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to WebSocket server'
  }));

  // Handle incoming messages
  ws.on('message', async (message) => {
    console.log('Received raw message:', message.toString());

    try {
      // Parse the message
      const data = JSON.parse(message.toString());
      console.log('Parsed message data:', data);

      // Extract user ID
      const userId = data.userId ? Number(data.userId) : null;

      if (!userId) {
        console.log('No user ID provided, skipping database operations');
        return;
      }

      // Verify user exists
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          console.error(`User with ID ${userId} not found`);
          return;
        }
      } catch (userError) {
        console.error('Error finding user:', userError);
        return;
      }

      // Process by event type
      try {
        switch (data.type) {
          case 'keystroke':
            console.log(`Processing keystroke: ${data.keyPressed} for user ${userId}`);

            // Store keystroke
            await prisma.keystroke.create({
              data: {
                userId: userId,
                keyPressed: String(data.keyPressed || '')
              }
            });

            // Log event
            await prisma.eventLog.create({
              data: {
                userId: userId,
                eventType: 'keyispressed',
                details: `Key pressed: ${data.keyPressed}`
              }
            });

            console.log('Keystroke stored successfully');
            break;

          case 'mouseMovement':
            console.log(`Processing mouse movement: (${data.xPos}, ${data.yPos}) for user ${userId}`);

            // Store mouse movement
            await prisma.mouseMovement.create({
              data: {
                userId: userId,
                xPos: Number(data.xPos || 0),
                yPos: Number(data.yPos || 0)
              }
            });

            // Log event
            await prisma.eventLog.create({
              data: {
                userId: userId,
                eventType: 'mousemoved',
                details: `Mouse moved to: (${data.xPos}, ${data.yPos})`
              }
            });

            console.log('Mouse movement stored successfully');
            break;

          case 'tabSwitch':
            console.log(`Processing tab switch: ${data.tabUrl} for user ${userId}`);

            // Store tab switch
            await prisma.tabSwitch.create({
              data: {
                userId: userId,
                tabUrl: String(data.tabUrl || '')
              }
            });

            // Log event
            await prisma.eventLog.create({
              data: {
                userId: userId,
                eventType: 'tabswitched',
                details: `Tab switched to: ${data.tabUrl}`
              }
            });

            console.log('Tab switch stored successfully');
            break;

          case 'heartbeat':
            // Just acknowledge heartbeats
            ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
            break;

          default:
            console.log(`Unknown event type: ${data.type}`);
        }
      } catch (dbError) {
        console.error(`Error storing ${data.type} event:`, dbError);
      }

    } catch (parseError) {
      console.error('Error parsing message:', parseError);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

export { server };
