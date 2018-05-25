var apiai = require('apiai');
var nlpapp = apiai("542cfeef5714428193dc4478760de396");
var apiaiSession = nlpapp.textRequest('아니', {
  sessionId: '97trevor'
});

apiaiSession.on('response', function(response) {
  console.log(response);
});

apiaiSession.on('error', function(error) {
  //handle errors
})

apiaiSession.end();
