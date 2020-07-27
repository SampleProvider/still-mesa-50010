
WIDTH = 6000;
HEIGHT = 4000;

var express = require('express');
var app = express();
var serv = require('http').Server(app);
require('./Entity');
require('./Database');
require('./client/Inventory');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT);
//serv.listen(2000);
console.log('Server Started.');


var DEBUG = false;
var RENDER = 10;

io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 2){
				Player.onConnect(socket,data.username);
			}
			socket.emit('signInResponse',{success:res});
		});
	});
	socket.on('createAccount',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				socket.emit('createAccountResponse',{success:false});
			}
			else{
				Database.addUser(data,function(){
					socket.emit('createAccountResponse',{success:true});
				});
			}
		});
	});
	socket.on('deleteAccount',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				Database.removeUser(data,function(){
					socket.emit('deleteAccountResponse',{success:true});
				});
			}
			else{
				socket.emit('deleteAccountResponse',{success:false});
			}
		});
	});
	
	socket.on('disconnect',function(){
		socket.emit('eventChange','disconnected');
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('evalServer',function(data){
		//if(!DEBUG)
			//return;
		//var res = eval(data);
		socket.emit('evalAnswer','Your glitch has been reported.');
		console.log('Glitch: ' + data);
	});
	
	
});
setInterval(function(){
	doAllMapCheck();
	spawnEntities();
	updateCrashes();
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',packs.initPack);
		socket.emit('update',packs.updatePack[i]);
		socket.emit('remove',packs.removePack);
	}
},1000/25);
