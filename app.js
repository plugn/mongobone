var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    util = require('util'),
    plugn = require('./lib/plugn.js'),
    flow = require('flow');
  
  
var app = {
  log: function(){
    var args = [].slice.call(arguments);
    if (2 == args.length && 'object' == typeof args[0])
      return console.log(' (i) ' + args[1] + ': ', util.inspect(args[0],{colors: true}));
    console.log.apply(console, args);
  },
  
  cfg: {
    dbName: 'mgbone',
    dbHost: 'localhost',
    dbPort: 27017,
    dbCollName: 'test'
  },
  
  init: function() {
    this.storeSeq();
  },
  
  storeSeq: function(){
    flow.exec(
      // 1. connection to DB
      function(){
        app.log(' * flow started');
        var $ = app, 
          connQuery = 'mongodb://' + $.cfg.dbHost + ':' + $.cfg.dbPort + '/' + $.cfg.dbName,
          MongoClient = mongo.MongoClient;
        app.log(' * ' + connQuery);
        MongoClient.connect(connQuery, this);  
      },
      
      // 2. if connection is OK, open a collection in DB
      function(err, db){
        if (err)
          return app.log(err, 'db connection error');
        console.log(' # MongoClient connected');
        app.db = db;
        app.db.collection(app.cfg.dbCollName, {w:0}, this);
      },
      
      // 3. collection state
      function(err, collection) {
        if (err) 
          return app.log(err, ' * collection error ');
          
        app.collection = collection;
        app.log(' * collection: {' + collection.collectionName + '}');
        this(collection);
      },
      
      function(collection) {
        var doc = {mykey:1, fieldtoupdate:1},
            doc2 = {mykey:2, docs:[{doc1:1}]};
        app.log('inserting doc');
        collection.insert(doc, {w:1}, this);
      },
      
      function(err, result) {
        app.log('updating field')
        app.collection.update({mykey:1}, {$set:{fieldtoupdate:2}}, {w:1}, this);
      },
      
      function(err, result) {
        app.log(' * * * voila!\n err: ', err, '\n result: ', result);
      }
      
    );  
  }
  
}

app.init();