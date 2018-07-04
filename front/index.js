require("./index.sass");
require("jquery");
var Shake = require('shake.js');
var io = require("socket.io-client");
var socket = io("192.168.1.139:3000");
var NoSleep = require("nosleep.js");

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
    threshold: 0.8, // optional shake strength threshold
    timeout: 400 // optional, determines the frequency of event generation
});
myShakeEvent.start();
socket.emit("motion","true - " + counter);
blink();


socket.on("connect", function(data) {
	socket.emit("screen");

	socket.on("color", function(data) {
		console.log("got color! " + data);
		$("body").css("background-color", "rgb(" + data + ")");
	});

    socket.on("blink", function(data) {
        console.log("got color! " + data);
        blink(true);
    });
});




window.addEventListener('shake', shakeEventDidOccur, false);
var counter = 0; 

//function to call when shake occurs
function shakeEventDidOccur () {
	counter++;
    //put your own code here etc.
    socket.emit("motion","true - " + counter);
    blink();
}

function blink(lowIntensity) {
	if (lowIntensity) {
        $("#overlay").css("opacity",0.2);
    } else {
        $("#overlay").css("opacity",0.8);
    }
	setTimeout(blinkDeactivate, 100);
}

function blinkDeactivate() {
	$("#overlay").css("opacity",0);
}

//////

function colorToRGBA(color) {
    // Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
    // color must be a valid canvas fillStyle. This will cover most anything
    // you'd want to use.
    // Examples:
    // colorToRGBA('red')  # [255, 0, 0, 255]
    // colorToRGBA('#f00') # [255, 0, 0, 255]
    var cvs, ctx;
    cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data;
}

function byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0'+num.toString(16)).slice(-2);
}

function colorToHex(color) {
    // Convert any CSS color to a hex representation
    // Examples:
    // colorToHex('red')            # '#ff0000'
    // colorToHex('rgb(255, 0, 0)') # '#ff0000'
    var rgba, hex;
    rgba = colorToRGBA(color);
    hex = [0,1,2].map(
        function(idx) { return byteToHex(rgba[idx]); }
        ).join('');
    return "#"+hex;
}

var noSleep = new NoSleep();

function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('click', enableNoSleep, false);
