/**
 * Server-Sent Events middleware for real-time updates
 */

const clients = new Set();

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.path === '/api/events') {
      console.log('📡 SSE connection request received');
      
      ctx.request.socket.setTimeout(0);
      ctx.req.socket.setNoDelay(true);
      ctx.req.socket.setKeepAlive(true);

      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const clientId = Date.now() + Math.random();
      const client = {
        id: clientId,
        response: ctx.res
      };
      
      clients.add(client);
      console.log(`🔌 SSE client connected: ${clientId}, total clients: ${clients.size}`);

      // Send initial connection message
      ctx.res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

      // Handle client disconnect
      ctx.req.on('close', () => {
        clients.delete(client);
        console.log(`🔌 SSE client disconnected: ${clientId}, remaining clients: ${clients.size}`);
      });

      ctx.req.on('error', (error) => {
        console.error('SSE connection error:', error);
        clients.delete(client);
      });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        if (ctx.res.writable) {
          try {
            ctx.res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
          } catch (error) {
            console.error('Error sending ping:', error);
            clearInterval(keepAlive);
            clients.delete(client);
          }
        } else {
          clearInterval(keepAlive);
          clients.delete(client);
        }
      }, 30000); // Send ping every 30 seconds

      ctx.respond = false;
      return;
    }
    
    await next();
  };
};

// Export function to broadcast updates to all connected clients
module.exports.broadcastUpdate = (data) => {
  const message = `data: ${JSON.stringify({
    type: 'update',
    data: data,
    timestamp: new Date().toISOString()
  })}\n\n`;

  clients.forEach(client => {
    if (client.response.writable) {
      try {
        client.response.write(message);
      } catch (error) {
        console.error('Error sending SSE message:', error);
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });

  console.log(`Broadcasted update to ${clients.size} clients:`, data);
};