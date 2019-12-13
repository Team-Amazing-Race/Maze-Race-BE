const { getMaze } = require('../services/mazeApi');

const playersInRoom = {};
let maze;
const startingPoints = [[1, 25], [25, 1], [1, 1], [25, 25], [13, 1], [1, 13], [25, 13], [13, 25]];
let player = 0;

module.exports = (io, socket) => {
  console.log('Connection happened!!');

  let roomName;

  //takes in room id and number of players from FE and creates room object with player array.
  socket.on('ROOM_CREATE', (data) => {
    console.log(data);

    getMaze().then(res => maze = res);

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

    roomName = data.inRoom;
    socket.join(roomName);

    let playerAssigned = false;
    playersInRoom[data.inRoom] = playersInRoom[data.inRoom].map(player => {
      if (!player.userId && !playerAssigned) {
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


    console.log('JOINED ROOM', data.inRoom);

    // roomSocket.on('disconnect', ({ room }) => {
    //   roomSocket.emit('ROOM_DISCONNECT', room);
    //   roomSocket.broadcast.emit('ROOM_DISCONNECT', room);
    //   //delete playersinroom[room] when game is over
    //   console.log('disconnect');
    // });

    socket.on('MOVE_PLAYER', (data) => {

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
      
      console.log(player.xPos, player.yPos, newX, newY);

      const cell = JSON.parse(maze).find(cell => {
        return cell.coordinates.x === player.xPos && cell.coordinates.y === player.yPos;
      });


      const exits = Object.values(cell.exits);


      const dirBool = exits.some(exit => {
        return exit.x === newX && exit.y === newY;
      });

      if (dirBool) {

        playersInRoom[data.room] = playersInRoom[data.room].map(player => {
          if (player.userId !== data.userId) return player;
          return { ...player, xPos: newX, yPos: newY };
        });


        io.to(roomName).emit('MOVE_PLAYER_DONE', playersInRoom[data.room]);

      }


    });

    socket.on('READY', () => {
      player = 0;
      io.to(roomName).emit('READY_DONE', { maze: maze, room: roomName });
    });

  });

  socket.on('ENTER_NAME', ({ name, color, symbol, ready, userId }) => {

    const x = startingPoints[player][0];
    const y = startingPoints[player][1];

    if (!roomName) return;

    playersInRoom[roomName] = playersInRoom[roomName].map(player => {
      if (player.userId !== userId) return player;
      return { ...player, name, color, symbol, ready, xPos: x, yPos: y };
    });

    player++;

    io.to(roomName).emit('ENTER_NAME_DONE', playersInRoom[roomName]);
  });

};
