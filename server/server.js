const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos})
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    //Valid id using isvalid
    if(!ObjectID.isValid(id)){
        console.log('ID not valid')
        res.status(404).send()
    }

    //find by id 
    Todo.findById(id).then((todo) =>{
        if(!todo){
            res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
        // success
            // if todo - send it back
            //if no todo - send back 400 with empty body
        //error
            //400 - nothing emtpy body
    
})

app.listen(3000, () => {
    console.log('Started on port 3000');
});


module.exports = {app}