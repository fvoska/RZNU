var jwt = require('jsonwebtoken');
var config = require('../config.js');
var model = require('../models/_models.js').user;

module.exports = function(req, res, callback) {
    // Get access token.
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;

    // Check if token is set.
    if (token) {
        // Verify token.
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                // Throw error.
                return res.json({ 'success': false, 'response': 'Failed to authenticate token.' });
            } else {
                activeUserId = decoded.userId;
                model.findById(activeUserId, function(errFind, data) {
                    if (!errFind && data) {
                        // Callback function to continue request processing.
                        callback();
                    }
                    else {
                        return res.json({ 'success': false, 'response': 'User with provided token does not exist!' });
                    }
                });
            }
        });
    } else {
        // No token is set.
        return res.json({ 'success': false, 'response': 'No token provided.' });
    }
}
