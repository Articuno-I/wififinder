var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client.html');
});

io.socket.on('connection').on('pm', function(data) {
	//insert code here to escape html etc. Maybe put in bold, censor, etc.
	io.sockets.sockets[data.to].emit('pm',{from: client.id, to: data.to, msg: data.msg});
	io.socket.on('connection').emit('pm',{from: client.id, to: data.to, msg: data.msg});
});

http.listen(8000,function(){
	console.log('listening on *:8000');
});
