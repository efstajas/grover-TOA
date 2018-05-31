require("./index.sass");
require("jquery");
var Shake = require('shake.js');
var io = require("socket.io-client");
var socket = io("192.168.2.138:3000");

if(window.DeviceMotionEvent){
  window.addEventListener("devicemotion", motion, false);
  $("#data").text("Accelerometer initialized");
}else{
  console.log("DeviceMotionEvent is not supported");
}

function motion(event){
  $("#data").text("Accelerometer: "
    + event.accelerationIncludingGravity.x + ", "
    + event.accelerationIncludingGravity.y + ", "
    + event.accelerationIncludingGravity.z
  );
}

var myShakeEvent = new Shake({
    threshold: 0.4, // optional shake strength threshold
    timeout: 300 // optional, determines the frequency of event generation
});
myShakeEvent.start();
socket.emit("motion","true");


window.addEventListener('shake', shakeEventDidOccur, false);
var counter = 0; 

//function to call when shake occurs
function shakeEventDidOccur () {
	counter++;
    //put your own code here etc.
    socket.emit("motion","true - " + counter);
}