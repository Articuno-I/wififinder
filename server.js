//import modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//define global variables
var connections = []; //store sockets and their login names
var battlerequests = []; //store requests for battles
var games = []; //store ongoing battles and challenges

//functions to go with global variables
function getSocket(name) {
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].Name == name) {return connections[i].Socket;}
	}
	return false;
}

//debugging code
var debugging = true;
function debug(text) {
	if (debugging) {console.log('debug: '+text);}
}

//handle get requests
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client.html');
});

app.get('/scripts.js', function(req,res) {
	res.sendFile(__dirname + '/scripts.js');
});

app.get('/styles.css', function(req,res) {
	res.sendFile(__dirname + '/styles.css');
});

//main loop
io.on('connection', function(socket) {
	for (var i = 0; i < battlerequests.length; i++) {
		socket.emit('request',battlerequests[i].request);
	}
	var sockname;
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
		sockname = data;
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
		var xypart; if (data.XY) {xypart = '&#x2611';} else {xypart = '&#x2610';}
		io.emit('request',[sockname,data.Gen,data.Tier,xypart,data.FC]);
		battlerequests.push({requester:socket,request:[sockname,data.Gen,data.Tier,xypart,data.FC]});
	});
	socket.on('cancelrequest', function() {
		debug('received request cancellation');
		io.emit('cancelrequest', sockname); //have to get name serverside or you can cancel other people's requests
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {battlerequests.splice(i,1);}
		}
	});
	socket.on('challenge', function(data) {
		debug('received challenge');
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				socket.emit('decline',"Can't challenge someone while requesting a game.");
				return false;
			}
		}
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				socket.emit('Error','Already challenging someone or in a game');
				return false;
			}
		}
		var toChallenge = getSocket(data.toChallenge);
		toChallenge.emit('challenge', {user:sockname, FC:data.FC});
		games.push({players:[sockname,data.toChallenge],playing:false});
	});
	socket.on('accept', function() {
		debug('received accept');
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				battlerequests.splice(i,1);
				i=battlerequests.length;
			}
		}
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[1] === sockname) {
				games[i].playing = true;
				getSocket(games[i].players[0]).emit('accept','');
				io.emit('cancelrequest',sockname);
				return true;
			}
		} debug('Error: request not found');
	});
	socket.on('decline', function() {
		debug('received decline');
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				getSocket(games[i].players[1]).emit('decline',''); //is the 2nd thing necessary? Should experiment with this probably
				games.splice(i,1);
				return true;
			}
		} debug('Error: request not found');
	});
	socket.on('pm', function(data) {
		debug('received pm');
		if (!data.length) {
			debug('Error: pm had zero length');
			return false;
		}
		for (var i = 0; i < data.length; i++) {
			if (data[i] === '<' || data[i] === '"' || data[i] === "'" || data[i] === '&') {
				//probably forgetting some, oh well
				//also, need to work out how to escape these. In the meantime, they just won't work though.
				debug('illegal characters (need to get this sorted)');
				return false;
			}
		}
		var target = false;
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				target = games[i].players[1];
			} else if (games[i].players[1] === sockname) {
				target = games[i].players[0];
			}
		}
		if (!target) {
			console.log('Error: pm target not found!');
			return false;
		}
		getSocket(target).emit('pm','<b>'+sockname+':</b> '+data); //possibly add timestamps later, IDK
		socket.emit('pm','<b>You:</b> '+data); //IDK if I'll need this, there's potential problems if not though (e.g. message order different)
		//also IDK about having it say "You: " but owell
	});
	socket.on('endgame', function() {
		debug('game ended');
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				getSocket(games[i].players[1]).emit('endgame','');
				games.splice(i,1);
			} else if (games[i].players[1] === sockname) {
				getSocket(games[i].players[0]).emit('endgame','');
				games.splice(i,1);
			}
		}
	});
	socket.on('disconnect', function() {
		//This code doesn't trigger for some IE versions, IDK how to work around this though. Not sure if it works on Edge
		debug('a user disconnected');
		for (var i = 0; i < connections.length; i++) {
			if (connections[i].Socket === socket) {
				connections.splice(i,1);
			}
		}
		if (!!sockname) {//IDK if the !! is needed / if it works, should test this
			for (var i = 0; i < games.length; i++) {
				if (games[i].players[0] === sockname) {
					getSocket(games[i].players[1]).emit('endgame','dc');
					games.splice(i,1);
				} else if (games[i].players[1] === sockname) {
					getSocket(games[i].players[0]).emit('endgame','dc');
					games.splice(i,1);
				}
			}
			for (var i = 0; i < battlerequests.length; i++) {
				if (battlerequests[i].requester === socket) {
					battlerequests.splice(i,1);
					io.emit('cancelrequest', sockname);
				}
			}
		}
	});
});

//connect on port 8000
http.listen(8000, function() {
	console.log('listening on *:8000');
});
