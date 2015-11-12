module.exports = function(router) {
    require('./_auth.js')(router);
    require('./home.js')(router);
    require('./user.js')(router);
};
