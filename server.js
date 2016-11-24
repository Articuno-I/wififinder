//import modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//define global variables
var connections = [];
var battlerequests = [];
var games = [];

//functions to go with global variables
function getName(socket) {
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].Socket === socket) {return connections[i].Name;}
	} return false;
}

function getSocket(name) {
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].Name == name) {return connections[i].Socket;}
	} return false;
}

function getRequest(socket) {
	for (var i = 0; i < battlerequests.length; i++) {
		if (battlerequests[i].requester == socket) {return battlerequests[i];}
	} return false;
}

//debugging code
var debugging = true;
function debug(text) {
	if (debugging) {console.log('debug: '+text);}
}

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client.html');
});

app.get('/scripts.js', function(req,res) {
	res.sendFile(__dirname + '/scripts.js');
});

app.get('/styles.css', function(req,res) {
	res.sendFile(__dirname + '/styles.css');
});

io.on('connection', function(socket) {
	for (var i = 0; i < battlerequests.length; i++) {
		socket.emit('request',battlerequests[i].request);
	}
	socket.on('name', function(data) {
		debug('recieved name');
		var taken = false;
		var usedsocket = false;
		for (var i = 0; i < connections.length; i++) {
			if (data == connections[i].Name) {taken = true;}
			if (socket == connections[i].Socket) {usedsocket = true;}
		}
		if (taken) {
			socket.emit('namenotaccept','Sorry, that name was taken. Please try another one.');
			return false;
		}
		if (usedSocket) {
			socket.emit('Error','This socket is already connected.');
			debug("socket was already connected so couldn't choose name");
			return false;
		}
		if (! /^[a-zA-Z0-9_ .,]+$/.test(data)) {
			socket.emit('namenotaccept','Please only use alphanumeric characters, spaces, and full stops.');
			debug('name had illegal characters');
			return false;
		}
		connections.push({Name: data, Socket: socket});
		socket.emit('nameaccepted', '');
		debug('accepted name');
	});

	socket.on('pm', function(data) {
		debug('recieved pm');
/*should do the following:
1. search for socket in games
2. get opponent's socket from here
3. escape html, etc. Perhaps other formatting, censor swearing, etc.
4. send message on to both sender and opponent
*/
	});
	socket.on('request', function(data) {
		//stuff for battle requests. Something along these lines:
		debug('recieved request');
		var requesting = false;
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				requesting = true;
			}
		}
		if (!requesting) {
			var reqname = getName(socket);
			var xypart; if (data.XY) {xypart = '&#x2611';} else {xypart = '&#x2612';}
			var html = '<tr id="'+reqname+'requesttablerow"><td>'+reqname+'</td><td>'+data.Gen+'</td><td>'+data.Tier+'</td><td>'+xypart+'</td><td>'+data.FC+'</td><td><button type="button" onclick="challenge('+"'"+reqname+"'"+')">Challenge</button></tr>';//there's gotta be a better way to do the strings than that but it'd take me like 10 minutes to research escaping characters and how it interacts with html n stuff so meh.
			io.emit('request',html);
			battlerequests.push({requester:socket,request:html});
		} else {
//do stuff to stop them requesting multiple games at once
		}
	});
	socket.on('cancelrequest', function() {
		debug('recieved request cancellation');
		io.emit('cancelrequest', getName(socket)); //have to get name serverside or you can cancel other people's requests
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {battlerequests.splice(i,1);}
		}
	});
	socket.on('challenge', function(data) {
		debug('recieved challenge');
//check if there's a request here? Possibly check if other people are challenging, IDK
		var toChallenge = getSocket(data.toChallenge);
		toChallenge.emit('challenge', {user:getName(socket), FC:data.FC});
	});
	socket.on('disconnect', function() {
		debug('a user disconnected');
		for (var i = 0; i < connections.length; i++) {
			if (connections[i].Socket === socket) {connections.splice(i,1);}
		}
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {battlerequests.splice(i,1);}
		}
		for (var i = 0; i < games.length; i++) {
			//code
		}//do I even need a games array? IDK
	});
});


http.listen(8000, function() {
	console.log('listening on *:8000');
});
