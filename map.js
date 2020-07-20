


Map = function(param){
    var self = {
        x:0,
        y:0,
        width:0,
        height:0,
        map:0,
        color:'red',
    }
    if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.width)
			self.width = param.width;
		if(param.height)
			self.height = param.height;
		if(param.map)
			self.map = param.map;
		if(param.color)
			self.color = param.color;
    }
    var super_update = self.update;
    self.update = function(){
        super_update();
        for(i in Entity.list){
            if(Entity.list[i].colorname !== self.color){
                Entity.list[i].hp -= 1;
            }
        }
    }
}

mapRed = Map({x:0,y:0,width:250,height:HEIGHT,map:0,color:'red'});

