var express = require("express");
var router = express.Router();
//var mediaPath = 'public/media';
var mediaPath = '/root/UploadFiles';
router.get('/', function(req, res){
	//console.log(req.headers.cookies)
	//req.open("GET",url);
	//req.responseType="arraybuffer";
	//var name=req.get("http://127.0.0.1:8080/user/name");
	//console.log(name);
	var userName=req.query.userName;
	if(!userName){
		res.render('index', {title: '音乐可视化', musicList: [], userName: "登录"});
		return;
	}
	var fs = require("fs");
	fs.readdir(mediaPath+"/"+userName, function(err, musicList){
		if(err){
			console.log(err);
		}else{
			res.render('index', {title: '音乐可视化', musicList: musicList, userName: userName});
		}
	});
});

router.get('/2', function(req, res){
	var fs = require("fs");
	fs.readdir(mediaPath, function(err, musicList){
		if(err){
			console.log(err);
		}else{
			res.render('index2', {title: '音乐可视化', musicList: musicList});
		}
	});
});

router.get('/register', function(req, res){
	res.render('register', {title: '注册'});
});

router.get('/login', function(req, res){
	res.render('login', {title: '登录'});
});

module.exports = router;