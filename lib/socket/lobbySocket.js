
module.exports = socket => {
  console.log('Connection happened!!');

  socket.on('ROOM_CONNECT', ({ room }) => {
    const roomSocket = socket.join(room);

    console.log(room);

    roomSocket.emit('ROOM_CONNECT_DONE', room);

  });
};
