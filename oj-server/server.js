const express = require('express');
const app = express();
const restRouter = require("./routes/rest");
const indexRouter = require("./routes/index");
const mongoose = require("mongoose");
const path = require("path");
const http = require('http');
const socket_io = require('socket.io');
const io = socket_io();
const SocketService = require('./services/SocketService')(io);

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


let server = http.createServer(app);
io.attach(server);
server.listen(3000);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  throw error;
}

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe' + addr
    : 'port' + addr.port;
  console.log('Listening on ' + bind);
}

