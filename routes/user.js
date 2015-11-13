var model = require('../models/_models.js').user;
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
                model.findById(activeUserId, function(errFind, data) {
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
    // All users.
    router.route('/users')
        .get(function(req, res) {
            // Get all users.
            var response = {};
            model.find({}, { 'password': false, '__v': false }, function(errFind, data) {
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
            var newUser = new model();
            var response = {};
            model.findOne({ email: req.body.email }, function(errFind, user) {
                if (errFind) throw errFind;
                if (!user) {
                    model.count({}, function(errCount, count) {
                        if (errCount) throw errCount;
                        var roles = [];
                        if (count == 0) {
                            roles.push('admin');
                        }

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
                            res.json({ 'success': false, 'response': 'Required fields: ' + requiredFields.join(', ') });
                        }
                        else {
                            newUser.email = req.body.email;
                            newUser.password = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                            newUser.roles = roles;
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
                    // User already exist.
                    res.json({ 'success': false, 'response': 'User with same e-mail already exists.' });
                }
            });
        });

    // Specific user.
    router.route('/users/:id')
        .get(function(req, res){
            // Get user by ID.
            var response = {};
            model.findById(req.params.id, { 'password': false, '__v': false }, function(errFind, data) {
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
                        if (isAdmin || isSameUser) {
                            model.findById(req.params.id, function(errFind, data) {
                                if (errFind) {
                                    response = { 'success': false, 'response': 'Error fetching user.'};
                                } else {
                                    if (req.body.email !== undefined) {
                                        // case where email needs to be updated.
                                        data.email = req.body.email;
                                    }
                                    if (req.body.password !== undefined) {
                                        // case where password needs to be updated
                                        data.password = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                                    }
                                    // save the data
                                    data.save(function(errSave){
                                        if (errSave) {
                                            response = { 'success': false, 'response': 'Error updating user!' };
                                        } else {
                                            response = { 'success': true, 'response': 'Data is updated for ' + req.params.id };
                                        }
                                        res.json(response);
                                    })
                                }
                            });
                        }
                        else {
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
                            model.remove({ _id: req.params.id }, function(errDelete, data) {
                                if (errDelete) {
                                    response = { 'success': false, 'response': 'Error deleting user.' };
                                } else {
                                    response = { 'success': true, 'response': data };
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
}
