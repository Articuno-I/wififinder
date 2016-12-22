var socket = io();

var opponent = {Name:'', FC:''};

//debugging functions
var debugging = true;
function debug(text) {
	if (debugging) {console.log('debug: '+text);}
}

function error(problem) {
	if (!problem) {
		problem = 'An unknown error occurred.';
	}
	var errordiv = document.getElementById('error');
	errordiv.innerHTML = problem;
	errordiv.style.display = 'block';
	console.error(problem);
}

//simple html modification
function xyshow() {
	if (!document.getElementById('sumo').checked) {
		document.getElementById('XYonly').style.display = 'block';
	} else {
		document.getElementById('XYonly').style.display='none';
	}
}

function goto(id) {
	if (id == 'fc2' && document.getElementById('FC-1').value.length === 4) {
		document.getElementById('FC-2').focus();
	} else if (id == 'fc3' && document.getElementById('FC-2').value.length === 4) {
		document.getElementById('FC-3').focus();
	}
}

//handle small screen sizes
document.body.onload = function() {
	var _width = document.body.clientWidth;
	if (_width < 620) {
		document.getElementById('battlefinder').style.width = (_width - 30)+'px';
		var elements = document.getElementsByClassName('widemenu');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.width = (_width/3)+'px';
		}
		elements = document.getElementsByClassName('narrowmenu');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.width = (_width/3)+'px';
		}
		elements = document.getElementsByClassName('menuimg');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.height = (_width/4)+'px';
		}
	/*IDK whether to change element heights or font sizes, will have to test later.*/
	}
}

//communication with server
var name; //global scope so I don't need to ask the server for it later
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
	document.getElementById('name_info').innerHTML = data;//should really update this to use the error div
});
socket.on('nameaccepted', function() {
	debug('name accepted');
	document.getElementById('login').style.display = 'none';
	document.getElementById('login_name').innerHTML = 'You are logged in as <b>'+name+'</b>';
	document.getElementById('login_name').style.display = 'block';
	document.getElementById('initform').style.display = 'block';
	document.getElementById('Requests').style.display = 'block';
});

function _submit() {
	//check user isn't challenging someone (need to implement this serverside as well)
	if (document.getElementById('requesting').innerHTML.indexOf('You are requesting a battle with') != -1) {
		error('Please cancel your challenge before requesting a battle.');
	}
	//step 1: get the data
	var gen = (document.getElementById('sumo').checked) ? 7 : 6; //could probably use a bool but meh
	var xy = (gen === 6 && document.getElementById('XY').checked) ? true : false;
	var hacks = document.getElementById('haxx').checked;
	var fc = document.getElementById('FC-1').value + document.getElementById('FC-2').value + document.getElementById('FC-3').value;
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
	var data = {Gen: gen, FC: fc, Tier: tier, XY: xy, Hacks: hacks};
	//step 2: actually send it
	socket.emit('request', data);
	//step 3, change what's on screen.
	document.getElementById('initform').style.display = 'none';
	var chaldiv = document.getElementById('requesting');
	chaldiv.innerHTML = '<br>You are requesting a Gen '+gen+' '+tier+' battle using your FC '+fc+'. <button id="cancelrequest" onclick="cancelrequest()">Cancel</button>';
	chaldiv.style.display = 'block';
	document.getElementById('challenges').style.display = 'block';
	document.getElementById('error').style.display = 'none';
}
socket.on('request', function(data) {
	if (data[0] == name) { 
		debug('recieved own request');
	} else {
		if (navigator.userAgent.indexOf('MSIE') != -1) {
			//IE compatibility. AFAIK all other browsers display the unicode correctly.
			data[3] = data[3]=='&#x2611' ? 'yes' : 'no';
			data[5] = data[5]=='&#x2611' ? 'yes' : 'no';
		}
		var row = document.getElementById('Requests').insertRow(-1);
		row.id = data[0]+'requesttablerow';
		var cell;
		for (var i = 0; i < 6; i++) {
			cell = row.insertCell(i);
			cell.innerHTML = data[i];
		}
		cell = row.insertCell(6);
		cell.innerHTML = '<button type="button" onclick="challenge(\''+data[0]+'\')">Challenge</button>';
	}
});

function cancelrequest() {
	socket.emit('cancelrequest', '');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('requesting').innerHTML = '<br>';
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
	var fc = document.getElementById('FC-1').value + document.getElementById('FC-2').value + document.getElementById('FC-3').value;
	if (document.getElementById('requesting').innerHTML.indexOf('You are requesting a Gen') != -1) {
		//check they're not currently requesting a battle
		//note: this is also checked serverside
		error('You cannot challenge someone while requesting a battle. Please cancel your request before challenging.');
		return false;
	}
	//should also check they're not challenging someone else
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {
		error('Please enter your Friend Code before challenging.');
		return false;
	}
	socket.emit('challenge', {toChallenge: chalname, FC: fc});
	document.getElementById('requesting').innerHTML = '<br>You are requesting a battle with '+chalname; //should put in a cancel challenge thing here too
	document.getElementById('requesting').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	opponent.Name = chalname;
	opponent.FC = document.getElementById(chalname+'requesttablerow').cells[4].innerHTML;
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
	document.getElementById('opponent_details').innerHTML = 'Your opponent is <b>'+opponent.Name+'</b>. Their Friend Code is <b>'+opponent.FC+'</b>.';
}
socket.on('accept', function() {
	debug('challenge accepted, code past this point not yet finished');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('initform').style.display = 'none';
	document.getElementById('Requests').style.display = 'none';
	//get opponent's name, tier, FC etc. from table (?)
	document.getElementById('chat').style.display = 'block';
	document.getElementById('opponent_details').innerHTML = 'Your opponent is <b>'+opponent.Name+'</b>. Their Friend Code is <b>'+opponent.FC+'</b>.';
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
	var chatdiv = document.getElementById('chatmsg');
	if (chatdiv.value.length) {socket.emit('pm', chatdiv.value);}
	chatdiv.value = '';
}
//Note: all the 'to' and 'from' stuff _needs_ to be dealt with on the server, or I'm just asking for someone to make zarel pm chaos with "im gay lol"
//actually, do I *really* need to deal with it on the server, knowing that?
socket.on('pm', function(data) {
	var messagediv = document.getElementById('messages')
	var notscrolled = messagediv.scrollHeight - messagediv.clientHeight <= messagediv.scrollTop + 1
	var pmclass = (data.indexOf('<b>You:</b>')==0) ? 'ownpm' : 'pm';
	messagediv.innerHTML += '<p class='+pmclass+'>'+data+'</p>';
	//code for scrolling to bottom was shamelessly stolen from stackoverflow user: dotnetCarpenter
	if (notscrolled) {
		messagediv.scrollTop = messagediv.scrollHeight - messagediv.clientHeight;
	}
});

function reset() {
	debug('reset window');
	document.getElementById('initform').style.display = 'block';
	document.getElementById('Requests').style.display = 'block';
	document.getElementById('chatbutton').style.display = 'block';
	document.getElementById('chat').style.display = 'none';
	document.getElementById('endbutton').innerHTML = '<button type="button" id="finished" onclick="endgame()">End game room</button>'
	document.getElementById('messages').innerHTML = '';
	document.getElementById('requesting').innerHTML = '<br>';
	xyshow();
}

function endgame() {
	debug('Ended game');
	socket.emit('endgame','');
	reset();
}

socket.on('endgame', function(data) {
	debug('Game was ended by opponent');
	document.getElementById('chatbutton').style.display = 'none';
	if (data == 'dc') {
		document.getElementById('endbutton').innerHTML = 'Your opponent has disconnected. <button onclick="reset()">Find another battle</button>';
	} else {
		document.getElementById('endbutton').innerHTML = 'Your opponent has ended the game. <button onclick="reset()">Find another battle</button>';
	}
});

socket.on('shutdown', function() {
	debug('Server has shut down.')
	socket = false;
	if (confirm('The server has shut down or restarted. Refresh the page?')) {
		location.reload();
	} else {
		error('The server has shut down.');
	}
});

socket.on('Error', function(data) {
	if (typeof data === 'string') {console.error(data);}
	else {console.error('Unknown error from server.');}
	//probably make this display somewhere in the HTML too, idk
});
