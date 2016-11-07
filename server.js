var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/edited_client.html');
});

io.socket.on('connection').on('pm', function(data) {
	io.sockets.sockets[data.to].emit('pm',{from: client.id, to: data.to, msg: data.msg});
	io.socket.on('connection').emit('pm',{from: client.id, to: data.to, msg: data.msg});
});

http.listen(8000,function(){
	console.log('listening on *:8000');
});
