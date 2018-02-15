var express = require('express'),
  load = require('express-load'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  morgan = require('morgan'),
  config = require('./config'),
  path = require('path'),
  cors = require('cors'),
  swig = require('swig'),
  helmet = require('helmet'),
  _ = require('lodash');

module.exports = function () {

  var app = express();

  //variável de ambiente
  var port = process.env.PORT || config.port || 80;
  app.set('port', port);

  function isAllowed(req, res, next) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === "candidate") return next();
    if (_.includes(req.hostname, 'automobi.com.br') || _.includes(req.hostname, 'agendamentoweb.com')) return next();

    return res.redirect('https://automobi.com.br');
  }

  app.use(isAllowed);
  // view engine setup
  swig = new swig.Swig();
  app.engine('ejs', swig.renderFile);
  app.set('view engine', 'ejs');
  app.set('views', path.join('core/views'));
  app.use(morgan('dev'));

  //middleware

  if (process.env.NODE_ENV === 'production') {
    app.use(function (req, res, next) {
      if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
      }
      else
        next();
    });
  }
  if (process.env.NODE_ENV !== 'development' || process.env.NODE_ENV !== 'candidate') {
    app.use(helmet());
  }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'candidate') {
    app.use(express.static(path.resolve('dist')));
  } else {
    app.use(express.static(path.resolve('client')));
    app.use(express.static(path.resolve('.tmp')));
  }

  app.use('/public', express.static(path.resolve('core/public/')));
  app.use(bodyParser.urlencoded({extended: true}));
  //app.use(bodyParser.json());
  //TODO: Remover esse limite gigante do body-parser
  app.use(bodyParser.json({limit: '150mb'}));
  app.use(require('method-override')());

  var corsOptions = {
    origin: [/\.automobi\.com.br$/, /automobi\.com.br$/, /agendamentoweb\.com$/, /\.agendamentoweb\.com$/, /meucarro\.co$/, /\.meucarro\.co$/],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
  };
  app.use(cors(corsOptions));

  //mapeando diretórios para não precisar usar 'require'


  load('utils', {cwd: 'core', verbose: false})
    .then('lego-connect')
    .then('controllers')
    .then('routes')
    .into(app, function (err, instance) {
      if (err) throw err.name;

    });

  app.use(function (err, req, res, next) {
    if (!err) return next();

    console.error(err.stack);
    res.status(500).json({
      error: err.name
    });
  });

  app.use(function (req, res) {
    res.status(404).json({
      url: req.originalUrl,
      error: 'Not Found'
    });
  });


  return app;
};
