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

  socket.on("join-room", (data)=> {
    socket.join(data)
  })

  socket.on('cursor-presence', (data) => {
    socket.to(data.boardId).emit('cursor-data', data.data);
  });

  socket.on('cursor-leave', (data) => {
    socket.to(data.boardId).emit('cursor-leave', { id: socket.id });
  });

  socket.on('draw', (data) => {
      socket.to(data.boardId).emit('draw-data', data.data);
  });

  socket.on('update-board', (data) => {
    socket.to(data.boardId).emit('update-data', data.data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log(`Server running at http://localhost:5000`);
});
