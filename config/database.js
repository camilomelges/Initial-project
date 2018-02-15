var mongoose = require('mongoose');
var config = require('../config/config');

module.exports = function(uri, options) {

  if(uri === config.db) mongoose.connect(uri, options);

  if (process.env.NODE_ENV !== 'test') {
    mongoose.set('debug', false);
  }

  mongoose.connection.on('connected', function(){
    console.log('Mongoose! Conectado em ' + uri);
  });

  mongoose.connection.on('disconnected', function(){
    console.log('Mongoose! Disconectado de ' + uri);
  });

  mongoose.connection.on('error', function(erro){
    console.log('Mongoose! Erro na conexão: ' + erro);
  });

  process.on('SIGINT', function(){
    mongoose.connection.close(function(){
      console.log('Mongoose! Desconectado pelo término da aplicação');
      //
      //0 indica que a finalização ocorreu sem erros
      process.exit(0);
    });
  });

};
