var mongo = require('mongodb'),
    Db = mongo.Db,
    util = require('util'),
    plugn = require('./lib/plugn.js'),
    flow = require('flow'),
    fs = require('fs');
  
  
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
    this.loadDict();
    this.storeSeq(); 
  },
  
  loadDict: function(){
    flow.exec(
      function() {
        app.log('loadDict() #1 process.cwd(): ', process.cwd());
        fs.readFile(__dirname + '/data/dict/english.txt', this); 
      },
      function (err, data) {
        if (err) 
          throw err;
          
        app.dictSrc = data.toString();
        // var dictSlice = app.dictSrc.substr(0,20055);
        var dictArray = app.dictSrc.split(/[\n\r]+/);
        app.log(dictArray.slice(0,18), ' * dictArray.length: '+dictArray.length + ':\n');
      }
    );
  },
  
  storeSeq: function(){
    flow.exec(
      // 0. read db config
      function() {
        fs.readFile(__dirname + '/conf.db.txt', this);
      }, 
      // 1. connection to DB
      function (err, confDB) {
        if (err) 
          throw err;
          
        app.log('1. flow started');
        var $ = app, 
            MongoClient = mongo.MongoClient;
        confDB = confDB.toString() || 'mongodb://' + $.cfg.dbHost + ':' + $.cfg.dbPort + '/' + $.cfg.dbName;
        app.log(' * ' + confDB);
        MongoClient.connect(confDB, this);  
      },
      
      // 2. if connection is OK, open a collection in DB
      function(err, db){
        if (err)
          return app.log(err, '2. (!) db connection error');
        console.log('2. MongoClient connected');
        app.db = db;
        app.db.collection(app.cfg.dbCollName, this);
      },
      
      // 3. collection state
      function(err, collection) {
        if (err) 
          return app.log(err, '3. (!) collection error ');
          
        app.collection = collection;
        app.log('3. collection: {' + collection.collectionName + '}');
        this(collection);
      },
      
      // 4. insert
      function(collection) {
        var doc = {mykey:1, fieldtoupdate:1},
            doc2 = {mykey:2, docs:[{doc1:1}]},
            doc3 = {mykey:3, fieldtoupdate:10};
        app.log('4. inserting doc');
        collection.insert(doc, {safe:true}, this);
        // this();
      },
      // 5. update
      function(err, result) {
        app.log('5. updating field')
        app.collection.update({mykey:3}, {$set:{fieldtoupdate:308}}, {multi: true, safe: true}, this);
      },
      
      // 6. 
      function(err, result) {
        app.log('6. \err: ', err, '\n result: ', result);
        var fr = app.collection.find().toArray(this);
      },
      
      // 7.
      function(err, items){
        if (err)
          return app.log(err, '7. (!) : ');
        app.log(items, '7. items:\n');
      }
      
      
    );  
  }
  
}

app.init();
