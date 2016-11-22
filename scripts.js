var socket = io();

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
function _sendname() {
	debug('sending name');
	name = document.getElementById('name').value;
	var info = document.getElementById('name_info');
	if (!name.length) {
		debug('name not found');
		info.innerHTML = 'Please input a name.'; //probably be better to just make it a variable but meh.
		info.style.display = 'block';
		return false;
	}
	socket.emit('name',name);
	info.innerHTML = 'Sending...';
	info.style.display = 'block';
}
socket.on('nametaken', function() {
	debug('name unavailable');
	document.getElementById('name_info').innerHTML = 'Sorry, that name was taken. Please try another one.';
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
	//need to make sure people can't challenge while requesting, this needs to be done both clientside and serverside
	document.getElementById('initform').style.display = 'none';
	var chaldiv = document.getElementById('requesting');
	chaldiv.innerHTML = 'You are requesting a Gen '+gen+' '+tier+' battle using your FC '+fc+'. <button id="cancelrequest" onclick="cancelrequest()">Cancel</button>';
	chaldiv.style.display = 'block';
}
socket.on('request', function(data) {
	var reqtable = document.getElementById('reqbody');
	if (data.indexOf(name) == 8) { 
		debug('recieved own request');
	} else {
		reqtable.innerHTML += data;
	}
});
socket.on('cancelrequest', function(data) {
	document.getElementById(data+'requesttablerow').outerHTML=''; //will this work if that request isn't found (e.g. if it's your own request)? Need to test this.
//Will also need to make sure apostraphes and quotation marks are escaped from names, as well as html tags.
});

function cancelrequest() {
	socket.emit('cancelrequest', '');
	document.getElementById('requesting').style.display = 'none';
	document.getElementById('initform').style.display = 'block';
}

function challenge(chalname) {
	var fc = document.getElementById('FC').value;
	if (!(fc.length == 12 && fc == fc.match(/^[0-9]+$/))) {
		return false; //insert stuff to explain why you can't challenge without a fc yada yada
	}
	//may include stuff to prevent challenging while requesting here, definitely need that code server-side though.
	socket.emit('challenge', fc);
}

function chat() {
	socket.emit('pm', document.getElementById('chatmsg').value);
	document.getElementById('chatmsg').value = '';
}
//Note: all the 'to' and 'from' stuff _needs_ to be dealt with on the server, or I'm just asking for someone to make zarel pm chaos with "im gay lol"
//actually, do I *really* need to deal with it on the server, knowing that?
socket.on('pm', function(data) {
	document.getElementById('messages').innerHTML += data; //data needs to be manipulated on server but IDK if I need to on clientside as well
});
