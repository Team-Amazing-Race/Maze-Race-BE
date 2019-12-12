const { getMaze } = require('../services/mazeApi');

const playersInRoom = {};

module.exports = (io, socket) => {
  console.log('Connection happened!!');

  let roomName;

  //takes in room id and number of players from FE and creates room object with player array.
  socket.on('ROOM_CREATE', (data) => {
    getMaze().then(res => console.log(res));
  
    playersInRoom[data.room] = [...Array(Number(data.number))].map(() => ({ userId: null, name: 'Waiting for player...', ready: false, color: null, symbol: null }));
    const room = {
      name: data.room,
      seats: Number(data.number),
      runners: 0,
      players: playersInRoom[data.room]
    };

    //sends room object to FE to be saved in gameState
    io.to(data.room).emit('ROOM_CREATE_DONE', room);
  });

  //takes state form FE and uses inRoom to join unique rooms
  socket.on('ROOM_JOIN', (data) => {

    roomName = data.inRoom;
    socket.join(roomName);

    let playerAssigned = false;
    playersInRoom[data.inRoom] = playersInRoom[data.inRoom].map(player => {
      if(!player.userId && !playerAssigned) {
        playerAssigned = true;
        return ({ userId: data.userId, name: 'Waiting for player...', ready: false, color: null, symbol: null });
      } else {
        return player;
      }
    });
    //sends back and object with the matching player list and room id
    io.to(roomName).emit('ROOM_JOIN_DONE', { userId: data.userId, playersInRoom: playersInRoom[data.inRoom], inRoom: data.inRoom });

    console.log('JOINED ROOM', data.inRoom);

    // roomSocket.on('disconnect', ({ room }) => {
    //   roomSocket.emit('ROOM_DISCONNECT', room);
    //   roomSocket.broadcast.emit('ROOM_DISCONNECT', room);
    //   //delete playersinroom[room] when game is over
    //   console.log('disconnect');
    // });

    // roomSocket.on('MOVE_PLAYER', (data) => {
    //   roomSocket.emit('MOVE_PLAYER_DONE', data);
    //   roomSocket.broadcast.emit('MOVE_PLAYER_DONE', data);
    // });
  });

  socket.on('ENTER_NAME', ({ name, color, symbol, userId }) => {
    console.log(roomName, name, userId);
    
    if(!roomName) return;

    playersInRoom[roomName] = playersInRoom[roomName].map(player => {
      if(player.userId !== userId) return player;
      return { ...player, name, color, symbol };
    });
    io.to(roomName).emit('ENTER_NAME_DONE', playersInRoom[roomName]);
  });
};
