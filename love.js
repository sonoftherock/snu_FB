var api = require("./apiCalls")
var mysql = require('mysql');
var connection = mysql.createConnection(process.env.DATABASE_URL);

var n_to_n = function(event){
  var messageData =  {"text": "너희 과에 미팅 들어온게 있네.. 같이 나갈 친구들이랑 단톡 만들어서 나 초대해주면 주선해줄게!"};
  api.sendResponse(event, messageData);
};

var one_to_one = function(event){
  var messageData =  {"text": "소개팅?"};
  api.sendResponse(event, messageData);
};

module.exports = {
  functionMatch: {
    "미팅": n_to_n,
    "소개팅": one_to_one
  }
}
