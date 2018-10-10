// const MongoClient = require('mongodb').MongoClient;
const {MongoClient,  ObjectId} = require('mongodb'); //object destructuring

const dbName = 'TodoApp';
const url = 'mongodb://localhost:27017';

const client = new MongoClient(url,{ useNewUrlParser: true });

client.connect((err)=>{
  if(err){
    return console.log('unable to Connect to MongoDB Server');
  }
  console.log('Connected to MongoDB Server');
  const db = client.db(dbName);

  // db.collection('Todos').insertOne({
  //   text:'Something to do',
  //   completed:false
  // },(err,result)=>{
  //   if(err){
  //     return console.log('Unable to insert todo',err);
  //   }
  //
  //   console.log(JSON.stringify(result.ops,undefined,2));
  // });

  db.collection('Users').insertOne({
    name:'Vipin',
    age:27,
    location:'Delhi'
  },(err,result)=>{
    if(err){
      return console.log('Unable to insert user',err);
    }

    console.log(JSON.stringify(result.ops,undefined,2));
  });

  client.close();
});
