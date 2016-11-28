//import modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//define global variables
var connections = []; //store sockets and their login names
var battlerequests = []; //store requests for battles
var games = []; //store ongoing battles and challenges

//functions to go with global variables
function getName(socket) {
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].Socket === socket) {return connections[i].Name;}
	}
	console.log('Error: name not found');
	return "Error: name not found";
}

function getSocket(name) {
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].Name == name) {return connections[i].Socket;}
	} return false;
}

function getRequest(socket) { //probably unnecessary, expect I'll take this code out
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
		debug('received name');
		if (! /^[a-zA-Z0-9_ .,]+$/.test(data)) {
			socket.emit('namenotaccepted','Please only use alphanumeric characters, spaces, and full stops.');
			debug('name had illegal characters');
			return false;
		}
		for (var i = 0; i < connections.length; i++) {
			if (socket == connections[i].Socket) {
				socket.emit('Error','This socket is already connected.');
				debug("socket was already connected so couldn't choose name");
				return false;
			}
			if (data == connections[i].Name) {
				socket.emit('namenotaccepted','Sorry, that name was taken. Please try another one.');
				return false;
			}
		}
		connections.push({Name: data, Socket: socket});
		socket.emit('nameaccepted', '');
		debug('accepted name');
	});
	socket.on('request', function(data) {
		//stuff for battle requests. Something along these lines:
		debug('received request');
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				socket.emit('Error','already requesting a game.');
				debug('socket was already requesting a game');
				return false;
			}
		}
		var reqname = getName(socket);
		var xypart; if (data.XY) {xypart = '&#x2611';} else {xypart = '&#x2612';}
		var html = '<tr id="'+reqname+'requesttablerow"><td>'+reqname+'</td><td>'+data.Gen+'</td><td>'+data.Tier+'</td><td>'+xypart+'</td><td>'+data.FC+'</td><td><button type="button" onclick="challenge('+"'"+reqname+"'"+')">Challenge</button></tr>';//there's gotta be a better way to do the strings than that but it'd take me like 10 minutes to research escaping characters and how it interacts with html n stuff so meh.
		io.emit('request',html);
		battlerequests.push({requester:socket,request:html});
	});
	socket.on('cancelrequest', function() {
		debug('received request cancellation');
		io.emit('cancelrequest', getName(socket)); //have to get name serverside or you can cancel other people's requests
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {battlerequests.splice(i,1);}
		}
	});
	socket.on('challenge', function(data) {
		debug('received challenge');
		var chalname = getName(socket);
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				socket.emit('decline',"Can't challenge someone while requesting a game.");
				return false;
			}
		}
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === chalname) {
				socket.emit('Error','Already challenging someone or in a game');
				return false;
			}
		}
		var toChallenge = getSocket(data.toChallenge);
		toChallenge.emit('challenge', {user:getName(socket), FC:data.FC});
		games.push({players:[chalname,data.toChallenge],playing:false});
	});
	socket.on('accept', function() {
		debug('received accept');
		var accname = getName(socket);
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === accname) {
				games[i].playing = true;
				getSocket(games[i].players[1]).emit('accept','');
				return true;
			}
		} debug('Error: request not found');
	});
	socket.on('decline', function() {
		debug('received decline');
		var decname = getName(socket); //I should really store the socket's name as a local variable, owell
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === decname) {
				getSocket(games[i].players[1]).emit('decline',''); //is the 2nd thing necessary? Should experiment with this probably
				games.splice(i,1);
				return true;
			}
		} debug('Error: request not found');
	});
	socket.on('pm', function(data) {
		debug('recieved pm');
		for (var i = 0; i < data.length; i++) {
			if (data[i] === '<' || data[i] === '"' || data[i] === "'" || data[i] === '&') {
				//probably forgetting some, oh well
				//also, need to work out how to escape these. In the meantime, they just won't work though.
				debug('illegal characters (need to get this sorted)');
				return false;
			}
		}
		var pmname = getName(socket);
		var target = false;
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === pmname) {
				target = games[i].players[1];
			} else if (games[i].players[1] ==== pmname) {
				target = games[i].players[0];
			}
		}
		if (!target) {
			console.log('Error: pm target not found!');
			return false;
		}
		getSocket(target).emit('pm','<b>'+pmname+':</b> '+data); //possibly add timestamps later, IDK
		socket.emit('pm','<b>You: </b> '+data); //IDK if I'll need this, there's potential problems if not though (e.g. message order different
	});
	socket.on('disconnect', function() {
		debug('a user disconnected');
		var socketname = false;
		for (var i = 0; i < connections.length; i++) {
			if (connections[i].Socket === socket) {
				socketname = connections[i].Name;
				connections.splice(i,1);
			}
		}
		if (socketname) {
			for (var i = 0; i < games.length; i++) {
				if (battlerequests[i].players[0] === socketname) {
					//do code
				} else if (battlerequests[i].players[1] === socketname) {
					//also do code
				}
			}
			for (var i = 0; i < battlerequests.length; i++) {
				if (battlerequests[i].requester === socket) {
					battlerequests.splice(i,1);
					io.emit('cancelrequest', socketname);
				}
			}
		}
	});
});


http.listen(8000, function() {
	console.log('listening on *:8000');
});
