function MusicVisualizer(obj){
	//定义 XHR 网页请求对象
	this.xhr=new XMLHttpRequest();
	//当前所播放歌曲的 bufferSource
	this.curBufferSource=null;
	//最新的请求编号(即共点击了几次播放按钮，不管是不是同一首歌)
	this.latestId=0;
	//定义 analyserNode 对象，只能对音频进行读取分析，而不进行修改处理
	this.analyserNode=MusicVisualizer.ac.createAnalyser();
	//能量条或圆点的数目，要求是16-1024中2的幂
	this.size=obj.size;
	this.analyserNode.fftSize=this.size*2;
	//定义 gainNode 对象，用于控制音量大小
	this.gainNode=MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();
	//连接顺序： BufferSourceNode --> AnalyserNode --> GainNode --> AudioDestioationNode
	this.analyserNode.connect(this.gainNode);
	this.gainNode.connect(MusicVisualizer.ac.destination);
	//定义可视化绘图方法
	this.draw=obj.draw;
	//启动可视化
	this.visualize();
}

//定义 AudioContext 对象，即Audio环境(上下文)，用于创建各种子节点
MusicVisualizer.ac=new(window.AudioContext||widow.webkitAudioContext)();

//获得url对应的音频数据 (arraybuffer 类型)
MusicVisualizer.prototype.load=function(url,succfun){
	this.xhr.abort();//点击一首歌时，停止上一首歌的请求(即便没有上一次请求)
	this.xhr.open("GET",url);
	this.xhr.responseType="arraybuffer";
	var self=this;
	this.xhr.onload=function(){
		succfun(self.xhr.response);
	}
	this.xhr.send();
}

//音频数据解码
MusicVisualizer.prototype.decode=function(arraybuffer,succfun){
	MusicVisualizer.ac.decodeAudioData(
		arraybuffer,
		function(buffer) {succfun(buffer)},//解码成功调用
		function(err) {console.log(err)}//解码失败调用
	);
}

//播放音乐,传入的 music 可能是 url 字符串，也可能直接就是 arraybuffer (播放本地音乐时)
MusicVisualizer.prototype.play=function(music){
	var self=this;
	var curId=++this.latestId;//curId 表示当前是第几次请求
	this.stop();//停止当前歌曲的播放
	//播放本地音乐时直接传入 arraybuffer
	if(music instanceof ArrayBuffer){
		self.decode(music,function(buffer){
			var bufferSource=MusicVisualizer.ac.createBufferSource();
			bufferSource.buffer=buffer;
			bufferSource.connect(self.analyserNode);
			bufferSource[bufferSource.start?"start":"noteOn"](0);//播放音乐
			self.curBufferSource=bufferSource;
		});
		return;
	}

	this.load(music,function(arraybuffer){
		if(curId!=self.latestId)return;//curId != latestId 说明有新的歌曲请求，当前请求的音乐就不解码播放了
		self.decode(arraybuffer,function(buffer){
			if(curId!=self.latestId)return;//同上
			var bufferSource=MusicVisualizer.ac.createBufferSource();
			bufferSource.buffer=buffer;
			bufferSource.connect(self.analyserNode);
			bufferSource[bufferSource.start?"start":"noteOn"](0);//播放音乐
			self.curBufferSource=bufferSource;
		});
	});
}

//停止当前歌曲的播放
MusicVisualizer.prototype.stop=function(){
	this.curBufferSource && this.curBufferSource[this.curBufferSource.stop?"stop":"noteOff"]();
}

//调整音量
MusicVisualizer.prototype.setVolume=function(percent){
	this.gainNode.gain.value=percent;
}

//可视化实现
MusicVisualizer.prototype.visualize=function(){
	//注： frequencyBinCount 是 AnalyserNode 的一个属性，其值是 fftSize 的一半。
	//getByteFrequencyData() 获得的数组arr的长度即为 frequencyBinCount 。
	//arr 每个元素取值范围为1-256(8位无符号整型)。
	var arr=new Uint8Array(this.analyserNode.frequencyBinCount);
	this.analyserNode.getByteFrequencyData(arr);//将分析得到的数据存入arr中
	requestAnimationFrame=	window.requestAnimationFrame||
									window.webkitRequestAnimationFrame||
									window.mozRequestAnimationFrame;
	var self=this;
	function v(){//v 是用于动态绘图的回调函数
		self.analyserNode.getByteFrequencyData(arr);//获取此刻音频数据
		self.draw(arr);//根据音频数据绘制图像
		requestAnimationFrame(v);//继续更新下一帧动画
	}
	requestAnimationFrame(v);//调用回调函数 v 播放动画
}
