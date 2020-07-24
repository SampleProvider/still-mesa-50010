
SOCKET_LIST = {};
COLORS = [{inside:'#F14E54',outside:'#B43A3F'},{inside:'#0088EE',outside:'#0085A8'}];
COLOR = ['red','blue'];
COLORCOUNT = [0,0]

initPack = {player:[],arrow:[],shape:[]};
removePack = {player:[],arrow:[],shape:[]};

Entity = function(param){
	var self = {
		type:'Entity',
		x:250,
		y:250,
		map:0,
		spdX:0,
		spdY:0,
		direction:0,
		id:"",
		score:0,
		hp:10,
		color:null,
		damage:1,
		radius:10,
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.direction)
			self.direction = param.direction;
		if(param.id)
			self.id = param.id;
		if(param.hp)
			self.hp = param.hp;
		if(param.color)
			self.color = param.color;
		if(param.damage)
			self.damage = param.damage;
		if(param.radius)
			self.radius = param.radius;
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
		self.spdX = self.spdX * 0.9;
		self.spdY = self.spdY * 0.9;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2))
	}
	
	return self;
}
Entity.list = {};
Entity.getFrameUpdateData = function(){
	var pack = {
		initPack:{
			player:initPack.player,
			arrow:initPack.arrow,
			shape:initPack.shape,
		},
		updatePack:[],
		removePack:{
			player:removePack.player,
			arrow:removePack.arrow,
			shape:removePack.shape,
		}
	}
	for(var i in Player.list){
		pack.updatePack[i] = {
			player:Player.update(i),
			arrow:Arrow.update(i),
			shape:Shape.update(i),
		}
		Player.list[i].update();
	}
	for(var i in Arrow.list){
		Arrow.list[i].update();
	}
	for(var i in Shape.list){
		Shape.list[i].update();
	}
	initPack.player = [];
	initPack.arrow = [];
	initPack.shape = [];
	removePack.player = [];
	removePack.arrow = [];
	removePack.shape = [];
	return pack;
}
Player = function(param){
	var self = Entity(param);
	if(COLORCOUNT[0] < COLORCOUNT[1]){
		self.color = COLOR[0];
		COLORCOUNT[0] += 1;
	}
	else{
		self.color = COLOR[1];
		COLORCOUNT[1] += 1;
	}
	console.log(self.color);
	self.username = param.username
	self.x = Math.random() * 200 + (WIDTH - 200)/2;
	self.y = Math.random() * 200 + (HEIGHT - 200)/2;
	self.radius = 20;
	
	self.xp = 10;
	self.rank = "basic";
	self.type = "Player";
	self.team = [self.id];
	
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	
	self.direction = 0;
	self.mouseX = 0;
	self.mouseY = 0;
	self.CANVASWIDTH = 1000;
	self.CANVASHEIGHT = 1000;

	self.accSpd = 2;
	self.maxSpd = 5;
	self.reload = 10;
	self.recoil = 5;
	
	self.hp = 100;
	self.hpMax = 100;
	self.damage = 1;
	self.arrowDamage = 3;
	
	self.score = 0;
	
	self.inventory = new Inventory(param.socket,true);

	self.inventory.addItem("arrowRain",1);
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
		self.updateAttack();
		if(self.hp < 1){
			self.respawn();
		}
		if(self.hp < self.hpMax){
			self.hp += self.hp / 1000;
		}
	}
	//   /()/ /(*)/
	self.respawn = function(){
		self.score = 0;
		if(self.color == 'blue'){
			self.x = Math.random() * -500 + WIDTH;
			self.y = Math.random() * HEIGHT;
		}
		else if(self.color == 'red'){
			self.x = Math.random() * 500;
			self.y = Math.random() * HEIGHT;
		}
		self.hp = self.hpMax;
	}
	self.updateAttack = function(){
		self.reload++;
		if(self.pressingAttack){
			if(self.reload > 15){
				self.reload = -5;
				var error = Math.random() * 10;
				self.shootArrow(self.direction + error,self.direction + error,true);
			}
		}
	}
	self.shootArrow = function(angle,direction,doRecoil){
		var arrow = Arrow({
			id:self.id,
			angle:angle,
			direction:direction,
			x:self.x + Math.cos(angle/180*Math.PI) * 20,
			y:self.y + Math.sin(angle/180*Math.PI) * 20,
			map:self.map,
			color:self.color,
			damage:self.arrowDamage,
			addSpdX:self.spdX,
			addSpdY:self.spdY,
		});
		if(doRecoil){
			self.spdX -= Math.cos(angle/180*Math.PI) * self.recoil;
			self.spdY -= Math.sin(angle/180*Math.PI) * self.recoil;

		}
		console.log(self.username + ' shot arrow(' + arrow.id + ').');
	}
	self.updateSpd = function(){
		if(self.x < -25)
			self.x = -25;
		if(self.x > WIDTH + 25)
			self.x = WIDTH + 25;
		if(self.y < -25)
			self.y = -25;
		if(self.y > HEIGHT + 25)
			self.y = HEIGHT + 25;
		if(self.pressingRight){
			self.spdX += self.accSpd;
		}
		else if(self.pressingLeft){
			self.spdX += -self.accSpd;
		}
		if(self.pressingUp){
			self.spdY += -self.accSpd;
		}
		else if(self.pressingDown){
			self.spdY += self.accSpd;
		}
	}
	self.getInitPack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			color:self.color,
			username:self.username,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
		}
	}
	self.getUpdatePack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			hp:self.hp,
			score:self.score,
			map:self.map,
			reload:self.reload,
		}
	}
	Player.list[self.id] = self;
	Entity.list[self.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket,username){
	var map = 0;
	if(Math.random() < 0.5){
		map = 1;
	}
	var player = Player({
		id:socket.id,
		map:map,
		username:username,
		socket:socket,
	});
	console.log(Player.list[socket.id].username + ' joined.');
	
	socket.on('canvasSize',function(data){
		player.CANVASWIDTH = data.canvaswidth;
		player.CANVASHEIGHT = data.canvasheight;
	});

	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'direction')
			player.direction = (Math.atan2(data.state.y,data.state.x - 18) / Math.PI * 180);
			player.mouseX = data.state.x;
			player.mouseY = data.state.y;
	});
	
	socket.on('changeMap',function(data){
		if(player.map === 1){
			player.map = 0;
		}
		else{
			player.map += 1;
		}
		player.x = WIDTH / 2;
		player.y = HEIGHT / 2;
	});
	
	socket.on('sendMsgToServer',function(data){
		console.log(player.username + ' messaged all \'' + data + '\' in chat.');
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	socket.on('sendPmToServer',function(data){
		var recipientSocket = null;
		for(var i in Player.list){
			if(Player.list[i].number === data.username){
				recipientSocket = SOCKET_LIST[i];
			}
		}
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		}
		else{
			recipientSocket.emit('addToChat','Private Message From ' + player.username + ': ' + data.message);
			socket.emit('addToChat','You sent a private message to ' + data.username + ': ' + data.message);
			console.log(player.username + ' private messaged ' + data.username + ' \'' + data.message + '\' in chat.');
		}
	});
	
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		arrow:Arrow.getAllInitPack(),
		shape:Shape.getAllInitPack(),
	});
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack())
	return players;
}
Player.onDisconnect = function(socket){
	if(Player.list[socket.id] !== undefined){
		console.log(Player.list[socket.id].username + ' left.');
		COLORCOUNT[Player.list[socket.id].colorid] -= 1;
	}
	for(var i in Arrow.list){
		if(Arrow.list[i].parent === socket.id){
			removePack.arrow.push(i);
			delete Arrow.list[i];
			delete Entity.list[i];
			console.log(Player.list[socket.id].username + '\'s arrow got deleted.');
		}
	}
	removePack.player.push(socket.id);
	delete Player.list[socket.id];
	delete Entity.list[socket.id];
}
Player.update = function(id){
	var pack = [];
	var socketPlayer = Player.list[id];
	for(var j in Player.list){
		var player = Player.list[j]
		if(socketPlayer.x - socketPlayer.CANVASWIDTH / 2 - 100 < player.x && socketPlayer.x + socketPlayer.CANVASWIDTH / 2 + 100 > player.x && socketPlayer.y - socketPlayer.CANVASHEIGHT / 2 - 100 < player.y && socketPlayer.y + socketPlayer.CANVASHEIGHT / 2 + 100 > player.y && socketPlayer.map === player.map){
			pack.push(player.getUpdatePack());
		}
	}
	return pack;
}
Arrow = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.spdX = Math.cos(param.angle/180 * Math.PI) * 30 + param.addSpdX;
	self.spdY = Math.sin(param.angle/180 * Math.PI) * 30 + param.addSpdY;
	self.parent = param.id;
	self.hp = 3;
	self.pentration = 0.01;
	self.damage = param.damage;
	self.radius = 15;
	self.type = "Arrow";
	self.color = param.color;
	self.direction = param.direction;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		self.hp -= self.pentration;
		super_update();
		self.spdX = self.spdX * 10/9;
		self.spdY = self.spdY * 10/9;
		if(self.hp < 1){
			self.toRemove = true;
		}
	}
	self.getInitPack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			color:self.color,
			map:self.map,
			parent:self.parent,
		}
	}
	self.getUpdatePack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
		}
	}
	Arrow.list[self.id] = self;
	Entity.list[self.id] = self;
	initPack.arrow.push(self.getInitPack());
	return self;
}
Arrow.list = {};
Arrow.update = function(id){
	var pack = [];
	var socketPlayer = Player.list[id];
	for(var j in Arrow.list){
		var arrow = Arrow.list[j];
		if(arrow.toRemove){
			console.log(Player.list[arrow.parent].username + '\'s arrow(' + arrow.id + ') got deleted.');
			delete Arrow.list[i];
			delete Entity.list[i];
			removePack.arrow.push(arrow.id);
		}
		else{
			if(socketPlayer.x - socketPlayer.CANVASWIDTH / 2 - 100 < arrow.x && socketPlayer.x + socketPlayer.CANVASWIDTH / 2 + 100 > arrow.x && socketPlayer.y - socketPlayer.CANVASHEIGHT / 2 - 100 < arrow.y && socketPlayer.y + socketPlayer.CANVASHEIGHT / 2 + 100 > arrow.y && socketPlayer.map === arrow.map){
				pack.push(arrow.getUpdatePack());
			}
		}
	}
	return pack;
}
Arrow.getAllInitPack = function(){
	var arrows = [];
	for(var i in Arrow.list)
		arrows.push(Arrow.list[i].getInitPack())
	return arrows;
}
Shape = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.spdX = 0;
	self.spdY = 0;
	self.hp = 10;
	self.hpMax = 10;
	self.pentration = 0;
	self.damage = 2;
	self.radius = 30;
	self.type = "Shape";
	self.shapeSize = param.type;
	if(self.shapeSize === 0){
		self.hp = 10;
		self.hpMax = 10;
		self.pentration = 0;
		self.damage = 2;
		self.radius = 30;
		self.score = 5;
		self.getPotionChance = 0.2;
		self.getPotionAmount = 1;
	}
	else if(self.shapeSize === 1){
		self.hp = 50;
		self.hpMax = 50;
		self.pentration = 0;
		self.damage = 2;
		self.radius = 60;
		self.score = 50;
		self.getPotionChance = 1;
		self.getPotionAmount = 1;
	}
	else if(self.shapeSize === 2){
		self.hp = 500;
		self.hpMax = 500;
		self.pentration = 0;
		self.damage = 5;
		self.radius = 120;
		self.score = 5000;
		self.getPotionChance = 0.8;
		self.getPotionAmount = 50;
	}
	self.color = {inside:'#790000',outside:'#550000'};
	self.color = 'brown';
	self.toRemove = false;
	self.direction = 0;
	var super_update = self.update;
	self.update = function(){
		super_update();
		if(self.x < -15)
			self.x = -15;
		if(self.x > WIDTH + 15)
			self.x = WIDTH + 15;
		if(self.y < -15)
			self.y = -15;
		if(self.y > HEIGHT + 15)
			self.y = HEIGHT + 15;
		self.direction += 1;
		self.spdX += (Math.random() - 0.5) * 2;
		self.spdY += (Math.random() - 0.5) * 2;
		
		if(self.hp < self.hpMax){
			self.hp += 0.05;
		}
		if(self.hp < 1){
			self.toRemove = true;
		}
	}
	self.getInitPack = function(){
		return{
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			map:self.map,
			color:self.color,
			shapeSize:self.shapeSize,
		}
	}
	self.getUpdatePack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			hp:self.hp,
		}
	}
	Shape.list[self.id] = self;
	Entity.list[self.id] = self;
	initPack.shape.push(self.getInitPack());
	return self;
}
Shape.list = {};
Shape.update = function(id){
	var pack = [];
	var socketPlayer = Player.list[id];
	for(var j in Shape.list){
		var shape = Shape.list[j];
		if(shape.toRemove){
			console.log('Shape(' + shape.id + ') got deleted.');
			delete Shape.list[i];
			delete Entity.list[i];
			removePack.shape.push(shape.id);
		}
		else{
			if(socketPlayer.x - socketPlayer.CANVASWIDTH / 2 - 100 < shape.x && socketPlayer.x + socketPlayer.CANVASWIDTH / 2 + 100 > shape.x && socketPlayer.y - socketPlayer.CANVASHEIGHT / 2 - 100 < shape.y && socketPlayer.y + socketPlayer.CANVASHEIGHT / 2 + 100 > shape.y && socketPlayer.map === shape.map){
				pack.push(shape.getUpdatePack());
			}
		}
	}
	return pack;
}
Shape.getAllInitPack = function(){
	var shapes = [];
	for(var i in Shape.list)
		shapes.push(Shape.list[i].getInitPack())
	return shapes;
}
spawnEntities = function(){
	if(Math.random() < 0.02 && Shape.list.length < 50){
		if(Math.random() < 0.8){
			var shape = Shape({
				map:Math.round(Math.random() + 0.1),
				x:Math.random() * WIDTH,
				y:Math.random() * HEIGHT,
				type:0,
			});
		}
		else if(Math.random() < 0.98){
			var shape = Shape({
				map:Math.round(Math.random() + 0.1),
				x:Math.random() * WIDTH,
				y:Math.random() * HEIGHT,
				type:1,
			});
		}
		else{
			var shape = Shape({
				map:Math.round(Math.random() + 0.1),
				x:Math.random() * WIDTH,
				y:Math.random() * HEIGHT,
				type:2,
			});
		}
	}
}

updateCrashes = function(){
	for(var i in Entity.list){
		var p = Entity.list[i];
		for(var j in Entity.list){
			var q = Entity.list[j];
			if(q.getDistance(p) < q.radius + p.radius && q.map === p.map && q !== p && q.hp > 0 && p.hp > 0){
				if(p.map === 1 && q.map === 1){
					if(p.type === "Arrow" && q.type === "Arrow"){
						if(Player.list[p.parent] !== Player.list[q.parent]){
							p.hp -= q.damage;
							q.hp -= p.damage;
						}
					}
					else if(q.type === "Arrow"){
						if(Player.list[q.parent] !== p){
							p.hp -= q.damage;
							q.hp -= p.damage;
						}
					}
					else if(p.type === "Arrow"){
						if(Player.list[p.parent] !== q){
							p.hp -= q.damage;
							q.hp -= p.damage;
						}
					}
					else{
						p.hp -= q.damage;
						q.hp -= p.damage;
					}
				}
				else if(p.color !== q.color){
					p.hp -= q.damage;
					q.hp -= p.damage;
				}
				if(q.hp <= 0){
					if(q.type === "Shape"){
						if(p.type === "Arrow"){
							if(Player.list[p.parent]){
								Player.list[p.parent].score += Math.round(q.score/2) + 1;
								if(Math.random() < q.getPotionChance){
									Player.list[p.parent].inventory.addItem("woodPotion",q.getPotionAmount);
								}
							}
						}
						else if(p.type === "Player"){
							p.score += Math.round(q.score/2) + 1;
							if(Math.random() < q.getPotionChance){
								p.inventory.addItem("woodPotion",q.getPotionAmount);
							}
						}
					}
					else{
						if(p.type === "Arrow"){
							if(Player.list[p.parent]){
								Player.list[p.parent].score += Math.round(q.score/2) + 1;
							}
						}
						else if(p.type === "Player"){
							p.score += Math.round(q.score/2) + 1;
						}
					}
				}
				if(p.hp <= 0){
					if(p.type === "Shape"){
						if(q.type === "Arrow"){
							if(Player.list[q.parent]){
								Player.list[q.parent].score += Math.round(p.score/2) + 1;
								if(Math.random() < p.getPotionChance){
									Player.list[q.parent].inventory.addItem("woodPotion",p.getPotionAmount);
								}
							}
						}
						else if(q.type === "Player"){
							q.score += Math.round(p.score/2) + 1;
							if(Math.random() < p.getPotionChance){
								q.inventory.addItem("woodPotion",p.getPotionAmount);
							}
						}
					}
					else{
						if(q.type === "Arrow"){
							if(Player.list[q.parent]){
								Player.list[q.parent].score += Math.round(p.score/2) + 1;
							}
						}
						else if(q.type === "Player"){
							q.score += Math.round(p.score/2) + 1;
						}
					}
				}
			}
		}
	}
}

doAllMapCheck = function(){
	mapCheck({x:0,y:0,width:500,height:HEIGHT,map:0,color:'red'});
	mapCheck({x:WIDTH - 500,y:0,width:500,height:HEIGHT,map:0,color:'blue'});
	mapCheck({x:500,y:500,width:WIDTH - 1000,height:500,map:1,color:'yellow'});
	mapCheck({x:500,y:500,width:500,height:HEIGHT - 1000,map:1,color:'yellow'});
	mapCheck({x:WIDTH - 1000,y:500,width:500,height:HEIGHT - 1000,map:1,color:'yellow'});
	mapCheck({x:500,y:HEIGHT - 1000,width:WIDTH - 500,height:500,map:1,color:'yellow'});
}

var mapCheck = function(param){
    for(i in Entity.list){
		entity = Entity.list[i];
        if(entity.color !== param.color && entity.x > param.x && entity.x < param.x + param.width && entity.y > param.y && entity.y < param.y + param.height && entity.map === param.map){
			if(entity.type === "Arrow"){
				entity.hp -= entity.pentration * 100;
			}
			else if(entity.type === "Shape"){
				entity.hp -= 1;
			}
			else{
				entity.hp -= 10;
			}
        }
        /*if(entity.color !== param.color && entity.x > param.x && entity.y > param.y && entity.map === param.map){
			if(entity.type === "Arrow"){
				entity.hp -= entity.pentration * 100;
			}
			else if(entity.type === "Shape"){
				entity.hp -= 1;
			}
			else{
				entity.hp -= 10;
			}
        }*/
    }
}


