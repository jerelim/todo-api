var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db= require('./db.js');
var route = require('express/lib/router/route');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('ToDo API root');
});
// GET /todos?completed=true&q=work
app.get('/todos', function (req, res) {
    var queryParams = _.pick(req.query, 'q', 'completed');
    var filteredTodos = todos;
    // if filter completed is provided only looking for completed items
    if ((queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') || (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false')) {
        filteredTodos = _.where(filteredTodos, {
            completed: JSON.parse(queryParams.completed)
        });
    }
    // if filter is set to filter into select task
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (oneItem) {
            return oneItem.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
    res.json(filteredTodos);
});
app.get('/todos/:id', function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    db.todo.findById(todoid).then(function (todo) {
    	
    	if (todo) {
    		res.json(todo.toJSON() );
    	}else{
    		res.status(404).json({error:'data not found'});
    	}
    },function (error) {
    	res.status(500).send();
    });

});
// function to save new todo
app.post('/todos', function (req, res) {
    var body = req.body;
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).json('error');
    }
    body.description = body.description.trim();
    var newtodo = _.pick(body, 'description', 'completed');

    console.log(newtodo);
    db.todo.create(newtodo).then(function (todo) {
		res.json(todo.toJSON() );
    },function (error) {
    	res.status(404).json(error);
    });
});

// function to delete one item
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    if (!matchedTodo) {
        return res.status(400).json('could not find item');
    }
    // remove the item here
    todos = _.without(todos, matchedTodo);
    res.send(todos);
});
// function to edit one item
app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    if (!matchedTodo) {
        return res.status(400).json('could not find item');
    }
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }
    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }
    // replace data here , no need to push to array
    // since object in javascript are pass by reference
    _.extend(matchedTodo, validAttributes);
    res.send(matchedTodo);
});

db.sequelize.sync().then(function () {
	
	app.listen(PORT, function () {
	    console.log('Express listening on port: ' + PORT);
	});	
});
