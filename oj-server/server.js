var express = require('express');
var app = express();
var restRouter = require("./routes/rest");
var indexRouter = require("./routes/index");
var mongoose = require("mongoose");
var path = require("path");

// connect to MongoDb
mongoose.connect("mongodb://user:user@ds139909.mlab.com:39909/coj");

// if a http request static files, it will return files in public directory
app.use(express.static(path.join(__dirname, '../public')));

// when visit root directory, then indexRouter will handle it
app.use('/', indexRouter);

// if a http request starts from "/api/v1", then restRouter will handle it
app.use("/api/v1", restRouter);

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
