var config = require('../config.js');

var supertest = require('supertest');
var should = require('should');

var server = supertest.agent('http://localhost:8080/api');

describe('Users', function() {
    var firstUserId;
    var secondUserId;
    var token;
    var token2nd;
    describe('GET', function() {
        it('GET /users should return no users on empty DB', function(done) {
            server
            .get('/users')
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.length.should.equal(0);
                done();
            });
        });
        it('GET /users/does_not_exist should return no users', function(done) {
            server
            .get('/users/does_not_exist')
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No user with id: does_not_exist');
                done();
            });
        });
    });
    describe('PUT', function() {
        it('PUT /users should add user', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '1234' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('User added.');
                firstUserId = res.body.newUserID;
                done();
            });
        });
        it('GET /users/firstUserId should return first user', function(done) {
            server
            .get('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.email.should.equal('filip.voska@gmail.com');
                done();
            });
        });
        it('First added user should be admin', function(done) {
            server
            .get('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.roles[0].should.equal('admin');
                done();
            });
        });
        it('PUT /users should add 2nd user', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@outlook.com', 'password': 'rznu' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('User added.');
                secondUserId = res.body.newUserID;
                done();
            });
        });
        it('PUT /users needs email (empty)', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': '', 'password': 'junk' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Required fields: email');
                done();
            });
        });
        it('PUT /users needs password (empty)', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'junk', 'password': '' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Required fields: password');
                done();
            });
        });
        it('PUT /users needs email (no field)', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'password': 'junk' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Required fields: email');
                done();
            });
        });
        it('PUT /users needs password (no field)', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'junk' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Required fields: password');
                done();
            });
        });
        it('PUT /users shouldn\'t allow adding user with same email', function(done) {
            server
            .put('/users')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '1234' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('User with same e-mail already exists.');
                done();
            });
        });
    });
    describe("Authorization", function() {
        it('POST /auth should authorize', function(done) {
            server
            .post('/auth')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '1234' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Enjoy your token!');
                token = res.body.token;
                done();
            });
        });
        it('POST /auth should authorize (2nd user)', function(done) {
            server
            .post('/auth')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@outlook.com', 'password': 'rznu' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Enjoy your token!');
                token2nd = res.body.token;
                done();
            });
        });
    });
    describe("POST", function() {
        it('POST /users/:id shouldn\'t edit without token', function(done) {
            server
            .post('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .send({ 'password': '4321' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No token provided.');
                done();
            });
        });
        it('POST /users/:id shouldn\'t edit with badly formated token', function(done) {
            server
            .post('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', 'xyz')
            .send({ 'password': '4321' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Failed to authenticate token.');
                done();
            });
        });
        it('POST /users/:id should change password with correct token', function(done) {
            server
            .post('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .send({ 'password': '4321' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Data is updated for ' + firstUserId);
                done();
            });
        });
        it('POST /users/:id 2nd user (non-admin) can not change 1st user\'s data', function(done) {
            server
            .post('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .send({ 'password': 'rznu' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('You do not have permissions to edit this user.');
                done();
            });
        });
        it('POST /users/:id 2nd user (non-admin) can change his own data', function(done) {
            server
            .post('/users/' + secondUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .send({ 'password': 'rznu' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Data is updated for ' + secondUserId);
                done();
            });
        });
        it('POST /users/:id 1st user (admin) can change 2nd user\'s data', function(done) {
            server
            .post('/users/' + secondUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .send({ 'password': 'rznu' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Data is updated for ' + secondUserId);
                done();
            });
        });
        it('POST /auth with old password doesn\'t get token', function(done) {
            server
            .post('/auth')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '1234' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Authentication failed. Wrong password.');
                done();
            });
        });
        it('POST /auth with new password gets token', function(done) {
            server
            .post('/auth')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '4321' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Enjoy your token!');
                token = res.body.token;
                done();
            });
        });
    });
    describe("DELETE", function() {
        it('DELETE /user/:id second user (non-admin) can not delete first user', function(done) {
            server
            .del('/users/' + firstUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('You do not have permissions to delete this user.');
                done();
            });
        });
        it('DELETE /user/:id non-existing ID check', function(done) {
            server
            .del('/users/xyz')
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Error deleting user.');
                done();
            });
        });

        it('DELETE /user/:id delete 2nd user', function(done) {
            server
            .del('/users/' + secondUserId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.ok.should.equal(1);
                res.body.response.n.should.equal(1);
                done();
            });
        });
    });
});
