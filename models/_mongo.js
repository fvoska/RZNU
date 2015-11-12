var mongoose = require('mongoose');
mongoose.connect(require('../config.js').database);
module.exports = mongoose;
