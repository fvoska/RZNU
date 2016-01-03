var child_process = require('child_process');
var apicache = require('apicache');
var cache = apicache.middleware;

module.exports = function(router) {
  router.get('/stats/endpoints', cache('5 minutes'), function(req, res) {
    child_process.exec('hadoop dfs -rm -R /out_endpoint*', function(errorDel, stdoutDel, stderrDel) {
      child_process.exec('hadoop dfs -copyFromLocal -f ' + GLOBAL.dirname + '/log.txt /log.txt', function(errorCopy, stdoutCopy, stderrCopy) {
        child_process.exec('hadoop jar ' + GLOBAL.dirname + '/hadoop/EndpointCount.jar EndpointCount /log.txt /out_endpoint', function(errorEnpoint, stdoutEndpoint, stderrEndpoint) {
          child_process.exec('hadoop jar ' + GLOBAL.dirname + '/hadoop/SortByValue.jar SortByValue /out_endpoint/part-00000 /out_endpoint_sorted', function(errorSortEndpoint, stdoutSortEndpoint, stderrSortEndpoint) {
            child_process.exec('hadoop dfs -cat /out_endpoint_sorted/part-00000', function(errorListEndpoint, stdoutListEndpoint, stderrListEndpoint) {
              var output = [];
              var endpoints = stdoutListEndpoint.split('\n');
              for (var i = 0; i < endpoints.length; i++) {
                if (endpoints[i] != '') {
                  var split = endpoints[i].split('\t');
                  output.push({
                    'endpoint': split[1],
                    'visits': parseInt(split[0])
                  });
                }
              }
              return res.json({ 'success': true, 'response': output });
            });
          });
        });
      });
    });
  });

  router.get('/stats/browsers', cache('5 minutes'), function(req,res) {
    child_process.exec('hadoop dfs -rm -R /out_browser*', function(errorDel, stdoutDel, stderrDel) {
      child_process.exec('hadoop dfs -copyFromLocal -f ' + GLOBAL.dirname + '/log.txt /log.txt', function(errorCopy, stdoutCopy, stderrCopy) {
        child_process.exec('hadoop jar ' + GLOBAL.dirname + '/hadoop/BrowserCount.jar BrowserCount /log.txt /out_browser', function(errorBrowser, stdoutBrowser, stderrBrowser) {
          child_process.exec('hadoop jar ' + GLOBAL.dirname + '/hadoop/SortByValue.jar SortByValue /out_browser/part-00000 /out_browser_sorted', function(errorSortBrowser, stdoutSortBrowser, stderrSortBrowser) {
            child_process.exec('hadoop dfs -cat /out_browser_sorted/part-00000', function(errorListBrowser, stdoutListBrowser, stderrListBrowser) {
              var output = [];
              var browsers = stdoutListBrowser.split('\n');
              for (var i = 0; i < browsers.length; i++) {
                if (browsers[i] != '') {
                  var split = browsers[i].split('\t');
                  output.push({
                    'browser': split[1],
                    'visits': parseInt(split[0])
                  });
                }
              }
              return res.json({ 'success': true, 'response': output });
            });
          });
        });
      });
    });
  });

  router.get('/stats/clear', function(req,res) {
    apicache.clear();
    return res.json({ 'success': true, 'response': 'cleared stats' });
  });
}
