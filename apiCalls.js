var request = require("request");
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

//보내기 (res.send와 동일)
function sendMessage(event, messageToSend) {
  var senderID = event.sender.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var messageData = {
    recipient: {
      id: senderID
    },
    message: messageToSend
  };
  callSendAPI(messageData);
}

//유저 정보 읽기
function callUserProfileAPI(senderID){
   request({
     url: "https://graph.facebook.com/v2.6/" + senderID,
     qs: {
       access_token: process.env.PAGE_ACCESS_TOKEN,
       locale: "ko_KR",
       fields: "first_name,last_name,gender"
     },
     method: "GET"
   }, function(error, response, body) {
     if (error) {
       console.log("Error getting user's name: " +  error);
     } else {
       var bodyObj = JSON.parse(body);
       first_name = bodyObj.first_name;
       last_name = bodyObj.last_name;
       gender = bodyObj.gender;
       db.collection('users', function (err, user) {
         if (user) {
           db.collection('users').update({"fbuid": senderID}, {$set: {"first_name": first_name, "last_name": last_name, "gender": gender}})
         }
         else {
           db.collection('users').insertOne({"fbuid": senderID, "first_name": first_name, "last_name": last_name, "gender": gender})
         }
       })
     }
     return [first_name, last_name, gender];
   });
}

// 메시지 보내기
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

module.exports.sendMessage = sendMessage;
module.exports.callUserProfileAPI = callUserProfileAPI;
