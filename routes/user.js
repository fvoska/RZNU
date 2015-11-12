var model = require('../models/_models.js').user;
var authHelper = require('./_authHelper.js');

module.exports = function(router) {
    router.route('/users')
        .get(function(req, res) {
            // Get all users.
            authHelper(req, res, function() {
                var response = {};
                model.find({},function(errFind, data) {
                    if (errFind) {
                        response = { 'success': false, 'response': 'Error fetching users.' };
                    }
                    else {
                        response = { 'success': true, 'response': data };
                    }
                    res.json(response);
                });
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
                    newUser.email = req.body.email;
                    newUser.password = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
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
                else if (user) {
                    // User already exist.
                    res.json({ 'success': false, 'response': 'User with same e-mail already exists.' });
                }
            });
        });
        .post(function(req, res) {
            authHelper(req, res, function() {
                model.findById(req.params.id, function(errFind, data) {
                    if (errFind) {
                        response = { 'success' : false, 'response' : 'Error fetching user.'};
                    } else {
                    // we got data from Mongo.
                    // change it accordingly.
                        if (req.body.email !== undefined) {
                            // case where email needs to be updated.
                            data.email = req.body.email;
                        }
                        if (req.body.password !== undefined) {
                            // case where password needs to be updated
                            data.password = req.body.password;
                        }
                        // save the data
                        data.save(function(errSave){
                            if (errSave) {
                                response = {'error' : true,'message' : 'Error updating user.'};
                            } else {
                                response = {'error' : false,'message' : 'Data is updated for '+req.params.id};
                            }
                            res.json(response);
                        })
                    }
                });
            });
        });
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
        });
}
