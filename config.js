var fs = require('fs');

module.exports = {
    'httpPort': '8080',
    'httpsPort': '8081',
    'secret': 'lemmiwinks92',
    'secretExpire': '1h',
    'database': 'mongodb://localhost:27017/rznu',
    'ssl_key': fs.readFileSync('./ssl/server.key'),
    'ssl_cert': fs.readFileSync('./ssl/server.crt'),
    'ssl_ca': fs.readFileSync('./ssl/ca.crt'),
    'logFile': './log.txt'
};
