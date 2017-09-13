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
      for (i = 0; i < JSON.parse(body).stores.length; i++){
        sikdang.push(JSON.parse(body).stores[i].name);
      }
      api.sendTextMessage(event, "어디서 먹을건데?");
      db.collection('users').update({ "fbuid": event.sender.id }, { $set: { "messagePriority": "sendBabMenu"} }, function(err, doc){
          if(err) throw err;
      });
    });
  //  });
}

// var sendBabMenu = function(req, res, db){
//   var babMenu = [];
//   var utc = new Date().setUTCHours(28);
//   var todayDate = new Date(utc).toISOString().slice(0,10);
//
//   readUniv (req, res, db, function(univ){
//     key = tmp[univ];
//     var options = { method: 'GET',
//       url: 'https://bds.bablabs.com/openapi/v1/campuses/' + key + '/stores',
//       qs: { date: todayDate },
//       headers:
//        { 'postman-token': '13d05bcc-6df0-81ab-df78-180ddeafbeee',
//          'cache-control': 'no-cache',
//          babsession: '123',
//          accesstoken: 'O1t5rnRk80LEErp1NIPgwSy1Inz0xOCtITLovskaYckJohmwsV' } };
//
//      request(options, function (error, response, body) {
//        if (error) throw new Error(error);
//        for (i = 0; i < JSON.parse(body).stores.length; i++){
//          if (JSON.parse(body).stores[i].name == req.body.content){
//            if(JSON.parse(body).stores[i].menus.length == 0){
//              res.send({"message": {"text": "오늘 여기는 밥이 안나와 다른데 가서 머거"}});
//            }
//            else{
//              for (j = 0; j < 2; j++){
//                //async
//                babMenu.push(JSON.parse(body).stores[i].menus[j].description);
//              }
//              res.send({"message": {"text": "오늘의 메뉴는 " + babMenu[0] + "야.\n존맛이겠다 ㅎㅎ" }});
//            }
//          };
//        }
//     });
//
//   db.collection('users').update({ "uid": req.body.user_key }, { $set: { "messagePriority": "idle"} }, function(err, doc){
//       if(err) throw err;
//   });
//   })
// };
//
// var babAPIerror = function (req, res, db) {
//   res.send({"message": {"text": "지금 학식 정보 제공하는 쪽에서 메뉴가 안 올라왔어... 미안"}})
//   db.collection('users').update({ "uid": req.body.user_key }, { $set: { "messagePriority": "idle"} }, function(err, doc){
//       if(err) throw err;
//   });
// }

module.exports = {
    functionMatch: {
        "오늘 밥 뭐야?": whichSikdang
        // "bab": whichSikdang,
        // "hungry - yes": whichSikdang,
        // "sendBabMenu": sendBabMenu
    }
};
