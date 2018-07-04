require("./tablet.sass");
var iro = require("@jaames/iro");
var io = require("socket.io-client");
var socket = io("192.168.1.139:3000");
var NoSleep = require("nosleep.js");

var demoColorPicker = new iro.ColorPicker("#color-picker-container", {
	height: 800 ,
	width: 800
});

demoColorPicker.on("input:end", function(color) {
  socket.emit('color', color.rgb);
  console.log("new color: " + color.rgb);
});

socket.on("connect", function(data) {
	socket.emit("tablet");
});

var noSleep = new NoSleep();

function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('click', enableNoSleep, false);


