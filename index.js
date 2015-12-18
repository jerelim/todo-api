var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db= require('./db.js');
var route = require('express/lib/router/route');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('ToDo API root');
});
// GET /todos?completed=true&q=work
app.get('/todos',middleware.requireAuthentication , function (req, res) {
    var query = _.pick(req.query, 'q', 'completed');
    var where = {userId: req.user.id};

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
app.get('/todos/:id',middleware.requireAuthentication, function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    var where = { id: todoid , userId:req.user.id };
    db.todo.findOne({where:where}).then(function (todo) {
        // if no rows were return or the user id is not the same as the one in the todo
    	if (!todo ) {
            res.status(404).json({error:'data not found'});
        }else{
    		res.json(todo.toJSON() );
    	}
    },function (error) {
    	res.status(500).send();
    });

});
// function to save new todo
app.post('/todos',middleware.requireAuthentication, function (req, res) {
    var body = req.body;
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).json('error');
    }
    body.description = body.description.trim();
    var newtodo = _.pick(body, 'description', 'completed');

    db.todo.create(newtodo).then(function (todo) {
        req.user.addTodo(todo).then(function () {
            return todo.reload();        
        }).then(function (todo) {
            res.json(todo.toJSON() );
        });
    },function (error) {
    	res.status(404).json(error);
    });
});

// function to delete one item
app.delete('/todos/:id',middleware.requireAuthentication, function (req, res) {
    var todoid = parseInt(req.params.id, 10);
   	db.todo.destroy({
   		where:{
   			id:todoid,
            userId:req.user.id
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
app.put('/todos/:id',middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    var todoid = parseInt(req.params.id, 10);
    
    if (body.hasOwnProperty('completed') ) {
        attributes.completed = body.completed;
    }
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    var where = { id: todoid , userId:req.user.id };
    db.todo.findOne({where: where}).then(function (todo) {
        if (!todo || todo.userId !== req.user.id ) {
            res.status(404).json({error:'data not found'});
        }else{
            return todo.update(attributes);
        }
    },function (error) {
    	res.status(500).send();
    }).then(function (todo) {
    	res.json(todo.toJSON());
    },function (error) {
    	res.status(400).json(error);
    });
});

app.post('/users',function (req, res) {
    var body = req.body;
    if ( !_.isString(body.email) || body.email.trim().length === 0 || !_.isString(body.password) || body.password.trim().length === 0) {
        return res.status(400).json('error');
    }
    body.email = body.email.trim();
    body.password = body.password.trim();
    var newMember = _.pick(body, 'email', 'password');

    db.user.create(newMember).then(function (user) {
        res.json(user.toPublicJSON() );
    },function (error) {
        res.status(404).json(error);
    });
});

app.post('/users/login',function (req,res) {
    var body = req.body;
    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');
        if (token) {
            return res.header('Auth', token ).json(user.toPublicJSON());
        }
        res.status(401).send();
    },function (error) {
        res.status(401).send();
    });
});

db.sequelize.sync({force:true}).then(function () {
	
	app.listen(PORT, function () {
	    console.log('Express listening on port: ' + PORT);
	});	
});
