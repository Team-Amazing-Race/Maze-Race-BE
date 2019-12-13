const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.end('awake');
});

const lobbySocket = require('./socket/lobbySocket');

io.on('connection', function(socket) {
  lobbySocket(io, socket);
});

module.exports = server;