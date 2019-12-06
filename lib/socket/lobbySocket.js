
module.exports = socket => {
  console.log('Connection happened!!');

  socket.on('ROOM_CONNECT', ({ room }) => {
    socket.join(room);

    console.log(room);
    
    socket.to(room).broadcast.emit('ROOM_CONNECT_DONE');
    socket.to(room).emit('ROOM_CONNECT_DONE');

    socket.on('NAME_SUBMIT', (data) => {
      console.log('NAME_SUBMIT');
      socket.broadcast.emit('NAME_SUBMIT_DONE', data);
      socket.emit('NAME_SUBMIT_DONE', data);
    });
  });
};
