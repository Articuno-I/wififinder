//import modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//define global variables
var connections = [];
var battlerequests = []; //maybe battlerequests = {socket:data}?
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

def getRequest(socket) {
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
	socket.on('name', function(data) {
		debug('recieved name');
		var taken = false;
		for (var i = 0; i < connections.length; i++) {
			if (data == connections[i].Name) {taken = true;}
		}
		if (taken) {
			socket.emit('nametaken','');
//should probably put in check to make sure the socket doesn't already have a name
//code breaks somewhere after this point, may be clientside
		} else {
			connections.push({Name: data, Socket: socket});
			socket.emit('nameaccepted', battlerequests);
		}
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
			if (battlerequests[i].requester == socket) {
				requesting = true;
			}
		}
		if (!requesting) {
			var reqname = getName(socket);
			var html = '<tr id='+reqname+'><td>'+reqname+'</td><td>'+data.Gen+'</td><td>'+data.Tier+'</td><td>'+data.XY+'</td><td>'+data.FC+'</td><td><button type="button" onclick="challenge('+"'"+reqname+"'"+')">Challenge</button></tr>';//there's gotta be a better way to do the strings than that but it'd take me like 10 minutes to research escaping characters and how it interacts with html n stuff so meh.
			io.emit('request',html);
			battlerequests.push({requester:socket,request:html});
		} else {
//do stuff to stop them requesting multiple games at once
		}
	});
	socket.on('challenge', function(data) {
//stuff
	});
});


http.listen(8000, function() {
	console.log('listening on *:8000');
});
