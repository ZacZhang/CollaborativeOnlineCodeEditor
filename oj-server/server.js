var express = require('express');
var app = express();
var restRouter = require("./routes/rest");
var indexRouter = require("./routes/index");
var mongoose = require("mongoose");
var path = require("path");
var http = require('http');

var socket_io = require('socket.io');
var io = socket_io();
var SocketService = require('./services/SocketService')(io);

// connect to MongoDb
mongoose.connect("mongodb://user:user@ds139909.mlab.com:39909/coj");

// if a http request static files, it will return files in public directory
app.use(express.static(path.join(__dirname, '../public')));

// when visit root directory, then indexRouter will handle it
app.use('/', indexRouter);

// if a http request starts from "/api/v1", then restRouter will handle it
app.use("/api/v1", restRouter);

app.use(function (req, res) {
  // send index.html to start client side
  res.sendFile("index.html", {root: path.join(__dirname, '../public/')});
});


var server = http.createServer(app);
io.attach(server);
server.listen(3000);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  throw error;
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr == 'string'
    ? 'pipe' + addr
    : 'port' + addr.port;
  console.log('Listening on ' + bind);
}










