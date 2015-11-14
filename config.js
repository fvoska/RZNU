var fs = require('fs');

module.exports = {
    'httpPort': '8080',
    'httpsPort': '8081',
    'secret': 'lemmiwinks92',
    'secretExpire': '1h',
    'database': 'mongodb://localhost:27017/rznu_tests',
    'ssl_key': fs.readFileSync('./ssl/server.key'),
    'ssl_cert': fs.readFileSync('./ssl/server.crt'),
    'ssl_ca': fs.readFileSync('./ssl/ca.crt'),
    'logFile': './log.txt',
    'testUA': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
};
