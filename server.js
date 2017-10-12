var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var config={
  user:'arshadmohammed0141',
  database:'arshadmohammed0141',
  host:'db.imad.hasura-app.io',
  port:'5432',
  password:process.env.DB_PASSWORD
};
var pool = new Pool(config);

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

function hash(input,salt){
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.post('/create-user',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "user123" (username,password_string) VALUES ($1,$2)',[username,dbString],function(err,result){
        if(err){
            res.status(500).send(err.toString() + 'Server problem kar raha hai');
        }else{
            res.send('User succcessfully created : '+username);
        }
    });
});

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT *FROM "user123" WHERE username = $1',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString()+'server ProBlem');
        }else{
            if(result.rows.length===0){
                res.status(403).send('username/password is invalid');
            }else{
                //match password
                console.log('username found but password cannot be fetched.');
                var dbString=result.rows[0].password;
                var salt=dbString.split('$')[2];
                var hashedPass=hash(password,salt);
                if(hashedPass===dbString){
                    res.send('Credentials correct');
                }else{
                    res.status(403).send('username/password');
                }
            }
        }
    });
});



app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

app.get('/ui/main.js',function(req,res){
    res.sendFile(path.join(__dirname,'ui','main.js'));
});
app.get('/ui/profile.css',function(req,res){
    res.sendFile(path.join(__dirname,'ui','profile.css'));
});

app.get('/ui/profile.html',function(req,res){
    res.sendFile(path.join(__dirname,'ui','profile.html'));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
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

app.get('/test-db',function(req,res){
    //make a select request
    //retrun a response with the results
    pool.query('SELECT * FROM user123;',function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send(JSON.stringify(result.rows));
        }
    });
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
  console.log(`IMAD course app listening on port ${port}!`);
});
