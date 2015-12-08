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
	res.json(todos);
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
	try{
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
	}catch(error){
		return res.status(400).json('Not valid JSON');
	}
});

app.listen(PORT,function () {
	console.log('Express listening on port: ' + PORT);
});