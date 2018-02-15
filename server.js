var http = require('http');
var config = require('./config/config');
var Persistence = require('./models');
var path = require('path');

Persistence.init();
global.getModel = function (str) {
  str = (str) ? str + '.models' : '';
  return path.resolve('models/models', str);
};
global.secret = '(quem-tem-medo-de-caga-NAOCOME$)!!';


var app = require('./config/express')();
require('./config/database.js')(config.db, config.dbOptions);
require('./config/database.js')(config.staticUri, config.dbOptions);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express Server escutando na porta ' + app.get('port'));
});

module.exports = app;
