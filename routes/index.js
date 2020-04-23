var express = require("express");
var router = express.Router();
var mediaPath = 'public/media';
router.get('/', function(req, res){
	var fs = require("fs");
	fs.readdir(mediaPath, function(err, musicList){
		if(err){
			console.log(err);
		}else{
			res.render('index', {title: '音乐可视化', musicList: musicList});
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

module.exports = router;