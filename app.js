var express = require('express');
var app = express();

// public folder
app.use(express.static('app'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// view engine
app.set('view engine', 'ejs');

// main route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});