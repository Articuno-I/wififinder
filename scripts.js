var socket = io();

var opponent = {Name:'', FC:''};

var debugging = true;
function debug(text) {
	if (debugging) {console.log('debug: '+text);}
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
function _sendname() {
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
	var info = true;
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {info = false;}
	if (!tier.length) {info = false;}
	if (!info) {
		document.getElementById('error').style.display = 'block';
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
}
socket.on('request', function(data) {
	var reqtable = document.getElementById('reqbody');
	if (data.indexOf(name) == 8) { 
		debug('recieved own request');
	} else {
		reqtable.innerHTML += data;
	}
});

function cancelrequest() {
	socket.emit('cancelrequest', '');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('initform').style.display = 'block';
}
socket.on('cancelrequest', function(data) {
	if (data != name) {
		document.getElementById(data+'requesttablerow').outerHTML=''; //will this work if that request isn't found (e.g. if it's your own request)? Need to test this.
//Will also need to make sure apostraphes and quotation marks are escaped from names, as well as html tags.
	}
});

function challenge(chalname) {
	var fc = document.getElementById('FC').value;
	var chaldiv = document.getElementById('requesting');
	if (chaldiv.innerHTML.indexOf('You are requesting a Gen') != -1) {
		//check they're not currently requesting a battle
		//note: also need to check they aren't requesting a battle serverside (already implemented)
		chaldiv.innerHTML += '<br>You cannot challenge someone while requesting a battle. Please cancel your request before challenging.';
		//potential problem: Could lead to this message occurring multiple times if they try to challenge multiple people. Could make sure the message isn't already there? IDK
		//could just have a global bool for whether they're challenging or not, but meh
		return false;
	}
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {
		chaldiv.innerHTML = 'Please enter your Friend Code before challenging.';
		chaldiv.style.display = 'block';
		return false;
	}
	socket.emit('challenge', {toChallenge: chalname, FC: fc});
	document.getElementById('requesting').innerHTML = 'You are requesting a battle with '+chalname; //should put in a cancel challenge thing here too
	document.getElementById('requesting').style.display = 'block';
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
//change html stuff (only slightly done)
	document.getElementById('challenges').innerHTML = '<p>Waiting for challenges...</p>';
	document.getElementById('challenges').style.display = 'none';
	challenges = [];
	document.getElementById('chat').style.display = 'block';
}
socket.on('accept', function() {
	debug('challenge accepted, code past this point not yet finished');
	document.getElementById('requesting').style.display = 'none';
	//do stuff
/*
Step 1: get opponent's name, tier, FC etc. from table (?)
Step 2: clear all this stuff and show battle div, with all that info put in
IDK what else needs to be done
*/
	document.getElementById('chat').style.display = 'block';
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
	document.getElementById('messages').innerHTML += '<p>'+data+'</p>'; //data needs to be manipulated on server but IDK if I need to on clientside as well
});

socket.on('Error', function(data) {
	if (typeof data === 'string') {console.error(data);}
	else {console.error('Unknown error from server.');}
	//probably make this display somewhere in the HTML too, idk
});
