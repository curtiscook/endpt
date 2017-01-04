var express = require('express');
var fs = require('fs');
var app = express();
var rateLimit = require('express-rate-limit');
var limiter = rateLimit();
app.use(limiter);

const HipChat = require('node-hipchat');
const HC = new HipChat(process.env.HIPCHAT_TOKEN);
const HCRoom = process.env.HIPCHAT_ROOM;

app.use(express.bodyParser());

app.get('/', function(req, res){
    console.log('GET /');
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var html = '<html><body><form method="post" action="' + fullUrl +
    '">Name:<input type="text" name="name" /><input type="submit" value="Submit" /></form></body>'
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/', function(req, res){
    console.log('POST /');
    console.dir(req.body);
    res.writeHead(200, {'Content-Type': 'text/html'});
    var reqText = JSON.stringify(req.body, null, '\t');
    var reqHeaders = JSON.stringify({
      headers: req.headers, 
      hostname: req.hostname,
      ip: req.ip
    }, null, '\t');
    console.log(reqHeaders);
    console.log(reqText);
    var params = {
      room: HCRoom,
      from: "Webhook",
      message: (reqHeaders + '\n' + reqText)
    };

    HC.postMessage(params, function(data) {
      console.log(params);
    }); 
    res.end('thanks');
});

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname));
app.listen(app.get('port'), function() {
  console.log('Listening at http://localhost:' + app.get('port'));
});

