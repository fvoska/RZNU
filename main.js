// Express app.
var config = require('./config.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Set parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended' : false}));

// Set routes.
var router = express.Router();
require('./routes/_routes.js')(router);
app.use('/api', router);

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
