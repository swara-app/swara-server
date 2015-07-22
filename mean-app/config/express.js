'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:express'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  socketio = require('socket.io'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  passport = require('passport'),
  mongoStore = require('connect-mongo')({
    session : session
  }),
  flash = require('connect-flash'),
  config = require('./config'),
  consolidate = require('consolidate'),
  path = require('path');

module.exports = function (db) {
  // Initialize express app
  debug('Initializing a new express app...');
  var app = express();

  // Globbing model files
  debug('Reading the app data models...');
  config.getGlobbedFiles(__dirname + '/../app/models/**/*.js').forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  // Logs Directory has been set already from main.js
  debug('Logs Directory: %s', global.logsDirectory);

  // Setting application local variables
  debug('Setting up the local variables');
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;
  app.locals.jsFiles = config.getJavaScriptAssets();
  app.locals.cssFiles = config.getCSSAssets();
  app.locals.appLogFile = global.logsDirectory + config.appLogFile;
  app.locals.libraryLogFile = global.logsDirectory + config.libraryLogFile;

  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    next();
  });

  // Should be placed before express.static
  app.use(compress({
    filter : function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level  : 9
  }));

  // Showing stack errors
  app.set('showStackError', true);

  // Set swig as the template engine
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'server.view.html');
  app.set('views', __dirname + '/../app/views');

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended : true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // CookieParser should be above session
  app.use(cookieParser());

  // Express MongoDB session storage
  app.use(session({
    cookie            : {
      maxAge : config.cookieMaxAge
    },
    saveUninitialized : true,
    resave            : true,
    secret            : config.sessionSecret,
    store             : new mongoStore({
      mongooseConnection : db.connection,
      collection         : config.sessionCollection
    })
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages
  app.use(flash());

  // Use helmet to secure Express headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  // Setting the app router and static folder
  app.use(express.static(path.resolve(__dirname + '/../public')));

  // Globbing routing files
  config.getGlobbedFiles(__dirname + '/../app/routes/**/*.js').forEach(function (routePath) {
    require(path.resolve(routePath))(app);
  });

  // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
  app.use(function (err, req, res, next) {
    // If the error object doesn't exists
    if (!err) return next();

    // Log it
    console.error(err.stack);

    // Error page
    res.status(500).render('500', {
      error : err.stack
    });
  });

  // Assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).render('404', {
      url   : req.originalUrl,
      error : 'Not Found'
    });
  });

  if (process.env.NODE_ENV === 'secure') {
    // Log SSL usage
    console.log('Securely using https protocol');

    // Load SSL key and certificate
    var privateKey = fs.readFileSync(__dirname + '/sslcerts/key.pem', 'utf8');
    var certificate = fs.readFileSync(__dirname + '/sslcerts/cert.pem', 'utf8');

    // Create HTTPS Server
    var httpsServer = https.createServer({
      key  : privateKey,
      cert : certificate
    }, app);

    // Return HTTPS server instance
    return httpsServer;
  }

  // Attach Socket.io
  var server = http.createServer(app);
  var io = socketio.listen(server);
  app.set('socketio', io);
  app.set('server', server);

  // Return Express server instance
  return app;
};
