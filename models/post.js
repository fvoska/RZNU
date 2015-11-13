var mongoose = require('./_mongo.js');

var collectionName = 'posts';
var postSchema  = new mongoose.Schema(
    {
        'byUser': String,
        'title': String,
        'content': String,
        'date': { type: Date, default: Date.now }
    },
    {
        'collection': collectionName
    }
);

module.exports = mongoose.model(collectionName, postSchema);
