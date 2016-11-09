var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client.html');
}); //may use something other than __dirname when it's eventually hosted, IDK how this'll work though

app.get('/scripts.js', function(req,res) {
	res.sendFile(__dirname + '/scripts.js');
});

app.get('/styles.css', function(req,res) {
	res.sendFile(__dirname + '/styles.css');
});

o.on('connection', function(socket) {
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
		var requesting = false;
		for (var i = 0; i < battlerequests.length(); i++) {
			if (battlerequests[i][requester] == socket) {
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
		//do stuff
	});
	//maybe add something to accept challenges?
});


http.listen(8000,function() {
	console.log('listening on *:8000');
});
