var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
// var mongodb = require('mongodb');
// var functionSheet = require('./functionSheet');
// var path = require('path');
var async = require('async');

// var apiai = require('apiai');
// var nlpapp = apiai("3d2a930932f6409e90ce7cddbe99c3fc");

var app = express();
// var ObjectID = mongodb.ObjectID;

app.use(bodyParser.json());

// var db;
// var config = require('./Schema/config');

// process.on('uncaughtException', function (err) {
//     db.collection('error').insertOne({ "type": err.type, "msg": err.msg, "stack": err.stack });
// });

app.set('port', (process.env.PORT || 5000));

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'ZoavjtmQjel17ai') {
    console.log("Validating webhook");
    console.log(req.body)
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

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
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

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

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}
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
// app.get('/keyboard', (req, res) => {
//   res.send({
//     type : "buttons",
//     buttons : [
//       "버디와 대화하기", "익명 우편함","동아리 추천", "오늘 밥 뭐야?", "미팅 들어온 거 있어?", "열람실 현황"
//     ]
//   })
// });
//
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
    // require('./database').init(app, config);
    // db = app.get('database');
});
