var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/article-one',function(req,res){
	res.send('Article one');
});

app.get('/ui/profile.html',function(req,res){
	res.sendFile(path.join(__dirname, 'ui', 'profile.html'));
});

app.get('/article-three',function(req,res){
	res.sendFile(path.join(__dirname,'ui','as.txt'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/profile.css',function(req,res){
	res.sendFile(path.join(__dirname,'ui','profile.css'));
});

var counter=0;
app.get('/counter_display',function(req,res){
	res.send(counter.toString());
});

app.get('/counter_increment',function(req,res){
	counter=counter+1;
	console.log('counter incremented');
	res.send(counter.toString());
});

var names=[];
app.get('/submit-name',function(req,res){
	//get the name form request
	var name=req.query.name;
	names.push(name);
	//JSON : Javascript Object Notation
	res.send(JSON.stringify(names));
});

app.get('/ui/main.js',function(req,res){
	res.sendFile(path.join(__dirname,'ui','main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/mypic.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'mypic.jpg'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`Hello! IMAD course app listening on port ${port}!`);
});
