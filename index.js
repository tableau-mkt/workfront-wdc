// Generated on 2015-09-21 using generator-web-data-connector 1.0.0

var express = require('express'),
    request = require('request'),
    atob = require('atob'),
    workfrontApi = require('workfront-api'),
    app = express(),
    port = process.env.PORT || 9001;

// Serve files as if this were a static file server.
app.use(express.static('./'));

// Proxy the index.html file.
app.get('/', function (req, res) {
  res.sendFile('./index.html');
});

// Create a proxy endpoint.
app.get('/proxy', function (req, res) {
  // Note that the "buildApiFrom(path)" helper in main.js sends the API endpoint
  // as a header variable to our proxy. We read that in here and build the real
  // endpoint we want to hit.
  var apiParts = JSON.parse(req.header('workfrontapi')),
      username = atob(apiParts.username),
      password = atob(apiParts.password),
      objType = apiParts.objType,
      options = apiParts.options,
      workfront = workfrontApi.ApiFactory.getInstance({
        url: apiParts.url,
        version: '4.0'
      });

  var setApiKey = function() {
    // Basic Authentication (username is filled out)
    if (username) {
      // Retrieve the API token for this account.
      return workfront.getApiKey(username, password);
    }
    else {
      workfront.httpParams.apiKey = password;
      return Promise.resolve(true);
    }
  };

  // Always use GET.
  workfront.httpOptions.alwaysUseGet = true;

  // Make an HTTP request using the above specified options.
  setApiKey().then(workfront.search(objType, options).then(
    function(data) {
      res.set('content-type', 'application/json');
      res.send(data);
    },
    function(error) {
      res.sendStatus(500);
      console.log('Get failure. Received data:');
      console.log(error);
    }
  ));
});

var server = app.listen(port, function () {
  var port = server.address().port;
  console.log('Express server listening on port ' + port);
});

module.exports = app;
