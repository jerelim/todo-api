var express = require('express');

var bodyParser = require('body-parser');

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
	var id = parseInt(req.params.id,10);
	var oneItem;
	for (var i = 0; i < todos.length; i++) {
		if (todos[i].id===id) {
			res.json(todos[i]);
			return;
		}
	}
	oneItem = {error:"could not find todo item"};
	
	res.status(404).json(oneItem);
});

// function to save new todo
app.post('/todos',function (req, res) {
	var body = req.body;
	var newtodo = {id:todoNextId ,description:body.description , completed:body.completed};
	todos.push(newtodo);

	res.send(todos);
	todoNextId++;
	console.log(todoNextId);

});

app.listen(PORT,function () {
	console.log('Express listening on port: ' + PORT);
});