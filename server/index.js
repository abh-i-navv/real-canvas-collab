const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression'); // Import compression

const app = express();
app.use(cors());
app.use(compression()); // Use compression middleware

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  let lastDrawTime = Date.now();
  const throttleInterval = 30; // milliseconds

  socket.on('cursor-presence', (data) => {
    socket.broadcast.emit('cursor-data', data);
  });

  socket.on('cursor-leave', () => {
    socket.broadcast.emit('cursor-leave', { id: socket.id });
  });

  socket.on('draw', (data) => {
    if (Date.now() - lastDrawTime >= throttleInterval) {
      socket.broadcast.emit('draw-data', data);
      lastDrawTime = Date.now();
    }
  });

  socket.on('update-board', (data) => {
    socket.broadcast.emit('update-data', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log(`Server running at http://localhost:5000`);
});
