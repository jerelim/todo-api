var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id:1,
	description:"Meet guys for dinner",
	completed:false
},{
	id:2,
	description:"go buy mop pole",
	completed:false
},{
	id:3,
	description: "Contact Kelvin",
	completed:true
}];

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

app.listen(PORT,function () {
	console.log('Express listening on port: ' + PORT);
});