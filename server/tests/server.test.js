const expect  = require('expect');
const request = require('supertest');

const {app}   = require('./../server');
const {Todo}  = require('./../models/todo');
const {User}  = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos',()=>{
  it('should create a new todo',(done)=>{
    var text = "Test Todo";

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res)=>{
         expect(res.body.text).toBe(text)
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos)=>{
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e)=>done(e));
      })
  });

  it('should not create todo with invalid data',(done)=>{
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err){
        return done(err);
      }
      Todo.find().then((todos)=>{
        expect(todos.length).toBe(2);
        done();
      }).catch((e)=>done(e))

    })
  });
});


describe('GET /todos',()=>{
  it('should get all todos',(done)=>{
    request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);

  });
})


describe('GET /users/me',()=>{
  it('should return a user if authenticated',(done)=>{
      request(app)
          .get('/users/me')
          .set('x-auth',users[0].tokens[0].token)
          .expect(200)
          .expect((res)=>{
              expect(res.body._id).toBe(users[0]._id.toHexString())
              expect(res.body.email).toBe(users[0].email)
          })
          .end(done);
  });

  it('should return 401 if not authenticated',(done)=>{
      request(app)
          .get('/users/me')
          .expect(401)
          .expect((res)=>{
              expect(res.body).toEqual({});
          })
          .end(done)
  });
});

describe('POST /users',()=>{

    it('should create a user',(done)=>{
        var email = 'email@example.com';
        var password = '123qwer';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email)
            })
            .end((err)=>{
                if(err){
                    done(err);
                }
                User.findOne({email}).then((user)=>{
                    expect(user).toBeTruthy();  // old ->> toExists()
                    expect(user.password).not.toBe(password);  //old ->> toNotBe()
                    done();
                })

            });
    });

    it('should return validation error if request invalid',(done)=>{
        request(app)
            .post('/users')
            .send({
                email:'asd',
                password:'111'
            })
            .expect(400)
            .end(done)
    });

    it('should not create user if email in use',(done)=>{
        request(app)
            .post('/users')
            .send({
                email:users[0].email,
                password:'1234567890'
            })
            .expect(400)
            .end(done)

    })

})






























