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
var date;
function print(text) {
	date = new Date();
	var time = '';
	(date.getHours() > 9) ? time += date.getHours() + ':' : time += '0' + date.getHours() + ':';
	(date.getMinutes() > 9) ? time += date.getMinutes() + ':' : time += '0' + date.getMinutes() + ':';
	(date.getSeconds() > 9) ? time += date.getSeconds() + ' ' : time += '0' + date.getSeconds() + ' ';
	console.log(time + text);
}
var debugging = true;
function debug(text,sockname) {
	if (!debugging) {return false;}
	sockname ? print('[.] '+sockname+': '+text) : print('[.] Unnamed: '+text);
}
function error(text,sockname) {
	sockname ? print('[!] '+sockname+': '+text) : print('[!] Unnamed: '+text);
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
	if (debugging) {print('[*] Unnamed: a user connected');}
	var sockname = false;
	socket.on('name', function(data) {
		debug('received name',false);
		if (! /^[a-zA-Z0-9_ .,]+$/.test(data)) {
			socket.emit('namenotaccepted','Please only use alphanumeric characters, spaces, and full stops.');
			debug('name had illegal characters',false);
			return false;
		}
		if (data.toLowerCase().indexOf('you')!=-1 || data.indexOf('challengerequest')!=-1 || data.indexOf('requesttablerow')!=-1 || data.toLowerCase().indexOf('unnamed')!=-1) {//cases that might muck up the code
			socket.emit('namenotaccepted','Why would you even want that name anyway? Geez.');
		}
		for (var i = 0; i < connections.length; i++) {
			if (socket == connections[i].Socket) {
				socket.emit('Error','This socket is already connected.');
				error('name couldn\'t be chosen: already connected',false);
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
		debug('accepted name',sockname);
	});
	socket.on('request', function(data) {
		//stuff for battle requests. Something along these lines:
		debug('received request',sockname);
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {
				socket.emit('Error','already requesting a game.');
				debug('socket was already requesting a game',sockname);
				return false;
			}
		}
		if (data.FC.match(/^[0-9]-+$/) || data.FC.length != 14) {
			debug('Illegal FC',sockname);
			socket.emit('Error','Illegal FC');
			return false;
		}
		if (/[<>&"']/.test(data.Tier)) {
			debug('Illegal characters in tier',sockname);
			socket.emit('Error','Illegal characters in tier');
			return false;
		}
		var xypart = data.XY ? '&#x2611' : '&#x2610';
		var hackpart = data.Hacks ? '&#x2611' : '&#x2610';
		io.emit('request',[sockname,data.Gen,data.Tier,xypart,data.FC,hackpart]);
		battlerequests.push({requester:socket,request:[sockname,data.Gen,data.Tier,xypart,data.FC,hackpart]});
	});
	socket.on('cancelrequest', function() {
		debug('received request cancellation',sockname);
		io.emit('cancelrequest', sockname); //have to get name serverside or you can cancel other people's requests
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i].requester === socket) {battlerequests.splice(i,1);}
		}
	});
	socket.on('challenge', function(data) {
		debug('received challenge',sockname);
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
		if (data.FC.match(/^[0-9]-+$/) || data.FC.length != 14) {
			debug('Illegal FC',sockname);
			socket.emit('Error','Illegal FC');
			return false;
		}
		var toChallenge = getSocket(data.toChallenge);
		toChallenge.emit('challenge', {user:sockname, FC:data.FC});
		games.push({players:[sockname,data.toChallenge],playing:false});
	});
	socket.on('accept', function() {
		debug('received accept',sockname);
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
		} error('request not found',sockname);
	});
	socket.on('decline', function() {
		debug('received decline',sockname);
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				getSocket(games[i].players[1]).emit('decline',''); //is the 2nd thing necessary? Should experiment with this probably
				games.splice(i,1);
				return true;
			}
		} error('request not found',sockname);
	});
	socket.on('pm', function(data) {
		debug('received pm',sockname);
		if (!data.length) {
			debug('pm had zero length',sockname);
			return false;
		}
		data = data //shamelessly stolen from stackoverflow user: bjornd
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
		var target = false;
		for (var i = 0; i < games.length; i++) {
			if (games[i].players[0] === sockname) {
				target = games[i].players[1];
			} else if (games[i].players[1] === sockname) {
				target = games[i].players[0];
			}
		}
		if (!target) {
			error('pm target not found!',sockname);
			return false;
		}
		getSocket(target).emit('pm','<b>'+sockname+':</b> '+data); //possibly add timestamps later, IDK
		socket.emit('pm','<b>You:</b> '+data); //IDK if I need this, there's potential problems if not though (e.g. message order different)
	});
	socket.on('endgame', function() {
		debug('game ended',sockname);
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
		if (debugging) {print('[*] '+(sockname || 'Unnamed')+': User disconnected');}
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

//Handle server shutting down
process.on('exit', function() {
	print('[*] Disconnecting users');
	io.emit('shutdown','');
});
process.on('SIGINT', function() {
	process.exit();
});
process.on('uncaughtException', function(e) {
	print('[!] Uncaught Exception...');
	console.log(e.stack);
	process.exit(99);
});

//connect on a port
var port = 8000;
http.listen(port, function() {
	print('[*] listening on *:'+port);
});
