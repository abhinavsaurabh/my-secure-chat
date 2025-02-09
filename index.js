// index.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const socketIo = require('socket.io');

// Load self-signed certificate (or your real certificate)
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'cert.pem'));

// Create an Express app and HTTPS server
const app = express();
const server = https.createServer({ key, cert }, app);

// Attach Socket.IO to the HTTPS server
const io = socketIo(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for connected users
const connectedUsers = {};

// In-memory chat history: stores messages for 10 minutes
let chatHistory = [];

// Periodic cleanup: remove messages older than 10 minutes (600,000 ms)
setInterval(() => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  // Since messages are stored in order, remove from the front until the condition is met.
  while (chatHistory.length && chatHistory[0].timestamp < tenMinutesAgo) {
    chatHistory.shift();
  }
}, 60000); // Run every minute

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Send current chat history (last 10 minutes) to the new client
  socket.emit('chat history', chatHistory);

  // Listen for username setup
  socket.on('set username', (username) => {
    connectedUsers[socket.id] = username;
    console.log(`User [${socket.id}] set username: ${username}`);
  });

  // Listen for incoming encrypted messages
  socket.on('encrypted message', (data) => {
    const fromUser = connectedUsers[socket.id] || 'Anonymous';
    // Append a timestamp to the message data
    const messageData = {
      ...data,
      fromUser,
      timestamp: Date.now(),
    };

    // Store the message in chat history
    chatHistory.push(messageData);

    // Broadcast the message to all connected clients
    io.emit('encrypted message', messageData);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
  });
});

// Start the server on port 3000, binding to all interfaces
server.listen(3000, '0.0.0.0', () => {
  console.log('Secure chat server running on https://0.0.0.0:3000');
  console.log('If using a self-signed cert, accept the browser warning.');
});
