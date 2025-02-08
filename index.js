// index.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const socketIo = require('socket.io');

// 1. Load self-signed cert and key (for demo). In production, replace with real cert.
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'cert.pem'));

// 2. Create an Express app + HTTPS server
const app = express();
const server = https.createServer({ key, cert }, app);

// 3. Attach Socket.IO
const io = socketIo(server);

// 4. Serve all files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// In-memory map of socket.id → username
const connectedUsers = {};

// 5. Socket.IO connection logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User sets their username
  socket.on('set username', (username) => {
    connectedUsers[socket.id] = username;
    console.log(`User [${socket.id}] set username: ${username}`);
  });

  // Encrypted message broadcast
  socket.on('encrypted message', (data) => {
    // data = { iv, ciphertext } from the client
    // Attach the server-known username
    const fromUser = connectedUsers[socket.id] || 'Anonymous';

    // Broadcast to all, including sender
    io.emit('encrypted message', {
      ...data,
      fromUser,
    });
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
  });
});

// 6. Start server on HTTPS port 3000
server.listen(3000, () => {
  console.log('Secure chat server running on https://localhost:3000');
  console.log('If using a self-signed cert, accept the browser warning.');
});
