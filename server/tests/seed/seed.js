const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken')

const {Todo} = require('./../../models/todo')
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const user = [{
    _id: userOneId,
    email: 'stupop010@hotmail.co.uk',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'stupop@hotmail.co.uk',
    password: "userTwoPass"
}]

const todos = [{
    _id: new ObjectID(),
    text: 'Frist test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedA: 333
}]

// clear all the todo before testing
const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) =>{
    User.remove({}).then(() => {
        var userOne = new User(user[0]).save();
        var userTwo = new User(user[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
}
module.exports = {todos, populateTodos, user, populateUsers}