var config = require('../config.js');

var supertest = require('supertest');
var should = require('should');

var server = supertest.agent('http://localhost:8080/api');
// Empty database.
var model = require('../models/_models.js');
model.user.remove({}, function(err) {
   console.log('Users collection cleared');
});
model.post.remove({}, function(err) {
   console.log('Posts collection cleared');
});

describe('API Home', function(){
    it('Should return API Home', function(done){
        server
        .get('')
        .set('User-Agent', config.testUA)
        .expect('Content-type',/json/)
        .expect(200)
        .end(function(err,res){
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.response.should.equal('API HOME');
            done();
        });
    });
});
