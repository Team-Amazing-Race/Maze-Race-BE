const playersInRoom = {};



module.exports = socket => {
  console.log('Connection happened!!');

  socket.on('ROOM_JOIN_PRIVATE', (data) => {
    console.log('ROOM JOIN PD', data);
    socket.emit('ROOM_JOIN_PRIVATE_DONE', data);

  });

  socket.on('ROOM_CREATE', (data) => {
    console.log(data);
    playersInRoom[data.room] = [...Array(Number(data.number))].map(() => ({ userId: null, name: 'Waiting for player...', ready: false, color: null, symbol: null }));
    const room = {
      name: data.room,
      seats: Number(data.number),
      runners: 0,
      players: playersInRoom[data.room]
    };
    socket.broadcast.emit('ROOM_CREATE_DONE', room);
    socket.emit('ROOM_CREATE_DONE', room);
  });

  socket.on('SET_USER_ID', (data) => {
    socket.emit('SET_USER_ID_DONE', data);
  });

  socket.on('ROOM_JOIN', (data) => {

    socket.join(data.inRoom);
    const roomSocket = socket.to(data.inRoom);
    console.log(playersInRoom);

    let playerAssigned = false;
    playersInRoom[data.inRoom] = playersInRoom[data.inRoom].map(player => {
      if(!player.userId && !playerAssigned) {
        playerAssigned = true;
        return ({ userId: data.userId, name: 'Waiting for player...', ready: false, color: null, symbol: null });
      } else {
        return player;
      }
    });

    console.log(playersInRoom);
    roomSocket.broadcast.emit('ROOM_JOIN_DONE', { playersInRoom: playersInRoom[data.inRoom], inRoom: data.inRoom });
    roomSocket.emit('ROOM_JOIN_DONE', { playersInRoom: playersInRoom[data.inRoom], inRoom: data.inRoom });

    console.log('JOINED ROOM', data.inRoom);

    roomSocket.on('ENTER_NAME', ({ name, color, symbol, state }) => {

      playersInRoom[state.inRoom] = playersInRoom[state.inRoom].map(player => {
        if(player.userId === state.userId) {
          return { ...player, name, color, symbol, ready: true };
        } else {
          return player;
        }

      });
      roomSocket.broadcast.emit('ENTER_NAME_DONE', playersInRoom[state.inRoom]);
      roomSocket.emit('ENTER_NAME_DONE', playersInRoom[state.inRoom]);

      console.log('IN ROOM', data.inRoom);
      console.log('ENTER NAME', name, color, symbol);
    });

    roomSocket.on('disconnect', ({ room }) => {
      roomSocket.emit('ROOM_DISCONNECT', room);
      roomSocket.broadcast.emit('ROOM_DISCONNECT', room);
      //delete playersinroom[room] when game is over
      console.log('disconnect');
    });

    roomSocket.on('MOVE_PLAYER', (data) => {
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
