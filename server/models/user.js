const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email:{
    required:true,
    trim: true,
    type: String,
    minlength:3,
    unique:true,
    validate:{
      validator: validator.isEmail,
      message : '{VALUE} is not a valid email'
    }
  },
  password:{
    type: String,
    required:true,
    minlength:6
  },
  tokens:[{
    access:{
      type: String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
});

UserSchema.methods.toJSON = function(){
  var user = this;
  var userObj = user.toObject();
  return _.pick(userObj,['_id','email'])
}

UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();

  user.tokens.push({access,token});
  return user.save().then(()=>{
    return token;
  })
}

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token,'abc123');
    }catch (e){
        // return new Promise((resolve,reject)=>{
        //     reject();
        // })
        return Promise.reject();
    }

    return User.findOne({
        '_id' : decoded._id,
        'tokens.access':'auth',
        'tokens.token':token
    })
}

//Middleware for hashing password before saving
UserSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
        var password = user.password;
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,(err,hash)=>{
                user.password = hash;
                next();
            })
        })

    }else{
        next();
    }

});


var User = mongoose.model('User',UserSchema);

module.exports = {User};
