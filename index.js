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
    var query = _.pick(req.query, 'q', 'completed');
    var where = {};

    // var filteredTodos = todos;
    // if filter completed is provided only looking for completed items
    if ((query.hasOwnProperty('completed') && query.completed === 'true') || (query.hasOwnProperty('completed') && query.completed === 'false')) {
        where.completed= JSON.parse(query.completed );
    }
    // if filter is set to filter into select task
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
        	$like:'%' + query.q +'%'
        };
    }
    db.todo.findAll({where : where}).then(function (todos) {
    	if (todos) {
    		res.json(todos);
    	} else{
    		res.status(404).json({error:'no results found'});
    	}
    },function (error) {
    	res.status(500);
    });
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
    var todoid = parseInt(req.params.id, 10);
   	db.todo.destroy({
   		where:{
   			id:todoid
   		}
   	}).then(function (deleted) {
   		if (deleted) {
   			res.status(204).send();
   		}else{
   			res.status(404).json({error:'could not delete item'});
   		}
   	}).catch(function (error) {
   		res.status(500).json(error);
   	});
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
