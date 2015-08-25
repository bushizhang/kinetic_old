var express = require('express');
var app = express();

// public folder
app.use(express.static('app'));

// view engine
app.set('view engine', 'ejs');

// main route
app.get('/', function (req, res) {
  res.render('index');
});

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});