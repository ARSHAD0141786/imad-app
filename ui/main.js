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
	}


	//Make a request
	req.open('GET','http://localhost:80/counter_increment',true);
	req.send(null);

	// count = count + 1
	// var counter = document.getElementById('counter');
	// counter.innerHTML = count.toString();
}

function counter_disp() {
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
	}


	//Make a request
	req.open('GET','http://localhost:80/counter_display',true);
	req.send(null);

	// count = count + 1
	// var counter = document.getElementById('counter');
	// counter.innerHTML = count.toString();
}

counter_disp();

var bt=document.getElementById('count');
bt.onclick=function (){
	counter_inc();
}
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

var nameInput=document.getElementById('naam');
var sub=document.getElementById('submit');
sub.onclick=function(){
		//Create a request
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
	}


	//Make a request
	req.open('GET','http://localhost:80/submit-name?name=' + nameInput.value,true);
	req.send(null);

	
}
