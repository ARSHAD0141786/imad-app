console.log('Loaded!');



function counter_inc() {
	//Create a request
	console.log("Counter function invoked");
	var req=new XMLHttpRequest();

	//Capture the response and store it in a variable
	req.onreadystatechange = function()
	{
		if(req.readyState === XMLHttpRequest.DONE){
			//Take some action
			if(req.status === 200){
				var span1=document.getElementById('counter');
				span1.innerHTML=req.responseText;
			}
		}
	};


	//Make a request
	req.open('GET','http://arshadmohammed0141.imad.hasura-app.io/counter_increment',true);
	req.send(null);

	// count = count + 1
	// var counter = document.getElementById('counter');
	// counter.innerHTML = count.toString();
}

function counter_disp() {
	//Create a request
	console.log("Counter display function invoked");
	var req=new XMLHttpRequest();

	//Capture the response and store it in a variable
	req.onreadystatechange = function()
	{
		if(req.readyState === XMLHttpRequest.DONE){
			//Take some action
			if(req.status === 200){
				var span1=document.getElementById('counter');
				span1.innerHTML=req.responseText;
			}
		}
	};
	
	req.open('GET','http://arshadmohammed0141.imad.hasura-app.io/counter_display',true);
	req.send(null);

}


// 	//Make a request
// 	req.open('GET','http://localhost:80/counter_display',true);
// 	req.send(null);

// 	// count = count + 1
// 	// var counter = document.getElementById('counter');
// 	// counter.innerHTML = count.toString();
// }

counter_disp();

var bt=document.getElementById('count');
bt.onclick=function (){
	counter_inc();
};
// submit names by using js no request is sent on the server
/*
var nameInput=document.getElementById('naam');
var names=[];
var sub=document.getElementById('submit');
sub.onclick=function(){
	var list ='';
	names.push(nameInput.value);
	for(var i=0;i<names.length;i++)
	{
		list += '<li>' + names[i] + '</li>';
	}
	var ul=document.getElementById('list');
	ul.innerHTML=list;
}
*/

var submit_bt = document.getElementById('submit_btn');
submit_bt.onclick=function(){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState===XMLHttpRequest.DONE){
            console.log('reasdy state changed.')
            if(req.status===200){
                alert('Successfully Login');
            }else if(req.status===403){
                alert('username/password is incorrect');
            }else if(req.status===500){
                alert('Something went wrong on server');
            }
        }
    };
    
    
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    req.open('POST','http://arshadmohammed0141.imad.hasura-app.io/login',true);
    req.setRequestHeader('Content-Type','application/json');
	req.send(JSON.stringify({username:username,password:password}));
};


var register_bt = document.getElementById('register_btn');
register_bt.onclick=function(){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState===XMLHttpRequest.DONE){
            if(req.status===200){
                alert('User successfully created');
            }else if(req.status===500){
                alert('Something went wrong on server');
            }
        }
    };
    
    
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    req.open('POST','http://arshadmohammed0141.imad.hasura-app.io/create-user',true);
    req.setRequestHeader('Content-Type','application/json');
	req.send(JSON.stringify({username:username,password:password}));
};







var nameInput=document.getElementById('naam');
var submit_button=document.getElementById('submit');

function display_comments(){
		//Create a request
	console.log('comment btn pressed');
	var req=new XMLHttpRequest();

	//Capture the response and store it in a variable
	req.onreadystatechange = function()
	{
		if(req.readyState === XMLHttpRequest.DONE){
			//Take some action
			if(req.status === 200){
				var list ='';
				var names=req.responseText;
				names = JSON.parse(names);
				for(var i=0;i<names.length;i++)
				{
					list += '<li>' + names[i] + '</li>';
				}
				var ul=document.getElementById('list');
				ul.innerHTML=list;
			}
		}
	};


	//Make a request
	req.open('GET','http://arshadmohammed0141.imad.hasura-app.io/submit-name?name=' + nameInput.value,true);
	req.send(null);

	
}
display_comments();
submit_button.onclick=function(){
    display_comments();
};