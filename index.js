var express = require('express');

var bodyParser = require('body-parser');
var _=require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId=1;

app.use(bodyParser.json());

app.get('/',function (req , res) {
	res.send('ToDo API root');
});

app.get('/todos',function (req, res) {
	var queryParams = _.pick(req.query,'description', 'completed');
	var filteredTodos = todos ;

	// if filter only looking for completed items
	if ((queryParams.hasOwnProperty('completed') && queryParams.completed=== 'true') || (queryParams.hasOwnProperty('completed') && queryParams.completed=== 'false') ) {
		filteredTodos = _.where(filteredTodos, {completed: JSON.parse(queryParams.completed) } );
	}

	res.json(filteredTodos);
});

app.get('/todos/:id',function (req, res) {
	var todoid = parseInt(req.params.id,10);
	var oneItem=_.findWhere(todos, {id:todoid});

	if (oneItem) {
		res.json(oneItem);
	} else{
		res.status(404).json('item not found');
	}
	
});

// function to save new todo
app.post('/todos',function (req, res) {
	
	var body = req.body;
	if (! _.isBoolean(body.completed) || ! _.isString(body.description) || body.description.trim().length===0 ) {
		return res.status(400).json('error');
	}
	body.description= body.description.trim();
	// var newtodo = {id:todoNextId ,description:body.description , completed:body.completed};
	var newtodo= _.pick(body,'description', 'completed');

	newtodo.id= todoNextId;
	todos.push(newtodo);

	res.send(newtodo);
	todoNextId++;
	console.log(todoNextId);
	
});

// function to delete one item
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id,10);
	var matchedTodo=_.findWhere(todos, {id:todoId});
	if (!matchedTodo) {
		return res.status(400).json('could not find item');
	}
	// remove the item here
	todos = _.without(todos , matchedTodo);
	res.send(todos);
});

// function to edit one item
app.put('/todos/:id',function (req ,res) {
	var body = _.pick(req.body,'description', 'completed');
	var validAttributes = {};
	var todoId = parseInt(req.params.id,10);	
	var matchedTodo=_.findWhere(todos, {id:todoId});
	if (!matchedTodo) {
		return res.status(400).json('could not find item');
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){
		return  res.status(400).send();
	}

	if (body.hasOwnProperty('description') &&  _.isString(body.description) && body.description.trim().length>0) {
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')) {
		return  res.status(400).send();
	}
	
	// replace data here , no need to push to array
	// since object in javascript are pass by reference
	_.extend(matchedTodo,validAttributes) ;
	res.send(matchedTodo);
});

app.listen(PORT,function () {
	console.log('Express listening on port: ' + PORT);
});