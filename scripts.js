var socket = io();

var opponent = {Name:'', FC:''};

var debugging = true;
function debug(text) {
	if (debugging) {console.log('debug: '+text);}
}

function error(problem=false) {
	if (!problem) {
		problem = 'An unknown error occurred.';
	}
	var errordiv = document.getElementById('error');
	errordiv.innerHTML = problem;
	errordiv.style.display = 'block';
}

function xyshow() {
//will probably remove this, all the "xy only" stuff could just be dealt with in the tier section
	if (!document.getElementById("sumo").checked) {
		document.getElementById("XYonly").style.display = "block";
	} else {
		document.getElementById("XYonly").style.display="none";
	}
}

var name; //global scope so I don't need to ask the server for it later maybe
//IDK if I ever actually use this lol
function sendname() {
	debug('sending name');
	name = document.getElementById('name').value;
	var info = document.getElementById('name_info');
	if (!name.length) {
		debug('name not found');
		info.innerHTML = 'Please input a name.'; 
		info.style.display = 'block';
		return false;
	}
	socket.emit('name',name);
	info.innerHTML = 'Sending...';
	info.style.display = 'block';
}
socket.on('namenotaccepted', function(data) {
	debug("name wasn't accepted");
	document.getElementById('name_info').innerHTML = data;
});
socket.on('nameaccepted', function() {
	debug('name accepted');
	document.getElementById('login').style.display = 'none';
	document.getElementById('login_name').innerHTML = 'You are logged in as '+name;
	document.getElementById('login_name').style.display = 'block';
	document.getElementById('initform').style.display = 'block';
	document.getElementById('Requests').style.display = 'block';
});

function _submit() {
	//check user isn't challenging someone (need to implement this serverside as well)
	if (document.getElementById('requesting').innerHTML.indexOf('You are requesting a battle with') != -1) {
		document.getElementById('requesting').innerHTML += '<br>Please cancel your challenge before requesting a battle.'; //really need to sort out an error message thing properly.
	}
	//step 1: get the data
	var gen; if (document.getElementById('sumo').checked) {gen = 7;} else {gen = 6;} //could probably use a bool but meh
	var xy; if (gen === 6 && document.getElementById('XY').checked) {xy = true;} else {xy = false;}
	var fc = document.getElementById('FC').value;
	var tier = document.getElementById('tier').value;
	//step 1.5: make sure all the data's there
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {
		error('Please input a valid Friend Code.');
		return false;
	}
	if (!tier.length) {
		error('Please enter a tier.');
		return false;
	}
	var data = {Gen: gen, FC: fc, Tier: tier, XY: xy};
	//step 2: actually send it
	socket.emit('request', data);
	//step 3, change what's on screen.
	document.getElementById('initform').style.display = 'none';
	var chaldiv = document.getElementById('requesting');
	chaldiv.innerHTML = 'You are requesting a Gen '+gen+' '+tier+' battle using your FC '+fc+'. <button id="cancelrequest" onclick="cancelrequest()">Cancel</button>';
	chaldiv.style.display = 'block';
	document.getElementById('challenges').style.display = 'block';
	document.getElementById('error').style.display = 'none';
}
socket.on('request', function(data) {
	if (data[0] == name) { 
		debug('recieved own request');
	} else {
		var row = document.getElementById('Requests').insertRow(-1);
		row.id = data[0]+'requesttablerow';
		var cell;
		for (var i = 0; i < 5; i++) {
			cell = row.insertCell(i);
			cell.innerHTML = data[i];
		}
		cell = row.insertCell(5);
		cell.innerHTML = '<button type="button" onclick="challenge(\''+data[0]+'\')">Challenge</button>';
	}
});

function cancelrequest() {
	socket.emit('cancelrequest', '');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('requesting').innerHTML = '';
	document.getElementById('challenges').style.display = 'none';
	document.getElementById('initform').style.display = 'block';
}
socket.on('cancelrequest', function(data) {
	if (data != name) {
		document.getElementById('Requests').deleteRow(document.getElementById(data+'requesttablerow').rowIndex);
//Will also need to make sure apostraphes and quotation marks are escaped from names, as well as html tags.
	}
});

function challenge(chalname) {
	var fc = document.getElementById('FC').value;
	if (document.getElementById('requesting').innerHTML.indexOf('You are requesting a Gen') != -1) {
		//check they're not currently requesting a battle
		//note: this is also checked serverside
		error('You cannot challenge someone while requesting a battle. Please cancel your request before challenging.');
		return false;
	}
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {
		error('Please enter your Friend Code before challenging.');
		return false;
	}
	socket.emit('challenge', {toChallenge: chalname, FC: fc});
	document.getElementById('requesting').innerHTML = 'You are requesting a battle with '+chalname; //should put in a cancel challenge thing here too
	document.getElementById('requesting').style.display = 'block';
	document.getElementById('error').style.display = 'none';
}
var challenges = []; //code from here's less tested than is perhaps optimal (read: I'm 103% sure it doesn't work), need to look at it and possibly redesign
socket.on('challenge', function(data) {
	debug('received challenge');
	challenges.push({challenger:data.user, FC:data.FC});
	document.getElementById('challenges').innerHTML += '<p id="'+data.user+'challengerequest">'+data.user+' is challenging you! <button onclick="accept('+"'"+data.user+"'"+')">Accept</button><button onclick="decline('+"'"+data.user+"'"+')">Decline</button></p>';
});

function accept(chalname) {
	debug('accepting');
	socket.emit('accept','');
	opponent.Name = chalname;
	for (var i = 0; i < challenges.length; i++) {
		if (challenges[i].challenger === chalname) {
			opponent.FC = challenges[i].FC;
			challenges.splice(i,1);
		}
	}
	while (challenges.length) {
		decline(challenges[0].challenger);
	}
//change html stuff
	document.getElementById('challenges').innerHTML = '<p>Waiting for challenges...</p>';
	document.getElementById('challenges').style.display = 'none';
	document.getElementById('Requests').style.display = 'none';
	document.getElementById('requesting').style.display = 'none';
	challenges = [];
	document.getElementById('chat').style.display = 'block';
	document.getElementById('opponent_details').innerHTML = 'Your opponent is '+opponent.Name+'. Their Friend Code is '+opponent.FC+'.';
}
socket.on('accept', function() {
	debug('challenge accepted, code past this point not yet finished');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('initform').style.display = 'none';
	document.getElementById('Requests').style.display = 'none';
	//get opponent's name, tier, FC etc. from table (?)
	document.getElementById('chat').style.display = 'block';
	document.getElementById('opponent_details').innerHTML = 'Your opponent\'s details will show here (when I\'ve coded that in)';
});

function decline(chalname) {
	debug('declining');
	socket.emit('decline','');
	for (var i = 0; i < challenges.length; i++) {
		if (challenges[i].challenger === chalname) {challenges.splice(i,1);}
	}
	document.getElementById(chalname+'challengerequest').outerHTML = '';
}
socket.on('decline', function() {
	debug('challenge declined');
	document.getElementById('requesting').style.display = 'none';
	//get rid of any code I put in to stop challenging multiple people, that's not done yet tho
});

function chat() {
	socket.emit('pm', document.getElementById('chatmsg').value);
	document.getElementById('chatmsg').value = '';
}
//Note: all the 'to' and 'from' stuff _needs_ to be dealt with on the server, or I'm just asking for someone to make zarel pm chaos with "im gay lol"
//actually, do I *really* need to deal with it on the server, knowing that?
socket.on('pm', function(data) {
	document.getElementById('messages').innerHTML += '<p class="pm">'+data+'</p>'; //data needs to be manipulated on server but IDK if I need to on clientside as well
});

function reset() {
	document.getElementById('initform').style.display = 'block';
	document.getElementById('Requests').style.display = 'block';
	document.getElementById('chat').style.display = 'none';
	document.getElementById('messages').innerHTML = '';
}

socket.on('dc', function() {
	debug('Opponent has DC\'d');
	document.getElementById('chatbutton').innerHTML = 'Your opponent has disconnected. <button onclick="reset()">Find another battle</button>';
});

socket.on('Error', function(data) {
	if (typeof data === 'string') {console.error(data);}
	else {console.error('Unknown error from server.');}
	//probably make this display somewhere in the HTML too, idk
});
