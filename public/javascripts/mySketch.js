var  rotateAll = 0;
var  depth, flashTimer = 0;
var fullScreenMode = true;
var flash=false;

var sound;
var musics;
var volumeBar;
var volumePercent;

function $(s){
  return document.querySelectorAll(s);
}

function tryToPlay(countsLeft){
   countsLeft=countsLeft||20;
   if(countsLeft==0){
      console.log("音频资源加载较慢，取消自动播放");
      return;
   }
   if(sound.isLoaded()){
      sound.stop();
      sound.loop();
      sound.setVolume(volumePercent);
      return;
   }
   setTimeout(tryToPlay,500,--countsLeft);
}

function htmlElementInit(){
   volumeBar=$("#volume")[0];
   volumeBar.onchange =function(){
      volumePercent=this.value/this.max;
      sound&&sound.setVolume(volumePercent);
   }
   volumeBar.onchange();

   musics = $("#music li");
   for (var i = 0; i < musics.length; i++) {
      musics[i].onclick = function() {
         for (var j = 0; j < musics.length; j++) {
            musics[j].className = "";
         }
         this.className = "selected";
         if (sound&&sound.isPlaying()) {
            sound.stop();
         }
         sound=loadSound('/media/'+this.title);
         tryToPlay();
      }
   }
}

function preload(){
  if(musics){
    sound=loadSound('/media/'+musics[0].title);
  }
}

function setup(){
  strokeWeight(5);
  let cnv = createCanvas(windowWidth, windowHeight,WEBGL);
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT();
  background(0);
  rectMode(CENTER);
  frameRate(15);

  htmlElementInit();
}

function draw()
{
   background(0, 20, 20);
   lights();
   rotateX(-PI/16);
   push();
   rotateAll+=0.007;
   rotateY(rotateAll);
   if (rotateAll>255)
      rotateAll = 0;

   if (flash) {
      if (flashTimer > 100) {
         flash = false;
         flashTimer = 0;
      } else {
         flashTimer++;
         background(255 / flashTimer*2, 100 / flashTimer*2, 0);
      }
   }

   for (var  i=0; i<24; i++) {


      push();
      strokeWeight(4)
      rotateY(PI+i*50);

      translate(200, 100, 0);
      var m=(fft.waveform()[i]*150/volumePercent);
      if(m<65)m=m*0.6;
      if(m>100)m=m*2;
      if(m>70)m=m*1.2;
      if (m > 100) {

         if ((i>0 &&i<20)&& m > 200) {
            flash = true;
         }

         stroke(255, 100, 0); 
         fill(255, 0, 0, 10);
      } else {
         stroke(0, 239, 135); 
         fill(0, 254, 179, 33);
      }
      box(50, m -90, 50);  //lerp(display[i], target[i], 1-sensitivity);

      pop();
   }

   pop();
}

function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else if(sound.isLoaded()){
    sound.loop();
  }
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight,WEBGL);
}
