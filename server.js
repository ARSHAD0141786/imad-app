var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


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
app.use(session({
    secret:'someRandomeString',
    cookie:{maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

function hash(input,salt){
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.post('/create-user-for-my-app',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var year = req.body.year;
    var hostel = req.body.hostel_number;
    var phone = req.body.phone;
    var branch = req.body.branch;
    
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "user_data" (username,password_string,name,hostel,branch,year,phone_number) VALUES ($1,$2,$3,$4,$5,$6,$7)',[username,dbString,name,hostel,branch,year,phone],function(err,result){
        if(err){
            res.status(500).send(err.toString() + 'Server problem kar raha hai');
        }else{
            res.send(JSON.stringify({message:"User created successfully : "+username}));
        }
    });
});

app.post('/update-user-details',function(req,res){
    var username = req.body.username;
    var phone_number = req.body.phone;
    var year = req.body.year;
    var hostel = req.body.hostel_number;
    var branch = req.body.branch;
    
    console.log("username : "+username+" year : "+year+" hostel : "+hostel+" branch : "+branch);
    
    pool.query('UPDATE user_data SET year = $1 , phone_number = $2 , hostel = $3 , branch = $4 WHERE username = $5',[year,phone_number,hostel,branch,username],function(err,result){
        if(err){
            res.status(500).send(err.toString()+' Data not updated');
        }else{
            res.send(JSON.stringify({message:"Updated successfully"}));
        }
    });
});

app.post('/login-for-my-app',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT *FROM user_data,branch,hostel WHERE username = $1 AND user_data.hostel = hostel.hostel_id AND user_data.branch= branch.branch_id',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows.length===0){
                res.status(403).send('No user found');
            }else{
                //match password
                var dbString=result.rows[0].password_string;
                var salt=dbString.split('$')[2];
                var hashedPass=hash(password,salt);
                if(hashedPass===dbString){
                    res.send(JSON.stringify(result.rows[0]));
                }else{
                    res.status(403).send('Incorrect Password');
                }
            }
        }
    });
});

app.get('/get-mess-list-for-my-app',function(req,res){
    
   pool.query('SELECT hostel.hostel_name,mess_data.*,mess_status.status_name,rating.* FROM hostel,mess_data,mess_status,rating WHERE hostel.hostel_id = mess_data.hostel and mess_data.status = mess_status.status_code and mess_data.hostel = rating.hostel ORDER BY mess_status.status_code desc ,mess_data.is_menu_updated desc, rating.food_rating desc',function(err,result){
           if(err){
               res.status(500).send(err.toString());
           } else{
               res.send(JSON.stringify(result.rows));
           }
        });
});

app.post('/get-mess-data-for-my-app',function(req,res){
    var hostel = req.body.hostel;
    console.log('hostel : '+hostel);
    
    pool.query('SELECT *FROM mess_data WHERE hostel = $1',[hostel],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows.length === 0){
                res.status(403).send('No data found');
            }else{
                res.send(JSON.stringify(result.rows[0]));
            }
        }
    });
});

app.get('/get-mess-ratings',function(req,res){
    pool.query('SELECT hostel.hostel_name,rating.* FROM hostel,rating WHERE hostel.hostel_id = rating.hostel',function(err,result){
        if(err){
           res.status(500).send(err.toString());
        } else{
           res.send(JSON.stringify(result.rows));
        }
    });
    
});


app.post('/create-worker-for-my-app',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var hostel = req.body.hostel;
    var phone = req.body.phone;
    
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "worker_data" (username,password_string,name,hostel,phone) VALUES ($1,$2,$3,$4,$5)',[username,dbString,name,hostel,phone],function(err,result){
        if(err){
            res.status(500).send(err.toString() + 'Server problem in inserting data');
        }else{
            res.send(JSON.stringify({message:"User created successfully : "+username}));
        }
    });
});

app.post('/worker-login-for-my-app',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT *FROM worker_data,hostel WHERE username = $1 AND worker_data.hostel = hostel.hostel_id',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows.length===0){
                res.status(403).send('No user found');
            }else{
                //match password
                var dbString=result.rows[0].password_string;
                var salt=dbString.split('$')[2];
                var hashedPass=hash(password,salt);
                if(hashedPass===dbString){
                    res.send(JSON.stringify(result.rows[0]));
                }else{
                    res.status(403).send('Incorrect Password');
                }
            }
        }
    });
});

var cur_on = 2;
var cur_off = 1;
var temp_off = 0;
    
app.post('/send-feedback-for-messes',function(req,res){
    var foodRating = req.body.food_rating;
    var cleaningRating = req.body.cleaning_rating;
    var hostelId = req.body.hostelId;
    var username = req.body.username;
    
    pool.query("SELECT *FROM mess_data WHERE hostel = $1",[hostelId],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows[0].status == cur_on ){
                pool.query('SELECT *FROM user_data WHERE username = $1',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString);
        }else{
            if(!result.rows[0].is_rated){
                pool.query('SELECT *FROM rating WHERE hostel=$1',[hostelId],function(err,result){
                    if(err){
                        res.status(500).send(err.toString);
                    }else{
                        var ratingFood = result.rows[0].food_rating;
                        var ratingCleaning = result.rows[0].cleaning_rating;
                        var users = result.rows[0].users;
                        
                        var updatedRatingFood = (ratingFood * users + foodRating)/(users + 1);
                        var updatedRatingCleaning = (ratingCleaning * users + cleaningRating)/(users + 1);
                        var updatedUsers = users+1;
                        pool.query('UPDATE rating SET food_rating = $1,cleaning_rating = $2,users = $3 WHERE hostel = $4',[updatedRatingFood,updatedRatingCleaning,updatedUsers,hostelId],function(err,result){
                            if(err){
                                res.status(500).send(err.toString());
                            }else{
                                pool.query('UPDATE user_data SET is_rated = true WHERE username = $1',[username],function(err,result){
                                    if(err){
                                        res.status(500).send(err.toString());
                                    }else{
                                        res.send(JSON.stringify({message:"Thankyou for the feedback"}));
                                    }
                                });
                    }
                    });
                    }
                });
            }else{
                res.status(500).send("You have already rated a mess");
            }
        }
    });
            }else{
                res.send(JSON.stringify({message:"This is currently OFF\nPlease refresh the mess list first"}));
            }         
        }
    });  
    
});

// Allow insertion only when the user is logined check the session in case of browser

app.post('/upload-data-on-my-app',function(req,res){
    var items = req.body.items;
    var status = req.body.status;
    var isMenuUpdated = req.body.is_menu_updated;
    var hostel = req.body.hostel;
    
    pool.query('SELECT status FROM mess_data WHERE ',function(err,result){
       if(err){
             res.status(500).send(err.toString() + 'Server problem in inserting data');
       }else{
           if(status == cur_on){
               // for more precesion and for more consistency both below queries should be execute at the same time use stored procedures
               pool.query("UPDATE user_data SET is_rated = 'f' ",function(err,result){
                   if(err){
                       res.status(500).send(err.toString() + 'Server problem in inserting data');
                   }
               });
               pool.query("UPDATE rating SET food_rating = 0 , cleaning_rating = 0 , users = 0 WHERE hostel = $1",[hostel],function(err,result){
                   if(err){
                       res.status(500).send(err.toString() + 'Server problem in inserting data');
                   }
               });
           }
           else if(status == cur_off){
               
           }
           pool.query('UPDATE mess_data SET is_menu_updated = $1 , items = $2 , status = $3 WHERE hostel = $4',[isMenuUpdated,items,status,hostel],function(err,result){
               if(err){
                    res.status(500).send(err.toString() + 'Server problem in inserting data');
                }else{
                    res.send(JSON.stringify({message:"Data Uploaded successfully"}));
                }
            });
         }  
    });
});

app.get('/get-mess-rating-for-my-app',function(req,res){
       
       pool.query('SELECT food_rating,cleaning_rating,hostel.name FROM rating,hostel WHERE hostel.hostel_id=rating.hostel ',function(err,result){
           if(err){
               res.status(500).send(err.toString());
           } else{
               res.send(JSON.stringify(result.rows));
           }
        });
});

app.post('/create-user',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "user123" (username,password_string) VALUES ($1,$2)',[username,dbString],function(err,result){
        if(err){
            res.status(500).send(err.toString() + 'Server problem kar raha hai');
        }else{
            res.send(JSON.stringify({message:"User created successfully : "+username}));
        }
    });
});

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT *FROM user123 WHERE username = $1',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows.length===0){
                res.status(403).send('username is invalid');
            }else{
                //match password
                var dbString=result.rows[0].password_string;
                var salt=dbString.split('$')[2];
                var hashedPass=hash(password,salt);
                if(hashedPass===dbString){
                    //make session
                    req.session.auth = {userId : result.rows[0].username};
                    //set cookie with a session internally on the server side it maps the session id 
                    //to an object {auth:{userId}}
                    
                    res.send(JSON.stringify( {message:"SignIn successfully"} ));
                }else{
                    res.status(403).send('username is found but password not matched.');
                }
            }
        }
    });
});


app.get('/check-login',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        res.send('You are logged in  : ' + req.session.auth.userId.toString());
    }else{
        res.send('You are not logged in : ');
    }
});

app.get('/logout',function(req,res){
   delete req.session.auth;
   res.send('Logged Out.');
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
