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
                // Token verified correctly.
                activeUserId = decoded.userId;
                if (String(activeUserId) == String(targetUserId)) {
                    // Check if user id from token matches target user id.
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
                // Token verified correctly.
                activeUserId = decoded.userId;
                // Find if user with ID from token exists.
                model.user.findById(activeUserId, function(errFind, data) {
                    if (errFind) {
                        callback(false);
                    } else if (data) {
                        // Check if that user is admin.
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
    // All users.
    router.route('/users')
        .get(function(req, res) {
            // Get all users.
            var response = {};
            model.user.find({}, { 'password': false, '__v': false }, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'Error fetching users.' };
                }
                else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        })
        .put(function(req, res) {
            // Create new user.
            var newUser = new model.user();
            var response = {};
            model.user.findOne({ email: req.body.email }, function(errFind, user) {
                if (errFind) throw errFind;
                if (!user) {
                    model.user.count({}, function(errCount, count) {
                        if (errCount) throw errCount;
                        var roles = [];
                        if (count == 0) {
                            roles.push('admin');
                        }

                        // Check if required fields are set.
                        var requiredFields = [];
                        var reqIncomplete = false;
                        if (!req.body.email) {
                            reqIncomplete = true;
                            requiredFields.push('email');
                        }
                        if (!req.body.password) {
                            reqIncomplete = true;
                            requiredFields.push('password');
                        }

                        if (reqIncomplete) {
                            // Not all required fields are set.
                            res.json({ 'success': false, 'response': 'Required fields: ' + requiredFields.join(', ') });
                        }
                        else {
                            // Set values.
                            newUser.email = req.body.email;
                            newUser.password = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                            newUser.roles = roles;

                            // Add user.
                            newUser.save(function(errSave, insertedUser){
                                if (errSave) {
                                    response = { 'success': false, 'response': 'Error adding new user.' };
                                }
                                else {
                                    response = { 'success': true, 'response': 'User added.', 'newUserID': insertedUser.id};
                                }
                                res.json(response);
                            });
                        }
                    });
                }
                else if (user) {
                    // User with same email already exist.
                    res.json({ 'success': false, 'response': 'User with same e-mail already exists.' });
                }
            });
        });

    // Specific user.
    router.route('/users/:id')
        .get(function(req, res){
            // Get user by ID.
            var response = {};
            model.user.findById(req.params.id, { 'password': false, '__v': false }, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'No user with id: ' + req.params.id };
                } else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        })
        .post(function(req, res) {
            // Change user details.
            authHelper(req, res, function() {
                checkIfAdmin(req, function(isAdmin) {
                    checkUserTokenMatch(req, req.params.id, function(isSameUser) {
                        // Check permissions.
                        if (isAdmin || isSameUser) {
                            // Fetch user for editing.
                            model.user.findById(req.params.id, function(errFind, data) {
                                if (errFind) {
                                    response = { 'success': false, 'response': 'Error fetching user.'};
                                } else if (data) {
                                    // Change values is they are set in request.
                                    if (req.body.email !== undefined && req.body.email != '') {
                                        data.email = req.body.email;
                                    }
                                    if (req.body.password !== undefined && req.body.password != '') {
                                        data.password = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                                    }

                                    // Save changes
                                    data.save(function(errSave){
                                        if (errSave) {
                                            response = { 'success': false, 'response': 'Error updating user!' };
                                        } else {
                                            response = { 'success': true, 'response': 'Data is updated for ' + req.params.id };
                                        }
                                        res.json(response);
                                    })
                                }
                                else {
                                    res.json({ 'success': false, 'response': 'No user with id: ' + req.parems.id });
                                }
                            });
                        }
                        else {
                            // Only admin and user X can edit user X.
                            res.json({ 'success': false, 'response': 'You do not have permissions to edit this user.' });
                        }
                    });
                });
            });
        })
        .delete(function(req, res) {
            authHelper(req, res, function() {
                checkIfAdmin(req, function(isAdmin) {
                    checkUserTokenMatch(req, req.params.id, function(isSameUser) {
                        if (isAdmin || isSameUser) {
                            model.user.remove({ _id: req.params.id }, function(errDelete, data) {
                                if (errDelete) {
                                    response = { 'success': false, 'response': 'Error deleting user.' };
                                } else {
                                    response = { 'success': true, 'response': data };
                                    // data.n == 0 if user with that id doesn't exist / was already deleted.
                                }
                                res.json(response);
                            });
                        }
                        else {
                            res.json({ 'success': false, 'response': 'You do not have permissions to delete this user.' });
                        }
                    });
                });
            });
        });

    // Posts by User
    router.route('/users/:id/posts')
        .get(function(req, res){
            // Get user by ID.
            var response = {};
            model.post.find({ byUser: req.params.id }, { '__v': false }, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'User with id: ' + req.params.id + ' has no posts' };
                } else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        });
}
