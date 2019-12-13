const { getMaze } = require('../services/mazeApi');

const playersInRoom = {};
const startingPoints = [[1, 25], [25, 1], [1, 1], [25, 25], [13, 1], [1, 13], [25, 13], [13, 25]];
const mazesByRoom = {};
const playersByRoom = {};

module.exports = (io, socket) => {
  console.log('Connection happened!!');
  let roomName;

  //takes in room id and number of players from FE and creates room object with player array.
  socket.on('ROOM_CREATE', (data) => {

    playersByRoom[data.room] = 0;
    getMaze().then(res => mazesByRoom[data.room] = res);

    playersInRoom[data.room] = [...Array(Number(data.number))].map(() => (
      {
        userId: null,
        name: 'Waiting for player...',
        ready: false,
        color: null,
        symbol: null,
        xPos: null,
        yPos: null
      }
    ));

    const room = {
      name: data.room,
      seats: Number(data.number),
      runners: 0,
      players: playersInRoom[data.room],
      cellMap: null
    };


    socket.join(data.room);

    //sends room object to FE to be saved in gameState
    io.to(data.room).emit('ROOM_CREATE_DONE', room);

  });



  //takes state form FE and uses inRoom to join unique rooms
  socket.on('ROOM_JOIN', (data) => {
    if(roomName) socket.leave(roomName);
    roomName = data.inRoom;
    socket.join(roomName);

    let playerAssigned = false;
    if(!playersInRoom[data.inRoom]) return;
    playersInRoom[data.inRoom] = playersInRoom[data.inRoom].map(player => {
      if(!player.userId && !playerAssigned) {
        playerAssigned = true;
        return (
          {
            userId: data.userId,
            name: 'Waiting for player...',
            ready: false,
            color: null,
            symbol: null,
            xPos: null,
            yPos: null
          });
      } else {
        return player;
      }
    });

    //sends back and object with the matching player list and room id
    socket.emit('ROOM_JOIN_PRIVATE_DONE', data.userId);
    io.to(roomName).emit('ROOM_JOIN_DONE', { playersInRoom: playersInRoom[data.inRoom], inRoom: data.inRoom });
  });



  socket.on('ENTER_NAME', ({ name, color, symbol, ready, userId }) => {
    
    if(!playersInRoom[roomName]) return;
    
    const x = startingPoints[playersByRoom[roomName]][0];
    const y = startingPoints[playersByRoom[roomName]][1];
    

    playersInRoom[roomName] = playersInRoom[roomName].map(player => {
      if(player.userId !== userId) return player;
      return { ...player, name, color, symbol, ready, xPos: x, yPos: y };
    });

    playersByRoom[roomName]++;

    io.to(roomName).emit('ENTER_NAME_DONE', playersInRoom[roomName]);
  });



  socket.on('READY', () => {
    playersByRoom[roomName] = 0;
    io.to(roomName).emit('READY_DONE', { maze: mazesByRoom[roomName], room: roomName });
  });



  socket.on('MOVE_PLAYER', (data) => {
    console.log('****PLAYER MOVE');
    if(!playersInRoom[data.room]) return;
    const player = playersInRoom[data.room].find(p => {
      return p.userId === data.userId;
    });


    const moves = {
      'up': { xPos: 0, yPos: 1 },
      'down': { xPos: 0, yPos: -1 },
      'left': { xPos: -1, yPos: 0 },
      'right': { xPos: 1, yPos: 0 }
    };

    const dir = moves[data.dir];

    const newX = player.xPos + dir.xPos;
    const newY = player.yPos + dir.yPos;

    const cell = JSON.parse(mazesByRoom[data.room]).find(cell => {
      return cell.coordinates.x === player.xPos && cell.coordinates.y === player.yPos;
    });


    const exits = Object.values(cell.exits);


    const dirBool = exits.some(exit => {
      return exit.x === newX && exit.y === newY;
    });

    if(dirBool) {
      playersInRoom[data.room] = playersInRoom[data.room].map(player => {
        if(player.userId !== data.userId) return player;
        return { ...player, xPos: newX, yPos: newY };
      });


      io.to(roomName).emit('MOVE_PLAYER_DONE', playersInRoom[data.room]);
      if(newX === 13 && newY === 13) io.to(roomName).emit('WINNER', player);
    }
  });



  socket.on('RESET', (data) => {
    playersByRoom[roomName] = 0;
    io.to(data).emit('RESET_DONE');
    delete playersInRoom[data];
    socket.leave(data);
  });

};
