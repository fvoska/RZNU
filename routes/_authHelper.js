var jwt = require('jsonwebtoken');
var config = require('../config.js');

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
                console.log(decoded);
                // Callback function to continue request processing.
                callback(req, res);
            }
        });
    } else {
        // No token is set.
        return res.status(403).send({ 'success': false, 'response': 'No token provided.' });
    }
}
