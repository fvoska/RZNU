var mongoose = require('./_mongo.js');

var collectionName = 'users';
var userSchema  = new mongoose.Schema(
    {
        'email': String,
        'password': String,
        'roles': [String]
    },
    {
        'collection': collectionName
    }
);

module.exports = mongoose.model(collectionName, userSchema);
