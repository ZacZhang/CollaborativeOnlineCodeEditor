var express = require('express');
var app = express();
var restRouter = require("./routes/rest");
var mongoose = require("mongoose");

// connect to MongoDb
mongoose.connect("mongodb://user:user@ds139909.mlab.com:39909/coj");

// if a http request starts from "/api/v1", then restRouter will handle it
app.use("/api/v1", restRouter);

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
