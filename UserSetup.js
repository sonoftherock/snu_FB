var request = require("request");
var quick_replies = require('./quick_replies');
var api = require('./apiCalls')
var async = require('async');
var mysql = require("mysql");

var connection = mysql.createConnection(process.env.DATABASE_URL);

function registerUser(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  request({
      url: "https://graph.facebook.com/v2.6/" + senderID,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        locale: "ko_KR",
        fields: "first_name,last_name,gender,education"
      },
      method: "GET"
    }, function(error, response, body) {
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var task = [
          function (callback) {
            var bodyObj = JSON.parse(body);
            var first_name = bodyObj.first_name;
            var last_name = bodyObj.last_name;
            var gender = bodyObj.gender;
            connection.query('INSERT INTO Users (user_id, first_name, last_name, sex, context) VALUES ('+ event.sender.id + ', "' + first_name + '","' + last_name + '","' + gender + '",' + "register1" + ')');
            callback(null, first_name);
          },
          function (err, result) {
            api.sendResponse(event, {"text":"안녕 " + first_name + "!\n난 설대봇이야. 서울대 다니니?", "quick_replies": quick_replies.YesOrNo});
          }
        ];
        async.waterfall(task);
      }
    });
}

var register1 = function(event) {
  task = [
    function(callback){
      connection.query('UPDATE Users SET conv_context=register2 WHERE user_id=' + event.sender.id);
      connection.query('UPDATE Users SET college_major=' + event.message.text);
      callback(null, 'done');
    },
    function(err, result){
      api.sendResponse(event, {"text":"밥 굶겠다.."});
      callback(null);
    }
  ]
  async.waterfall(task);
}

module.exports = {
  functionMatch: {
    "registerUser": registerUser,
    "register1": register1
  }
}
