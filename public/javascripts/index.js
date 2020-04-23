//查找页面元素的函数
function $(s) {
    return document.querySelectorAll(s);
}
var canvas=document.createElement("canvas");
canvasBox=$("#canvas")[0];
canvasBox.appendChild(canvas);

var size=128;//能量条或圆点的数目，要求是16-1024中2的幂
var height,width;//canvas 的高和宽
var minHW;//canvas 高和宽中的较小值
var ctx=canvas.getContext("2d");//获取 canvas 2D绘画环境
var mode="dot";//默认绘图模式
var gradL;//线性渐变对象(用于能量条颜色填充)
var gradL2;
var dots=[];//圆点数据列表
var caps=[];//能量条帽数据列表
var rotateSpeed=0.001;//环形条旋转速度

//caps 初始化
for(var i=0;i<size;i++){
	caps.push(0);
}


var mv=new MusicVisualizer({
	size:size,
	draw:draw
})

//生成 a`b 之间的随机整数
function randomInt(a,b){return Math.round(Math.random()*(b-a)+a);}

//获取各圆点的参数(用于圆点图)
function getDots(){
	dots=[];
	if(mode=="dot"){
		for(var i=0;i<size;i++){
			var x=randomInt(0,width);
			var y=randomInt(0,height);
			var dx=randomInt(1,6)*0.5;
			var dy=randomInt(1,4)*0.5;
			var color="rgba("	+randomInt(100,250)+","
									+randomInt(50,240)+","
									+randomInt(50,120)+",0.2)"
			dots.push({x:x,y:y,dx:dx,dy:dy,color:color});//将单个圆点的数据存入 dots 列表中
		}
	}else if(mode=="circle"){
		var n=Math.floor(Math.log(size)/Math.log(2))+10;
		var r0=minHW*0.4/n;
		var j=1;
		for(var i=0;i<size;i++){
			if(i==4) j=2;
			if(i*0.5==j) j++;
			var a=randomInt(1,360)*Math.PI/180;
			var x=j*r0*Math.cos(a);
			var y=j*r0*Math.sin(a);
			dots.push({x:x,y:y});
		}
	}
}

//当浏览器窗口大小改变时调用
window.onresize = function(){
	//重设画布大小
	canvas.height=height=canvasBox.clientHeight;
	canvas.width=width=canvasBox.clientWidth;
	minHW=Math.min(height,width);
	//设置线性渐变对象  (渐变起点x,y,渐变终点x,y)
	gradL=ctx.createLinearGradient(0,0,0,height);
	gradL.addColorStop(0,"red");
	gradL.addColorStop(0.5,"yellow");
	gradL.addColorStop(1,"green");
	gradL2=ctx.createLinearGradient(0,minHW*0.3,0,minHW*0.6);
	gradL2.addColorStop(0,"blue");
	gradL2.addColorStop(1,"red");
	//获取各圆点的参数
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
			caps[i]=Math.max(caps[i]-1,0);//能量条帽自动下落
			//能量条帽被顶起
			if(h>0&&caps[i]<h+30){
				caps[i]=Math.min(h+30,height-capH);
			}
		}
	}else if(mode=="dot"){//圆点模式
		ctx.globalCompositeOperation="lighter";
		for (var i = 0; i < size; i++) {
			//圆点移动
			dots[i].x=(dots[i].x+=dots[i].dx)>width+20?-20:dots[i].x;
			dots[i].y=(dots[i].y+=dots[i].dy)>height+20?-20:dots[i].y;
			var r=arr[i]/256*minHW/8;//+(arr[i]>5?2:0);//每个圆点的半径
			ctx.beginPath();
			ctx.arc(dots[i].x,dots[i].y,r,0,Math.PI*2,true);//(圆心x,y,半径r,起始∠,终止∠,顺逆时针)
			//创建圆形渐变对象  (起点圆x,y,r,终点圆x,y,r)
			var gradR=ctx.createRadialGradient(dots[i].x,dots[i].y,0,dots[i].x,dots[i].y,r);
			gradR.addColorStop(0,"white");
			gradR.addColorStop(0.8,dots[i].color);
			gradR.addColorStop(1,"rgba(255,255,255,0.08)");
			ctx.fillStyle=gradR;
			ctx.fill();
		}
	}else if (mode=="circle") {//环形模式
		var r=minHW*0.42;
		var a=2*Math.PI/size;
		var w=a*r*0.6;
		ctx.translate(width/2,height/2);//原点移到画布中心
		ctx.rotate(rotateSpeed);//环形条绕画布中心旋转一定角度
		for (var i = 0; i <size; i++) {
			ctx.rotate(a*i);
			ctx.fillStyle=gradL2;
			var h=0.2*r*Math.pow(arr[i]/256+0.2,2); 
			ctx.fillRect(0,r-h/2,w,h);
			ctx.rotate(-a*i);
/*
			ctx.fillStyle="green";
			ctx.translate(dots[i].x,dots[i].y);
			ctx.beginPath();

			ctx.arc(0,0,20*arr[i]/256,0,Math.PI*2,true);
			ctx.fill();
			ctx.translate(-dots[i].x,-dots[i].y);
			*/
		}
		ctx.translate(-width/2,-height/2);
	}
}


var musics = $("#music li"); //网页 音乐列表
for (var i = 0; i < musics.length; i++) { //为音乐列表中每一项绑定点击事件
    musics[i].onclick = function() {
        for (var j = 0; j < musics.length; j++) {
            musics[j].className = ""; //取消其他歌曲的选中标记
        }
        this.className = "selected"; //为被点击的歌曲添加选中标记
        mv.play("/media/" + this.title);
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
 		window.onresize();
 	}
}

var volumeBar=$("#volume")[0];//网页 音量滚动条
volumeBar.onchange =function(){ //为音量滚动条绑定 值变化事件
	mv.setVolume(this.value/this.max);
}
volumeBar.onchange();//音量初始化


$("#local-music")[0].onclick=function(){
	$("#upload")[0].click();
}

$("#upload")[0].onchange = function() {
    var file = this.files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);
    $("#music li.selected") && ($("#music li.selected").className = "");
}