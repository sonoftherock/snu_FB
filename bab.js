var request = require("request");
var api = require("./apiCalls");
var tmp = {"서울대학교" : 'spgIiBzSj0', "연세대학교" : "IDrA5MHp97", "고려대학교" : 'tqbAESBISp'};
//
// var readUniv = function (req, res, db, callback) {
//     var univ = "미정";
//     db.collection('users').findOne({ "uid": req.body.user_key }, function (err, doc) {
//         if (doc) {
//             univ = doc.univ;
//         }
//         callback(univ);
//     });
// }

//give out list of sikdangs
var whichSikdang = function(event, db){
  var sikdang = [];
  var utc = new Date().setUTCHours(28);
  var todayDate = new Date(utc).toISOString().slice(0,10);
  var key;
  // readUniv (req, res, db, function (univ) {
    key = tmp["서울대학교"];
    var options = { method: 'GET',
      url: 'https://bds.bablabs.com/openapi/v1/campuses/' + key + '/stores',
      qs: { date: todayDate },
      headers:
       { 'postman-token': '13d05bcc-6df0-81ab-df78-180ddeafbeee',
         'cache-control': 'no-cache',
         babsession: '123',
         accesstoken: 'O1t5rnRk80LEErp1NIPgwSy1Inz0xOCtITLovskaYckJohmwsV' } };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      for (i = 0; i < 11; i++){
        sikdang.push({
          "content_type": "text",
          "title": JSON.parse(body).stores[i].name,
          "payload": JSON.parse(body).stores[i].name
        });
      }
      var messageData = {"text": "어디서 먹을건데?", "quick_replies": sikdang };
      api.sendMessage(event, messageData);
      db.collection('users').update({ "fbuid": event.sender.id }, { $set: { "messagePriority": "sendBabMenu"} }, function(err, doc){
          if(err) throw err;
      });
    });
  //  });
}

var sendBabMenu = function(event, db){
  var babMenu = [];
  var utc = new Date().setUTCHours(28);
  var todayDate = new Date(utc).toISOString().slice(0,10);

  // readUniv (req, res, db, function(univ){
    key = tmp["서울대학교"];
    var options = { method: 'GET',
      url: 'https://bds.bablabs.com/openapi/v1/campuses/' + key + '/stores',
      qs: { date: todayDate },
      headers:
       { 'postman-token': '13d05bcc-6df0-81ab-df78-180ddeafbeee',
         'cache-control': 'no-cache',
         babsession: '123',
         accesstoken: 'O1t5rnRk80LEErp1NIPgwSy1Inz0xOCtITLovskaYckJohmwsV' } };

     request(options, function (error, response, body) {
       if (error) throw new Error(error);
       for (i = 0; i < 11; i++){
         if (JSON.parse(body).stores[i].name == event.message.text){
           if (JSON.parse(body).stores[i].menus.length == 0){
             api.sendMessage(event, {"text": "오늘 여기는 밥이 안나와 다른데 가서 머거"});
           }
           else{
             for (j = 0; j < 2; j++){
               //async
               babMenu.push(JSON.parse(body).stores[i].menus[j].description);
             }
             var messageData = {"text": "오늘의 메뉴는 " + babMenu[0] + "야." };
             api.sendMessage(event, messageData);
             api.sendMessage(event, {"text": "존맛이겠다 ㅎㅎ"});
           }
         };
       }
    });

  db.collection('users').update({ "uid": req.body.user_key }, { $set: { "messagePriority": "idle"} }, function(err, doc){
      if(err) throw err;
  });
  // })
};
 
// var babAPIerror = function (req, res, db) {
//   res.send({"message": {"text": "지금 학식 정보 제공하는 쪽에서 메뉴가 안 올라왔어... 미안"}})
//   db.collection('users').update({ "uid": req.body.user_key }, { $set: { "messagePriority": "idle"} }, function(err, doc){
//       if(err) throw err;
//   });
// }

module.exports = {
    functionMatch: {
        "오늘 밥 뭐야?": whichSikdang,
        // "bab": whichSikdang,
        // "hungry - yes": whichSikdang,
        "sendBabMenu": sendBabMenu
    }
};
