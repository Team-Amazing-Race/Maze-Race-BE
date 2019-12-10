
module.exports = socket => {
  console.log('Connection happened!!');


  socket.on('ROOM_JOIN_PRIVATE', (data) => {
    console.log('ROOM JOIN PD', data);
    socket.emit('ROOM_JOIN_PRIVATE_DONE', data);

  });

  socket.on('ROOM_CREATE', (data) => {
    socket.emit('ROOM_CREATE_DONE', data);
  });

  socket.on('SET_USER_ID', (data) => {
    socket.emit('SET_USER_ID_DONE', data);
  });

  socket.on('ROOM_JOIN', (data) => {
    const roomSocket = socket.join(data.inRoom);
    roomSocket.broadcast.emit('ROOM_JOIN_DONE', data);
    // roomSocket.emit('ROOM_JOIN_DONE', data);

    socket.on('disconnect', ({ room }) => {
      roomSocket.emit('ROOM_DISCONNECT', room);
      roomSocket.broadcast.emit('ROOM_DISCONNECT', room);
      console.log('disconnect');
    });

    socket.on('ENTER_NAME', ({ name }) => {
      console.log('ENTER NAME', name);
      roomSocket.broadcast.emit('ENTER_NAME_DONE', name);
      // roomSocket.emit('ENTER_NAME_DONE', name);
    });

    socket.on('MOVE_PLAYER', (data) => {
      // roomSocket.emit('MOVE_PLAYER_DONE', data);
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
