module.exports = {
	server_port: 5000,
    db_url: 'mongodb://heroku_rzlfx88w:9t3ubnp26nqegbg94f4m1hql7m@ds135594.mlab.com:35594/heroku_rzlfx88w',
    SchemaList: [
	    {file:'./Schema/UserSchema', collection:'users3', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./Schema/BabSchema', collection:'Bab', schemaName:'BabSchema',modelName:'BabModel'}
	],

    mongoose: function () {
        var db = mongoose.connect(this.db_url, { useMongoClient: true });
        require('./BambooSchema.js');
        return db;
    }
}
