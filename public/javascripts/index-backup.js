//查找页面元素的函数
function $(s) {
    return document.querySelectorAll(s);
}

//定义 XHR 网页请求对象
var xhr=new XMLHttpRequest();
//定义 AudioContext 对象，即Audio环境(上下文)，用于创建各种子节点
var ac=new(window.AudioContext||widow.webkitAudioContext)();
//定义 gainNode 对象，用于控制音量大小
var gainNode=ac[ac.createGain?"createGain":"createGainNode"]();
//定义 analyserNode 对象，只能对音频进行读取分析，而不进行修改处理
var analyserNode=ac.createAnalyser();
var size=64;//能量条或圆点的数目，要求是16-1024中2的幂
analyserNode.fftSize = size*2;//

//连接顺序： BufferSourceNode --> AnalyserNode --> GainNode --> AudioDestioationNode
analyserNode.connect(gainNode);
gainNode.connect(ac.destination);


//以下的 curBufferSource latestId curId xhr.abort() 的设置均用于处理歌曲重复或同时播放的问题
var curBufferSource=null;//当前所播放歌曲的 bufferSource
var latestId=0;//最新的请求编号(即共点击了几次播放按钮，不管是不是同一首歌)

//获得url对应的音频数据，解码并播放
function load(url) {
	var curId=++latestId;//curId 表示当前是第几次请求
	curBufferSource && curBufferSource[curBufferSource.stop?"stop":"noteOff"]();//停止当前歌曲的播放
	xhr.abort();//点击一首歌时，停止上一首歌的请求(即便没有上一次请求)
	xhr.open("GET",url);
	xhr.responseType="arraybuffer";
	xhr.onload=function(){
		if(curId!=latestId)return;//curId != latestId 说明有新的歌曲请求，当前请求的音乐就不解码播放了
		ac.decodeAudioData(
			xhr.response,
			function(buffer){//解码成功时调用
				if(curId!=latestId)return;//同上
				var bufferSource=ac.createBufferSource();
				bufferSource.buffer=buffer;
				bufferSource.connect(analyserNode);
				bufferSource[bufferSource.start?"start":"noteOn"](0);//播放音乐
				curBufferSource=bufferSource;
			},
			function(err){//解码失败时调用
				console.log(err);
			}
		)
	}
	xhr.send();//发送请求
}


var canvasBox=$("#canvas")[0];
var canvas=document.createElement("canvas");
canvasBox.appendChild(canvas);
var height,width;//canvas 的高和宽
var ctx=canvas.getContext("2d");//获取 canvas 2D绘画环境
var mode="dot";//默认绘图模式
var maxDotRadius;//圆点的最大半径
var gradL;//线性渐变对象(用于能量条颜色填充)
var dots=[];//圆点数据列表
var caps=[];//能量条帽数据列表

//caps 初始化
for(var i=0;i<size;i++){
	caps.push(0);
}

//生成 a`b 之间的随机整数
function randomInt(a,b){return Math.round(Math.random()*(b-a)+a);}
//最值函数
function max(a,b){return a>b?a:b;}
function min(a,b){return a<b?a:b;}

//获取各圆点的参数(用于圆点图)
function getDots(){
	dots=[];
	for(var i=0;i<size;i++){
		var x=randomInt(0,width);
		var y=randomInt(0,height);
		var dx=randomInt(1,4);
		var dy=randomInt(1,3);
		var color="rgba("	+randomInt(50,240)+","
								+randomInt(100,250)+","
								+randomInt(50,150)+",0.05)"
		dots.push({x:x,y:y,dx:dx,dy:dy,color:color});//将单个圆点的数据存入 dots 列表中
	}
}

//当浏览器窗口大小改变时调用
window.onresize = function(){
	//重设画布大小
	canvas.height=height=canvasBox.clientHeight;
	canvas.width=width=canvasBox.clientWidth;
	//设置线性渐变对象  (渐变起点x,y,渐变终点x,y)
	gradL=ctx.createLinearGradient(0,0,0,height);
	//设置渐变色 红->黄->绿
	gradL.addColorStop(0,"red");
	gradL.addColorStop(0.5,"yellow");
	gradL.addColorStop(1,"green");
	//获取各圆点的参数
	maxDotRadius=min(height,width)/9;
	getDots();
}
window.onresize();//初始化


//根据数据来绘制图形
function draw(arr){
	ctx.clearRect(0,0,width,height);
	if(mode=="column"){//能量条模式
		var w=width/size;//能量条间距
		var colW=w*0.6;//能量条宽度
		var capH=w*0.4;//能量条帽高度
		ctx.fillStyle=gradL;//设置填充样式
		for (var i = 0; i < size; i++) {
			var h=height*arr[i]/256;//每条能量条的高度
			ctx.fillRect(w*i,height-h,colW,h);//绘制能量条 (左上角x,y,宽度,高度)
			ctx.fillRect(w*i,height-caps[i]-capH,colW,capH);//绘制能量条帽
			caps[i]=max(caps[i]-1,0);//能量条帽自动下落
			//能量条帽被顶起
			if(h>0&&caps[i]<h+30){
				caps[i]=min(h+30,height-capH);
			}
		}
	}else if(mode=="dot"){//圆点模式
		for (var i = 0; i < size; i++) {
			//圆点移动
			dots[i].x=(dots[i].x+=dots[i].dx)>width+20?0:dots[i].x;
			dots[i].y=(dots[i].y+=dots[i].dy)>height+20?0:dots[i].y;
			var r=maxDotRadius*arr[i]/256+(arr[i]>5?2:0);//每个圆点的半径
			ctx.beginPath();
			ctx.arc(dots[i].x,dots[i].y,r,0,Math.PI*2,true);//(圆心x,y,半径r,起始∠,终止∠,顺逆时针)
			//创建圆形渐变对象  (起点圆x,y,r,终点圆x,y,r)
			var gradR=ctx.createRadialGradient(dots[i].x,dots[i].y,0,dots[i].x,dots[i].y,r);
			gradR.addColorStop(0,"white");
			gradR.addColorStop(1,dots[i].color);
			ctx.fillStyle=gradR;
			ctx.fill();
		}
	}
}



//得到分析数据并播放
function visualize(){
	//注： frequencyBinCount 是 AnalyserNode 的一个属性，其值是 fftSize 的一半。
	//getByteFrequencyData() 获得的数组arr的长度即为 frequencyBinCount 。
	//arr 每个元素取值范围为1-256(8位无符号整型)。
	var arr=new Uint8Array(analyserNode.frequencyBinCount);
	analyserNode.getByteFrequencyData(arr);//将分析得到的数据存入arr中
	requestAnimationFrame=	window.requestAnimationFrame||
									window.webkitRequestAnimationFrame||
									window.mozRequestAnimationFrame;
	function v(){//v 是用于动态绘图的回调函数
		analyserNode.getByteFrequencyData(arr);//获取此刻音频数据
		draw(arr);//根据音频数据绘制图像
		requestAnimationFrame(v);//继续更新下一帧动画
	}
	requestAnimationFrame(v);//调用回调函数 v 播放动画
}
visualize();

var musics = $("#music li"); //网页 音乐列表
for (var i = 0; i < musics.length; i++) { //为音乐列表中每一项绑定点击事件
    musics[i].onclick = function() {
        for (var j = 0; j < musics.length; j++) {
            musics[j].className = ""; //取消其他歌曲的选中标记
        }
        this.className = "selected"; //为被点击的歌曲添加选中标记
        load("/media/" + this.title);
    }
}

var modes=$("#mode li");//网页 显示模式列表
for (var i = 0; i < modes.length; i++) { //为模式列表中每一项绑定点击事件
	modes[i].onclick=function(){
		for(var j=0;j<modes.length;j++){
 			modes[j].className="";//取消其他模式的选中标记
 		}
 		this.className="selected";//为被点击的模式添加选中标记
 		mode=this.getAttribute("data-mode");
 	}
}

var volumeBar=$("#volume")[0];//网页 音量滚动条
volumeBar.onchange =function(){ //为音量滚动条绑定 值变化事件
	gainNode.gain.value=this.value/this.max;
}
volumeBar.onchange();//音量初始化


$("#local-music")[0].onclick=function(){
	$("#upload")[0].click();
}

$("#upload")[0].onchange = function() {
    
}