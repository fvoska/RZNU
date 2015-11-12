// Express app.
var config = require('./config.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var uaParser = require('ua-parser-js');

// Set parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended' : false}));

var router = express.Router();
// Logging.
router.use(function(req, res, next) {
    var ua = uaParser(req.headers['user-agent']);
    console.log('%s %s %s', req.method, req.path, ua.browser.name + '-v-' + ua.browser.version);
    next();
});

// Set routes.
require('./routes/_routes.js')(router);
app.use('/api', router);

// Set index page.
app.use('/', express.static('frontend'));
/*
var path = require('path');
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});*/

// Listen on HTTP and HTTPS
var https = require('https');
var http = require('http');
var sslOptions = {
    key: config.ssl_key,
    cert: config.ssl_cert,
    ca: config.ssl_ca,
    requestCert: true,
    rejectUnauthorized: false
};

http.createServer(app).listen(8080);
https.createServer(sslOptions, app).listen(8081);
