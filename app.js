
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var mongoose = require('mongoose');
var app = express();

// use a shared config to access credentials for mongo etc
var config = require('./config/config.js');
var port = Number(process.env.PORT || 3000);
config.PORT = parseInt(port);
config.production = config.PORT !== 3000;
config.mongourl = config.production ? config.mongourlProduction : config.mongourlDevelopment;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// setup page and API routing
app.use('/', routes);

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(config.mongourl, {

  // configuration / options

}, (function (err, connection) {

  console.log("Mongo Connection Result: " + (err || "No Error"));

}));

module.exports = app;
