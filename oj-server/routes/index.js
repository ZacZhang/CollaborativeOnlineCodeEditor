var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res) {
  // when visit root directory, send index.html to start client side
  res.sendFile("index.html", {root: path.join(__dirname, '../../public/')});
});

module.exports = router;
