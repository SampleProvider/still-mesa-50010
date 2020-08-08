Inventory = {
    wood:0,
    stone:0,
    iron:0,
    diamond:0,
    gold:0,
    amethyst:0,
    opal:0,
    ruby:0,
    sapphire:0,
    emerald:0,
    p1:"healing potion",
    p2:"",
    p3:"",
    p4:"",
    p5:"",
    p6:"",
    p7:"",
    p8:"",
    p9:"",
    p0:"",
};
Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[], //{id:"itemId",amount:1}
        materials:[],
    };
    self.addItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id,amount:amount});
		self.refreshRender();
    }
    self.removeItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0)
					self.items.splice(i,1);
				self.refreshRender();
				return;
			}
		}    
    }
    self.hasItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
    }
	self.refreshRender = function(){

        if(self.server){
            self.socket.emit('updateInventory',self.items);
            return;
        }
        var inventory = document.getElementById("inventory");
        inventory.innerHTML = "";
        var addButton = function(data){
            let item = Item.list[data.id]
            let button = document.createElement('button');
            button.onclick = function(){
                self.socket.emit("useItem",item.id);
            }
            button.innerHTML = item.name + " x" + data.amount;
            inventory.appendChild(button);
        }
		for(var i = 0 ; i < self.items.length; i++){
			addButton(self.items[i]);
		}
    }
    if(self.server){
        socket.on("useItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                console.log('cheater');
                return;
            }

            let item = Item.list[itemId];
            item.event(Player.list[self.socket.id]);
        });
    }


	return self;
}


Item = function(id,name,event){
	var self = {
		id:id,
		name:name,
		event:event,
	}
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

Item("woodPotion","Wood Potion",function(player){
	player.hp = player.hpMax;
	player.inventory.removeItem("woodPotion",1);
	player.inventory.addItem("superAttack",1);
});0

Item("superAttack","Super Attack",function(player){
    for(var i = 0;i < 360; i += 10){
        player.shootWeapon(i,i,false);
    }
	//player.inventory.removeItem("superAttack",1);
});
Item("arrowRain","Arrow Rain!",function(player){
    for(var i = -15;i < 15; i += 1){
        var y = Math.random() * 2 - 1;
        player.shootWeapon(i + y + player.direction,i + y + player.direction,false);
    }
});
Item("speedBoost","Speed Boost!",function(player){
    player.accSpd += 1;
    player.maxSpd += 3;
	player.inventory.removeItem("speedBoost",1);
});





