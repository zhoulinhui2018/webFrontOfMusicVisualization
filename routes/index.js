var express = require("express");
var router = express.Router();
var http = require('http');
var config = require("./../public/javascripts/config.js");

router.get('/', function(req, res) {
   jump(req,res,'index');
});

router.get('/2', function(req, res){
	jump(req,res,'index2');
});

router.get('/register', function(req, res){
	res.render('register', {title: '注册'});
});

router.get('/login', function(req, res){
	res.render('login', {title: '登录'});
});

module.exports = router;

var jump = function(req,res,ejs){
	var options = {
      host: config.host,
      port: config.port,
      path: '/user/name',
      method: 'get',
      headers: { 'Cookie': 'JSESSIONID=' + req.cookies['JSESSIONID']}
   };
   var newReq = http.request(options, function(newRes) {
      newRes.setEncoding('utf8');
      newRes.on('data', function(chunk) {
      	if(chunk=="user not logged in"){
      		res.render(ejs, { title: '音乐可视化', musicList: [], userName: "登录" });
      		return;
      	}
         var fs = require("fs");
         fs.readdir(config.mediaPathInRoute + chunk, function(err, musicList) {
            if (err) {
               console.log(err);
            } else {
               res.render(ejs, { title: '音乐可视化', musicList: musicList, userName: chunk });
            }
         });
      });
   })
   newReq.on('error', function(err) {
      console.log(err.message);
   });
   newReq.end();
}