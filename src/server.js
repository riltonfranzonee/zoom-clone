const express = require('express');
const { Server } = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = new Server(app);
const peerServer = ExpressPeerServer(server);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message);
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🚀 App listening on port 3000!');
});
