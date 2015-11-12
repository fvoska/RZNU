var model = require('../models/_models.js').user;
var config = require('../config.js');
var jwt = require('jsonwebtoken');

module.exports = function(router) {
    router.route('/auth').post(function(req, res) {
        // Find the user.
        model.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) throw err;
            if (!user) {
                // User doesn't exist.
                res.json({ 'success': false, 'response': 'Authentication failed. User not found.' });
            }
            else if (user) {
                // Check password.
                var hashedPass = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                if (hashedPass != user.password) {
                    // Wrong password.
                    res.json({ 'success': false, 'response': 'Authentication failed. Wrong password.' });
                }
                else {
                    // Generate token if everything is OK.
                    var token = jwt.sign({ 'userId': user._id }, config.secret, {
                        expiresIn: config.secretExpire // expires in 24 hours
                    });
                    // Return token.
                    res.json({ 'success': true, 'response': 'Enjoy your token!', 'token': token });
                }
            }
        });
    });
}
