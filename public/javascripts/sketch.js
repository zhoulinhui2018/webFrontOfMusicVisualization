var  rotateAll = 0;
var  depth, flashTimer = 0;
var fullScreenMode = true;
var flash=false;


function preload(){
  sound = loadSound('/media/Nite Nite.mp3');
}

function setup(){
  strokeWeight(5);
  let cnv = createCanvas(1520, 700, WEBGL);
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT();
  background(0);
  rectMode(CENTER);
  frameRate(15);

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
      var m=(fft.waveform()[i]*150);
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
  } else {
    sound.loop();
  }
}