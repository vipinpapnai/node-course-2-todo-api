const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const port = process.env.PORT || 3000 ;
var app = express();

app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc)=>{
    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });
});

app.get('/todos',(req, res)=>{
  Todo.find().then((todos)=>{
     res.send({todos});
  },(e)=>{
    res.status(400).send(e);
  })
});

app.get('/todos/:id',(req,res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({error:'Not a valid Object Id'});
  }
  Todo.findById(id)
    .then((todo)=>{
      if(!todo){
        return res.status(400).send({'error':'cant find todo with given id'});
      }
      res.send({todo});
    },(err)=>{
      return res.status(400).send({'error':'something went wrong'});
    })


});

app.delete('/todos/:id',(req,res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({error : "invalid object id"})
  }
  Todo.findByIdAndRemove(id).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }
    res.send(todo);
  }).catch((e)=>{
     res.status(404).send();
  })
});

app.patch('/todos/:id',(req,res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({error : "invalid object id"})
  }
  var body = _.pick(req.body,['text','completed']);

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
    if(!todo){
      return res.status(404).send({error : "Something went wrong"})
    }
    res.send({todo});
  }).catch((e)=>{
     return res.status(404).send();
  })



})


app.listen(port,()=>{
  console.log(`Started on port ${port}`);
})

module.exports = {app};
