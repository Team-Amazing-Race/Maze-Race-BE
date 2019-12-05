
module.exports = socket => {
  console.log('Connection happened!!');


  socket.on('TEST', (data) => {
    console.log('TEST YO');
    socket.emit('TESTED', data);
  });
};
