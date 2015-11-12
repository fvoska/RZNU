var model = require('../models/_models.js').user;
var config = require('../config.js');
var jwt = require('jsonwebtoken');

module.exports = function(router) {
    router.route('/auth').post(function(req, res) {
        // find the user
        model.findOne({
            userEmail: req.body.email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.json({ 'success': false, 'response': 'Authentication failed. User not found.' });
            }
            else if (user) {
                // check if password matches
                var hashedPass = require('crypto').createHash('sha1').update(req.body.password).digest('base64');
                if (hashedPass != user.userPassword) {
                    res.json({ 'success': false, 'response': 'Authentication failed. Wrong password.' });
                }
                else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({ 'userId': user._id }, config.secret, {
                        expiresIn: config.secretExpire // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({ 'success': true, 'response': 'Enjoy your token!', 'token': token });
                }
            }
        });
    });
}
