var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var battlerequests = [];
var games = [];

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
	socket.on('pm', function(data) {
/*should do the following:
1. search for socket in games
2. get opponent's socket from here
3. escape html, etc. Perhaps other formatting, censor swearing, etc.
4. send message on to both sender and opponent
*/
	});
	socket.on('request', function(data) {
		//stuff for battle requests. Something along these lines:
		console.log('received request');
		var requesting = false;
		for (var i = 0; i < battlerequests.length; i++) {
			if (battlerequests[i][requester] == socket) { //should it be .requester? I don't remember
				requesting = true;
			}
			if (!requesting) {
				battlerequests.push({socket,data});
//here need to add battle request to html, also need to find smogon username for this if not earlier, to make it human-readable among other things.
			} else {
//do stuff to stop them requesting multiple games at once
			}
		}
	});
	socket.on('challenge', function(data) {
/*
not convinced I want to set up the html serverside, IDK.
this also requires the username of the challenger, IDK how to:
a) get that and 
b) prevent security problems (e.g. sending a request under someone else's username, using CSRF, etc.
b is pretty minor but I feel like it'd be bad not to have an answer to it.
*/
		var html = "<tr id="+data.username+"><td>"+data.username+"</td><td>"+data.Gen+"</td><td>"+data.Tier+"</td><td>"+data.XY+"</td><td>"+data.FC+"</td><td>"+/*button*/"</tr>";
		io.emit('challenge',html);
		battlerequests.push(html);
	});
	//Something for challenging & accepting challenges here, IDK how it'll work with two people needing to talk to server. 
});


http.listen(8000, function() {
	console.log('listening on *:8000');
});
