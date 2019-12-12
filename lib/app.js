const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);


// middleware
// const morgan = require('morgan');
// server.listen(80);

const lobbySocket = require('./socket/lobbySocket');

// app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.static('public'));

io.on('connection', function(socket) {
  lobbySocket(io, socket);
});

// app.use(require('./middleware/not-found'));
// app.use(require('./middleware/error'));

// API ROUTES
// app.use('/api/auth', auth);

// NOT FOUND
// const api404 = require('./middleware/api-404');
// app.use('/api', api404);

// // ERRORS
// const errorHandler = require('./middleware/error-handler');
// app.use(errorHandler);

module.exports = server;