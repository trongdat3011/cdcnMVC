
/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'), 
	path = require('path'),
    favicon = require('serve-favicon'),
    errorHandler = require('errorhandler'),
    logger = require('morgan'),
	config = require('./config'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser')
	app = express(),
	MongoClient = require('mongodb').MongoClient,
	Admin = require('./controllers/Admin'),
	Home = require('./controllers/Home'),
	Blog = require('./controllers/Blog'),
	Page = require('./controllers/Page');

// all environments
// app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/templates');
app.set('view engine', 'hjs');
//app.use(favicon((path.join(__dirname, 'public', 'fav.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({secret: "blablabloblo"}));
//app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  	app.use(errorHandler());
}

MongoClient.connect('mongodb://54.169.225.125/kid_locker', function(err, db) {
	if(err) {
		console.log('Sorry, there is no mongo db server running.');
	} else {
		var attachDB = function(req, res, next) {
			req.db = db;
			next();
		};
		app.all('/admin*', attachDB, function(req, res, next) {
			Admin.run(req, res, next);
		});			
		app.all('/blog/:id', attachDB, function(req, res, next) {
			Blog.runArticle(req, res, next);
		});	
		app.all('/blog', attachDB, function(req, res, next) {
			Blog.run(req, res, next);
		});	
		app.all('/services', attachDB, function(req, res, next) {
			Page.run('services', req, res, next);
		});	
		app.all('/careers', attachDB, function(req, res, next) {
			Page.run('careers', req, res, next);
		});	
		app.all('/contacts', attachDB, function(req, res, next) {
			Page.run('contacts', req, res, next);
		});	
		app.all('/', attachDB, function(req, res, next) {
			Home.run(req, res, next);
		});

		http.createServer(app).listen(config.port, function() {
		  	console.log(
		  		'Express server listening on port ' + config.port
		  	);
		});
	}
});
