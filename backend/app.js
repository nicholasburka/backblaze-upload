var express = require('express');
var path = require('path');
var logger = require('morgan');

//get the SSL cert for HTTPS
//from https://stackoverflow.com/questions/11744975/enabling-https-on-express-js

var fs = require('fs');
var http = require('http');
var https = require('https');
const privKey = fs.readFileSync('/etc/letsencrypt/live/server1.nicholasab.com/privkey.pem', 'utf8');
const cert = fs.readFileSync('/etc/letsencrypt/live/server1.nicholasab.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/server1.nicholasab.com/fullchain.pem', 'utf8');
var creds = {key: privKey, cert: cert, ca: ca};

//end of above citation

var getUploadDetailsHandler = require('./routes/getUploadDetails');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/getUploadDetails', getUploadDetailsHandler);
//app.get('/', (req, res) => {
//  res.send('hello world');
//});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(creds, app);

httpServer.listen(80);
httpsServer.listen(443);

module.exports = app;
