module.exports = function(router) {
    router.get('/', function(req,res) {
        res.json({ 'success': true, 'response' : 'API HOME' });
    });
}
