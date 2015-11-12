var model = require('../models/_models.js').user;
var authHelper = require('./_authHelper.js');

module.exports = function(router) {
    // All users.
    router.route('/users')
        .get(function(req, res) {
            // Get all users.
            var response = {};
            model.find({}, function(errFind, data) {
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
            model.findOne({
                email: req.body.email
            }, function(errFind, user) {
                if (errFind) throw errFind;
                if (!user) {
                    model.count({}, function(errCount, count) {
                        if (errCount) throw errCount;
                        var roles = [];
                        if (count == 0) {
                            roles.push('admin');
                        }

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
            model.findById(req.params.id, function(errFind, data) {
                if (errFind) {
                    response = { 'success': false, 'response': 'Error fetching user.' };
                } else {
                    response = { 'success': true, 'response': data };
                }
                res.json(response);
            });
        })
        .post(function(req, res) {
            authHelper(req, res, function() {
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
            });
        })
        .delete(function(req, res) {
            authHelper(req, res, function() {
                model.remove({ _id: req.params.id }, function(errDelete, data) {
                    if (errDelete) {
                        response = { 'success': false, 'response': 'Error deleting user.' };
                    } else {
                        response = { 'success': true, 'response': data };
                    }
                    res.json(response);
                });
            });
        });
}
