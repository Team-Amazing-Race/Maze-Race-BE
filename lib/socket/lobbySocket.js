
module.exports = socket => {
  console.log('Connection happened!!');

  socket.on('ROOM_JOIN', ({ room }) => {
    const roomSocket = socket.join(room);

    console.log(room);

    roomSocket.emit('ROOM_JOIN_DONE', room);
  });

  socket.on('ROOM_CREATE', ({ room }) => {
    const roomSocket = socket.join(room);

    console.log(room);

    roomSocket.emit('ROOM_CREATE_DONE', room);

  });
};
