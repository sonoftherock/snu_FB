var api = require("./apiCalls")

var findMeeting = function(event){
  var messageData =  {"text": "미팅?"};
  api.sendResponse(event, messageData);
};

module.exports.findMeeting = findMeeting;
