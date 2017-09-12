var express = require("express");
var bodyParser = require("body-parser");
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
      req.query['hub.verify_token'] === <VERIFY_TOKEN>) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});
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
