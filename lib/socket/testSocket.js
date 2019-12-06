
module.exports = socket => {
  console.log('Connection happened!!');


  socket.on('NAME_SUBMIT', (data) => {
    console.log('NAME_SUBMIT');
    socket.emit('NAME_SUBMIT_DONE', data);
  });
};
