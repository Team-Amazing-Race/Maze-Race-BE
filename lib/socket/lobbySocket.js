
module.exports = socket => {
  console.log('Connection happened!!');

  socket.on('ENTER_NAME', ({ name }) => {
    socket.emit('ENTER_NAME_DONE', name);
  });

  socket.on('ROOM_JOIN_FROM_ROUTE', (data) => {
    socket.emit('ROOM_JOIN_PRIVATE', data);

  });

  socket.on('ROOM_JOIN', (data) => {
    const roomSocket = socket.join(data.room);
    console.log(data);
    roomSocket.broadcast.emit('ROOM_JOIN_DONE', data);
    roomSocket.emit('ROOM_JOIN_DONE', data);
    roomSocket.emit('ROOM_JOIN_PRIVATE', data);

    socket.on('disconnect', ({ room }) => {
      roomSocket.emit('ROOM_DISCONNECT', room);
      roomSocket.broadcast.emit('ROOM_DISCONNECT', room);
      console.log('disconnect');
    });

    socket.on('MOVE_PLAYER', (data) => {
      roomSocket.emit('MOVE_PLAYER_DONE', data);
      roomSocket.broadcast.emit('MOVE_PLAYER_DONE', data);
    });
  });

  // socket.on('ROOM_CREATE', ({ room }) => {
  //   const roomSocket = socket.join(room);

  //   console.log(room);

  //   roomSocket.broadcast.emit('ROOM_CREATE_DONE', room);
  //   roomSocket.emit('ROOM_CREATE_DONE', room);

  // });
};
