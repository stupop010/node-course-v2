const {ObjectID} = require('mongdb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/tudo');
const {User} = require('./../server/models/user');

Todo.remove({}).then((result) => {
    console.log(result)
});

Todo.findOneAndRemove({_id:'5ba3627079bf3917378502f1'}).then((todo) => {
    console.log(todo);
});

Todo.fineByIdAndRemove('5ba3627079bf3917378502f1').then((todo) => {
    console.log(todo);
});