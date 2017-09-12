var mongoose = require('mongoose');
var mongoClient = require('mongodb').MongoClient;

function connect(app, config){
    database = mongoose.connect(config.db_url,{useMongoClient:true});
    createSchema(app, config);
}

function createSchema(app, config) {
    app.set('database', database);
}

module.exports = {
    init : function(app, config){
        connect(app, config);
        createSchema(app, config);
    }
}
