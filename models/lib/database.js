var mongoose = require('mongoose');
var logs = require('./custom-logs');
var logErro = logs.error;
var logSuccess = logs.success;

module.exports = function(uri, options) {


  mongoose.connect(uri, options);

  if (process.env.NODE_ENV != 'test') {
    mongoose.set('debug', true);
  }

  mongoose.connection.on('connected', function(){
    logSuccess('[persistence-god]: Success! Conectado em ' + uri);
  });

  mongoose.connection.on('disconnected', function(){
    console.log('[persistence-god]: Mongoose! Disconectado de ' + uri);
  });

  mongoose.connection.on('error', function(erro){
    logErro('[persistence-god]: ERRO! Erro na conexão: ' + erro);
  });

  process.on('SIGINT', function(){
    mongoose.connection.close(function(){
      console.log('[persistence-god]: Mongoose! Desconectado pelo término da aplicação');
      //
      //0 indica que a finalização ocorreu sem erros
      process.exit(0);
    });
  });

};
