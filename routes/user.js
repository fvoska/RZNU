var model = require('../models/_models.js').user;
var authHelper = require('./_authHelper.js');

module.exports = function(router) {
    router.route('/users')
        .get(function(req,res){
            authHelper(req, res, function() {
                var response = {};
                model.find({},function(err,data){
                    if(err) {
                        response = { 'success': false, 'response': 'Error fetching data' };
                    }
                    else {
                        response = { 'success': true, 'response': data };
                    }
                    res.json(response);
                });
            });
        })
        .put(function(req,res){
            var db = new model();
            var response = {};
            db.email = String(req.body.email);
            db.password = require('crypto').createHash('sha1').update(String(req.body.password)).digest('base64');
            db.save(function(err){
                if(err) {
                    response = { 'success': false, 'response': 'Error adding data' };
                }
                else {
                    response = { 'success': true, 'response': 'Data added' };
                }
                res.json(response);
            });
        });
    router.route('/users/:id')
        .get(function(req,res){
            var response = {};
            model.findById(req.params.id,function(err,data){
                if(err) {
                    response = { 'success' : false,'response' : 'Error fetching data' };
                } else {
                    response = { 'success' : true, 'response' : data };
                }
                res.json(response);
            });
        });
}
