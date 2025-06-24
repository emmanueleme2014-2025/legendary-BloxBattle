const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('login', ({ username, password }) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('userList', Object.values(users));
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });

  socket.on('chat', (msg) => {
    io.emit('chat', { user: users[socket.id]?.username || 'Unknown', msg });
  });

  socket.on('challenge', (targetId) => {
    io.to(targetId).emit('challenged', users[socket.id]);
  });

  socket.on('accept', (challengerId) => {
    io.to(challengerId).emit('accepted', users[socket.id]);
  });

  socket.on('move', ({ to, word }) => {
    io.to(to).emit('opponentMove', word);
  });
});

http.listen(3000, () => console.log('🌐 BloxBattle running at http://localhost:3000'));
