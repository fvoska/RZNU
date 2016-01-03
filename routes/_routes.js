module.exports = function(router) {
    require('./auth.js')(router);
    require('./home.js')(router);
    require('./user.js')(router);
    require('./post.js')(router);
    require('./stats.js')(router);
};
