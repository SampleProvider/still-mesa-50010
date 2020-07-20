var USE_DB = false;

var mongojs = USE_DB ? require("mongojs") : null;
var db = USE_DB ? mongojs('localhost:27017/project',['account','progress']) : null;


Database = {};

Database.isValidPassword = function(data,cb){
    if(!USE_DB)
	    return cb(2);
	db.account.findOne({username:data.username,password:data.password},function(err,res){
		if(res.length > 0){
			var x = 2;
			for(var i in Player.list){
				if(Player.list[i].number === data.username){
					console.log(data.username + ' tried to sign in but the username was already signed in.');
					x = 1;
				}
			}
			cb(x);
		}
		else{
			console.log(data.username + ' was an incorrect username-password pair.');
			cb(0);
		}
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
	    return cb(true);
	db.account.findOne({username:data.username},function(err,res){
		if(res.length > 0){
			console.log(data.username + ' created/deleted a new account with password ' + data.password + '.');
			cb(true);
		}
		else{
			console.log(data.username + ' tried to create/delete a new account but the username was already taken.');
			cb(false);
		}
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	db.account.remove({username:data.username},function(err){
		cb();
	});
}
