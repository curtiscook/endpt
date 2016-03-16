var express = require('express');
var fs = require('fs');
var app = express();
var sendgrid = require("sendgrid")(process.env.SEND_GRID);
var email = new sendgrid.Email();
var Slack = require('slack-node');

var apiToken = process.env.API_TOKEN;
var slack = new Slack(apiToken);

email.addTo("curtis@blendlabs.com");
email.setFrom("noreply@blendlabs.com");
email.setSubject("Webhooks Test");

app.use(express.bodyParser());

app.get('/', function(req, res){
    console.log('GET /')
    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/', function(req, res){
    console.log('POST /');
    console.dir(req.body);
    res.writeHead(200, {'Content-Type': 'text/html'});
    var reqText = JSON.stringify(req.body, null, '\t');
    console.log(reqText);
    email.setText(reqText);

    slack.api('chat.postMessage', {
      username: '@bailey',
      channel: '#web-hook-testing',
      text: reqText
    }, function(err, response) {
      console.log(response);
    });


    sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }
          console.log(json);
    });
    res.end('thanks');
});

port = 3000;
app.listen(port);
console.log('Listening at http://localhost:' + port)
