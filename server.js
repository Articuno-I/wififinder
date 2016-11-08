var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client.html');
});

app.get('/scripts.js', function(req,res) {
	res.sendFile(__dirname + '/scripts.js');
});

app.get('/styles.css', function(req,res) {
	res.sendFile(__dirname + '/styles.css');
});

io.socket.on('connection').on('pm', function(data) {
	//insert code here to escape html etc. Maybe put in bold, censor, etc.
	io.sockets.sockets[data.to].emit('pm',{from: client.id, to: data.to, msg: data.msg});
	io.socket.on('connection').emit('pm',{from: client.id, to: data.to, msg: data.msg});
	//need to code other connection-y things, I don't think this works so I'll rework it at some point
});

http.listen(8000,function() {
	console.log('listening on *:8000');
});
