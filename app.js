var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongodb = require('mongodb');
var functionSheet = require('./functionSheet');
var api = require("./apiCalls");
var async = require('async');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

// var apiai = require('apiai');
// var nlpapp = apiai("3d2a930932f6409e90ce7cddbe99c3fc");

var app = express();
var ObjectID = mongodb.ObjectID;

app.use(bodyParser.json());

var db;
var config = require('./Schema/config');

// process.on('uncaughtException', function (err) {
//     db.collection('error').insertOne({ "type": err.type, "msg": err.msg, "stack": err.stack });
// });

app.set('port', (process.env.PORT || 5000));

//시작하기 버튼
request({
  uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
  qs: { access_token: PAGE_ACCESS_TOKEN },
  method: 'POST',
  json: {
    "get_started":{
      "payload":"<GET_STARTED_PAYLOAD>"
    }
  }
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

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'ZoavjtmQjel17ai') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

function watson(message){
  var ConversationV1 = require('watson-developer-cloud/conversation/v1');

  // Set up Conversation service wrapper.
  var conversation = new ConversationV1({
    username: 'e7c18156-a871-4523-90db-02af36cc117e', // replace with username from service key
    password: 'yNNowTXsrKXN', // replace with password from service key
    path: { workspace_id: 'b0b3b9cb-4345-4f82-83b7-9c8776be0ddc' }, // replace with workspace ID
    version_date: '2017-05-26'
  });

  // Start conversation with empty message.
  conversation.message({message}, processResponse);

  // Process the conversation response.
  function processResponse(err, response) {
    if (err) {
      console.error(err); // something went wrong
      return;
    }

    // Display the output from dialog, if any.
    if (response.output.text.length != 0) {
        var messageData = {"text": response.output.text[0]};
        api.sendMessage(event, messageData);
    }
  }
}

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        var senderID = event.sender.id;
        var task = [
          function (callback) {
            var execute;
            db.collection('users').findOne({ "fbuid": senderID}, function (err, doc) {
                if (err) throw err;
                callback(null, (functionSheet[doc.messagePriority] || functionSheet[event.message.text] || watson(event.message.text)));
            });
          },
          function (execute, callback) {
              execute(event, db);
              callback(null);
          }];
        async.waterfall(task);
      });
    });

    // Assume all went well.
    res.sendStatus(200);
  }
});

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  if (payload == "<GET_STARTED_PAYLOAD>") {
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
        db.collection('users').findOne({"fbuid": senderID}, function (err, user){
          if (user){
            db.collection('users').update({"fbuid": senderID}, {$set: {"first_name": first_name, "last_name": last_name, "gender": gender}})
          }
          else {
            db.collection('users').insertOne({"fbuid": senderID, "first_name": first_name, "last_name": last_name, "gender": gender})
          }
        });
      }
    });
    sendTextMessage(senderID, "안녕 " + first_name + "!");
    sendTextMessage(senderID, "난 너의 캠퍼스 생활을 도와줄 설대봇이야!");
    }
    else {
      db.collection('users').update({"fbuid": senderID}, {$set: {"messagePriority": payload}})
    }
}
//
// function receivedMessage(event) {
//   var senderID = event.sender.id;
//   var recipientID = event.recipient.id;
//   var timeOfMessage = event.timestamp;
//   var message = event.message;
//
//   var messageId = message.mid;
//
//   var messageText = message.text;
//   var messageAttachments = message.attachments;
//
//   if (messageText) {
//     var task = [
//       function (callback) {
//         var execute;
//         db.collection('users').findOne({ "fbuid": req.body.user_key }, function (err, doc) {
//             if (err) throw err;
//             callback(null, (functionSheet[messageText]));
//         });
//
//       },
//       function (execute, callback) {
//           execute(req, res, db);
//           callback(null);
//       }];
//     async.waterfall(task);
//   } else if (messageAttachments) {
//     sendTextMessage(senderID, "Message with attachment received");
//   }
// }

//
// app.get('/privacy-policy', function(req, res) {
//     res.sendFile(path.join(__dirname + '/privacyStatement.html'));
// });
//
// app.get('/snu', (req, res) => {
//   res.sendFile(path.join(__dirname + '/images/snu.png'));
// })
//
// app.get('/yonsei', (req, res) => {
//   res.sendFile(path.join(__dirname + '/images/yonsei.png'));
// })
//
// app.get('/korea', (req, res) => {
//   res.sendFile(path.join(__dirname + '/images/korea.png'));
// })
//
// var request = nlpapp.textRequest('안녕', {
//     sessionId: '1'
// });
// request.on('response', function(response) {
//   intentName = response.result.metadata.intentName
// });
//
// request.on('error', function(error) {
//     return "HeuristicResponse"
// });
//
// request.end();
//
// app.post('/message', (req, res) => {
//
//     var task = [
//         function (callback) {
//             //asks for sex to differentiate between users who completed registration and those who did not
//             db.collection('users').findOne({ "uid": req.body.user_key}, function (err, result) {
//                 if (err) throw err;
//                 callback(null, result)
//             });
//         },
//         function (result, callback) {
//             var execute;
//             if (result) {
//               var request = nlpapp.textRequest(req.body.content, {
//                   sessionId: req.body.user_key
//               });
//
//               request.on('response', function(response) {
//                 db.collection('users').findOne({ "uid": req.body.user_key }, function (err, doc) {
//                     if (err) throw err;
//                     callback(null, (functionSheet[doc.messagePriority] || functionSheet[req.body.content] || functionSheet[response.result.metadata.intentName] || functionSheet["HeuristicResponse"]));
//                 });
//               });
//
//               request.on('error', function(error) {
//                 callback(null, (functionSheet[doc.messagePriority] || functionSheet[req.body.content] || functionSheet["HeuristicResponse"]));
//               });
//
//               request.end();
//
//             } else {
//                 callback(null, functionSheet["newBuddy"]);
//             }
//         },
//         function (execute, callback) {
//             execute(req, res, db);
//             callback(null);
//         }];
//
//     async.waterfall(task);
// });

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
    require('./database').init(app, config);
    db = app.get('database');
});
