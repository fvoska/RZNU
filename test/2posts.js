var config = require('../config.js');

var supertest = require('supertest');
var should = require('should');

var server = supertest.agent('http://localhost:8080/api');

describe('Posts', function() {
    var userId;
    var token;
    var userId2nd;
    var token2nd;
    var postId;
    var postId2nd;
    var postId3rd;
    describe('GET', function() {
        it('GET /posts should return no posts on empty DB', function(done) {
            server
            .get('/posts')
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
        it('GET /posts/does_not_exist should return no posts', function(done) {
            server
            .get('/posts/does_not_exist')
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No post with id: does_not_exist');
                done();
            });
        });
    });
    describe('Auth', function() {
        it('Get user ID', function(done) {
            server
            .get('/users')
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.body.success.should.equal(true);
                userId = res.body.response[0]._id;
                done();
            });
        });
        it('Get key', function(done) {
            server
            .post('/auth')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '4321' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.body.success.should.equal(true);
                token = res.body.token;
                done();
            });
        });
    });
    describe('PUT', function() {
        it('PUT /posts should not add post without auth', function(done) {
            server
            .put('/posts')
            .set('User-Agent', config.testUA)
            .send({ 'email': 'filip.voska@gmail.com', 'password': '1234' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No token provided.');
                done();
            });
        });
        it('PUT /posts check required fields', function(done) {
            server
            .put('/posts')
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('Required fields: title, content');
                done();
            });
        });
        it('PUT /posts should add post with proper auth', function(done) {
            server
            .put('/posts')
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .send({ 'title': 'title1', 'content': 'content1' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Post added.');
                postId = res.body.newPostID;
                done();
            });
        });
        it('GET /posts/:id should return first post', function(done) {
            server
            .get('/posts/' + postId)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response._id.should.equal(postId);
                res.body.response.title.should.equal('title1');
                res.body.response.content.should.equal('content1');
                res.body.response.byUser.should.equal(userId);
                done();
            });
        });
        it('GET /users/firstUserId/posts should return first post', function(done) {
            server
            .get('/users/' + userId + '/posts')
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.length.should.equal(1);
                res.body.response[0].byUser.should.equal(userId);
                done();
            });
        });
        it('Create 2nd user', function(done) {
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
                userId2nd = res.body.newUserID;
                done();
            });
        });
        it('Auth 2nd user', function(done) {
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
        it('PUT /posts 2nd post by 2nd user', function(done) {
            server
            .put('/posts')
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .send({ 'title': 'title2', 'content': 'content2' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Post added.');
                postId2nd = res.body.newPostID;
                done();
            });
        });
        it('PUT /posts 3rd post by 2nd user', function(done) {
            server
            .put('/posts')
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .send({ 'title': 'title3', 'content': 'content3' })
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Post added.');
                postId3rd = res.body.newPostID;
                done();
            });
        });
    });
    describe('POST', function() {
        it('POST /posts/:id should not edit without token', function(done) {
            server
            .post('/posts/' + postId)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No token provided.');
                done();
            });
        });
        it('POST /posts/:id 2nd user can not edit 1st user\'s post', function(done) {
            server
            .post('/posts/' + postId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('You do not have permissions to edit this post.');
                done();
            });
        });
        it('POST /posts/:id 2nd user can edit his post', function(done) {
            server
            .post('/posts/' + postId2nd)
            .send({ 'content': 'content2e' })
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Data is updated for ' + postId2nd);
                done();
            });
        });
        it('POST /posts/:id 1st user (admin) can edit 2nd user\'s post', function(done) {
            server
            .post('/posts/' + postId2nd)
            .send({ 'content': 'content2a' })
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.should.equal('Data is updated for ' + postId2nd);
                done();
            });
        });
        it('GET /posts/:id check if edited', function(done) {
            server
            .get('/posts/' + postId2nd)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.content.should.equal('content2a');
                done();
            });
        });
    });
    describe('DELETE', function() {
        it('DELETE /posts/:id can\'t delete without auth', function(done) {
            server
            .del('/posts/' + postId)
            .set('User-Agent', config.testUA)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('No token provided.');
                done();
            });
        });
        it('DELETE /posts:id 2nd user can not delete 1st user\'s post', function(done) {
            server
            .del('/posts/' + postId)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(false);
                res.body.response.should.equal('You do not have permissions to remove this post.');
                done();
            });
        });
        it('DELETE /posts:id 2nd user can delete his post', function(done) {
            server
            .del('/posts/' + postId3rd)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token2nd)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.n.should.equal(1);
                res.body.response.ok.should.equal(1);
                done();
            });
        });
        it('DELETE /posts:id admin user can delete other user\'s post', function(done) {
            server
            .del('/posts/' + postId2nd)
            .set('User-Agent', config.testUA)
            .set('x-access-token', token)
            .expect('Content-type',/json/)
            .expect(200)
            .end(function(err,res) {
                res.status.should.equal(200);
                res.body.success.should.equal(true);
                res.body.response.n.should.equal(1);
                res.body.response.ok.should.equal(1);
                done();
            });
        });
    })
});
