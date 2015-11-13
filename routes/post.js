var model = require('../models/_models.js');
var authHelper = require('./_authHelper.js');
var jwt = require('jsonwebtoken');
var config = require('../config.js');

function checkUserTokenMatch(req, targetUserId, callback) {
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;

    // Check if token is set.
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (!err) {
                activeUserId = decoded.userId;
                if (String(activeUserId) == String(targetUserId)) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback(false);
            }
        });
    }
    else callback(false);;
}

function checkIfAdmin(req, callback) {
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;

    // Check if token is set.
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (!err) {
                activeUserId = decoded.userId;
                model.post.findById(activeUserId, function(errFind, data) {
                    if (errFind) {
                        callback(false);
                    } else if (data) {
                        if (data.roles.indexOf('admin') > -1) {
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    }
                    else {
                        callback(false)
                    }
                });
            }
            else {
                callback(false);
            }
        });
    }
    else callback(false);;
}

module.exports = function(router) {
    // All posts.
    router.route('/posts')
        .get(function(req, res) {
            // Get all posts.
            var response = {};
            model.post.find({}, { '__v': false }, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'Error fetching posts.' };
                }
                else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        })
        .put(function(req, res) {
            authHelper(req, res, function(userId) {
                // Create new post.
                var newPost = new model.post();
                var response = {};
                var requiredFields = [];
                var reqIncomplete = false;
                if (!req.body.title) {
                    reqIncomplete = true;
                    requiredFields.push('title');
                }
                if (!req.body.content) {
                    reqIncomplete = true;
                    requiredFields.push('content');
                }

                if (reqIncomplete) {
                    res.json({ 'success': false, 'response': 'Required fields: ' + requiredFields.join(', ') });
                }
                else {
                    model.user.findById(userId, function(errFind, data) {
                        if (!errFind && data) {
                            newPost.byUser = userId;
                            newPost.title = req.body.title;
                            newPost.content = req.body.content;
                            newPost.save(function(errSave, insertedPost){
                                if (errSave) {
                                    response = { 'success': false, 'response': 'Error adding new post.' };
                                }
                                else {
                                    response = { 'success': true, 'response': 'Post added.', 'newPostID': insertedPost.id};
                                }
                                res.json(response);
                            });
                        }
                        else {
                            res.json({ 'success': false, 'response': 'No user with id: ' + req.body.byUser });
                        }
                    });
                }
            });
        });

    // Specific post.
    router.route('/posts/:id')
        .get(function(req, res){
            // Get post by ID.
            var response = {};
            model.post.findById(req.params.id, { 'password': false, '__v': false }, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'No post with id: ' + req.params.id };
                } else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        })
        .post(function(req, res) {
            // Change post details.
            authHelper(req, res, function() {
                model.post.findById(req.params.id, function(errFind, data) {
                    if (errFind) {
                        response = { 'success': false, 'response': 'Error fetching post.'};
                    } else {
                        checkIfAdmin(req, function(isAdmin) {
                            checkUserTokenMatch(req, data.byUser, function(isSameUser) {
                                if (isAdmin || isSameUser) {
                                    if (req.body.title !== undefined && req.body.title != "") {
                                        // case where email needs to be updated.
                                        data.title = req.body.title;
                                    }
                                    if (req.body.content !== undefined && req.body.content != "") {
                                        // case where password needs to be updated
                                        data.content = req.body.content;
                                    }
                                    // save the data
                                    data.save(function(errSave){
                                        if (errSave) {
                                            response = { 'success': false, 'response': 'Error updating post!' };
                                        } else {
                                            response = { 'success': true, 'response': 'Data is updated for ' + req.params.id };
                                        }
                                        res.json(response);
                                    })
                                }
                                else {
                                    res.json({ 'success': false, 'response': 'You do not have permissions to edit this post.' });
                                }
                            });
                        });
                    }
                });
            });
        })
        .delete(function(req, res) {
            authHelper(req, res, function() {
                model.post.findById(req.params.id, function(errFind, data) {
                    if (errFind) {
                        res.json({ 'success': false, 'response': 'Error fetching post.'});
                    } else if (data) {
                        checkIfAdmin(req, function(isAdmin) {
                            checkUserTokenMatch(req, data.byUser, function(isSameUser) {
                                if (isAdmin || isSameUser) {
                                    model.post.remove({ _id: req.params.id }, function(errDelete, data) {
                                        if (errDelete) {
                                            response = { 'success': false, 'response': 'Error deleting post.' };
                                        } else {
                                            response = { 'success': true, 'response': data };
                                        }
                                        res.json(response);
                                    });
                                }
                                else {
                                    res.json({ 'success': false, 'response': 'You do not have permissions to remove this post.' });
                                }
                            });
                        });
                    }
                    else {
                        res.json({ 'success': false, 'response': 'Error fetching post.'});
                    }
                });
            });
        });
}
