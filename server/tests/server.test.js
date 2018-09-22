const expect  = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user')
const {todos, populateTodos, user, populateUsers} = require('./seed/seed');

// clear all the todo before testing
beforeEach(populateUsers);
beforeEach(populateTodos);

// test for Post
describe('POST /todos' , () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .set('x-auth', user[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('Should not create todo with invaild body date', (done) => {
        
        request(app)
            .post('/todos')
            .set('x-auth', user[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
            })

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', user[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1)
            })
            .end(done);
    });
});

describe('GET /todos/id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', user[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', user[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        //make sure you get a 404 back
        var hexId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', user[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should rerturn 404 for a non-object ids', (done) => {
        // todo
        request(app)
            .get('/todos/123abc')
            .set('x-auth', user[0].tokens[0].token)
            .expect(404)
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('Should remove a todo', (done) =>{
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', user[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e))
            });
    });

    it('Should not remove a todo create by other user', (done) =>{
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', user[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e))
            });
    });

    it('should return 404 if todo no found', (done) => {
        var hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', user[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .delete(`/todos/123abc`)
            .set('x-auth', user[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('Should update the todo', (done) => {
        //grab id of frist item
        let hexId = todos[0]._id.toHexString();
        // update text, set completed true
        let text = 'This should be the new text';
        
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', user[0].tokens[0].token)
            .send({
                completed:true,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done)
        // 200
        // text is changed, completed is true, completedAt tobe a number

    });

    it('Should not update the todo create by other user', (done) => {
        //grab id of frist item
        let hexId = todos[0]._id.toHexString();
        // update text, set completed true
        let text = 'This should be the new text';
        
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', user[1].tokens[0].token)
            .send({
                completed:true,
                text
            })
            .expect(404)
            .end(done)
        // 200
        // text is changed, completed is true, completedAt tobe a number

    });
        


    it('should clear completedAt when todo is not completed', (done) => {
        // grab id of second todo item
        let hexId = todos[1]._id.toHexString();
        let text = 'This should be the new test';
        // update text, set completed to false
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', user[1].tokens[0].token)
            .send({
                completed:false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done)
        // 200
        // text is changed, completed false, completedAt is null tonot
    })
});

describe('GET /users/me', () => {
    it('should return user if authentcated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', user[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(user[0]._id.toHexString());
                expect(res.body.email).toBe(user[0].email);
            })
            .end(done)
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done)
    })
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@hotmail.co.uk';
        var password = '123abc!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if(err){
                    return done(err)
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invaild', (done) => {
        var email = 'stupop.co.uk'
        request(app)
            .post('/users')
            .send({email})
            .expect(400)
            .end(done)

    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: user[0].email,
                password: 'Password123'
            })
            .expect(400)
            .end(done)
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: user[1].email,
                password: user[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if(err){
                    return done(err)
                }

                User.findById(user[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done()
                }).catch((e) => done(e))
            })
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: user[1].email,
                password: user[1].password + '1'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if(err){
                    return done(err)
                }

                User.findById(user[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1)
                    done()
                }).catch((e) => done(e))
            })
    })
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', user[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if(err){
                return done(err)
            }

            User.findById(user[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e))
        })
    })
});