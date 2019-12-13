const request = require('superagent');

function getMaze() {
  const url = 'https://maze-api.herokuapp.com/api/mazes/?width=25&height=25&algorithm=Growing%20Tree&number=1&cellShape=Square';

  return request
    .get(url)
    .then(res => {
      return JSON.stringify(res.body[0].cellMap);
    });
}

module.exports = { getMaze };
