var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var convert = require('color-convert');
var osc = require("osc");

var udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 57121,
    metadata: true,
    remotePort: 9000,
    remoteAddress: "localhost"
});
var intensityVal = 0.25;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var motionInterval;
var moving = false;

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var lights = [];
var devices = []; 

var currentColor = "red";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post("/color", function(req,res) {
  console.log("GOT COLOR REQUEST");
  console.log("-- " + req.body.color);

  //io.to("screens").emit("color", req.body.color, function(err) {
  //  console.log("--sent color to screens");
  //});
  currentColor = convert.keyword.rgb(req.body.color);

  io.to("screens").emit("color",convert.keyword.rgb(req.body.color));
  io.to("lights").emit("color",convert.keyword.rgb(req.body.color));

  res.sendStatus(200);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

udpPort.open();

udpPort.on("ready", function () {
    udpPort.send({
        address: "/intensity",
        args: [
            {
                type: "f",
                value: 0.5
            }
        ]
    });
    console.log("SENT OUT OSC");
});

io.on('connection', function(socket){
  console.log('a client connected');
  socket.on('disconnect', function(){
    console.log('client disconnected');
  });

  socket.on('light', function(msg) {
    console.log("-- idenfifies as light.");
    this.join("lights");
    this.emit("color",currentColor);

    setInterval(motionDetected, 70);
  });

  socket.on('screen', function(msg) {
    console.log("-- idenfifies as screen.");
    this.join("screens");
    this.emit("color",currentColor);
  })

  socket.on('motion', function(msg){
    motionDetected();
    console.log('received MOTION event from ' + this.client.conn.id);
    console.log('-- from room ' + JSON.stringify(this.rooms));
  });
});

function motionDetected() {
  clearTimeout(motionInterval);
  motionInterval = setTimeout(endMotion, 500);

  if (!moving) {
    io.to("lights").emit("blink", "true");
    console.log("send motion true event");
  }

  moving = true;
  resetMotionOSC();
}

function endMotion() {
  moving = false;
  console.log("-- call end motion");
  io.to("lights").emit("blink", "false");
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var bigger = true; 

setInterval(sendMotionOSC, 70);
function sendMotionOSC() {
  if (intensityVal > 0.25) {
    bigger = true;
    udpPort.send({
        address: "/intensity",
        args: [
            {
                type: "f",
                value: intensityVal
            }
        ]
    });
    intensityVal = intensityVal - 0.03;
  } else {
    
    if (bigger) console.log("-- motion OSC envelope ended, stop sending");
    bigger = false;
  }
  
};

function resetMotionOSC() {
  console.log("-- reset motion OSC");
  console.log("-- start motion OSC envelope... sending");
  intensityVal = 0.75;
}


module.exports = app;