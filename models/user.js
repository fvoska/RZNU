var mongoose = require('./_mongo.js');

var collectionName = 'users';
var userSchema  = new mongoose.Schema(
    {
        'userEmail': String,
        'userPassword': String
    },
    {
        'collection': collectionName
    }
);

module.exports = mongoose.model(collectionName, userSchema);
