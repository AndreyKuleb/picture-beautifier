var express = require('express');
var app = express();
var bodyParser = require('body-parser')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('../client'));


app.get('/test', function (req, res) {
  res.send('Тест');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
