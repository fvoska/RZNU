var config = require('../config.js');

var mongoose = require('mongoose');
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error: '));
db.once('open', function (callback) {
    console.log('Connected to Mongo at ' + config.database);
});

module.exports = mongoose;
