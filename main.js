// Express app.
var config = require('./config.js');
var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var uaParser = require('ua-parser-js');
var fs = require('fs');
var cors = require('cors')

// Set parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended' : false }));

// Logging.
fs.open(config.logFile, 'wx', function (err, fd) {
    if (err) {
        //console.log('Log file ' + require('path').resolve(config.logFile) + ' exists.');
    }
    else {
        fs.close(fd, function (err) {
            if (!err) {
                console.log('Log file ' + require('path').resolve(config.logFile) + ' created.');
            }
        });
    }
});
console.log('Logging to file: ' + require('path').resolve(config.logFile));
router.use(function(req, res, next) {
    var ua = uaParser(req.headers['user-agent']);
    var logPart = req.method + '\t' + req.path + '\t' + ua.browser.name + ' ' + ua.browser.version + '\n';
    fs.appendFile(config.logFile, logPart, function (err) {
        if (err) {
            console.log('Error saving to log.');
        }
    });
    next();
});

// Set routes.
require('./routes/_routes.js')(router);
app.use('/api', router);

// Set index page.
app.use('/', express.static('frontend'));

// Generic errors.
app.use(function(err, req, res, next){
    res.json({ 'success': false, 'response': err });
    console.log(err);
});

// CORS.
app.use(cors());

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
