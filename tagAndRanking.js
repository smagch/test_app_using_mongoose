var express = require('express');
	stylus = require('stylus'),
//	everyauth = require('everyauth'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
// TODO 1. first of all, login and create post
// show posts
// TODO 2. every user can edit tag

// TODO 3. consider view count ranking

// TODO 4. deploy them

// TODO 5. validation and so on.
// TODO 6. try unit test

// TODO 7. add omment

mongoose.connect('mongodb://localhost/testtest');

var UserSchema = new Schema({
    name  :  { type: String }
  , last_login  :  { type: Date, default: Date.now }
  , posts : [ { type : ObjectId, ref : 'Post' } ]
});

var PostSchema = new Schema( {	
	author : { type : ObjectId, ref : 'User' }
  , title : { type : String, required : true }
  , description : { type : String }
//  , views : { type : Number , default : 0 }
//  , tags : [ { type : String } ]
  , published_at : { type : Date, default : Date.now }
  , content : { type : String }
});


var User = mongoose.model('users', UserSchema)
  , Comment = mongoose.model('comment', CommentSchema);

var app = express.createServer();




// Configuration

function compile(str, path) {
  return stylus(str)
    .import(__dirname + '/stylesheets/mixins')
    .set('filename', path)
    .set('warn', true)
    .set('compress', true);
}


var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/public")
  , express.cookieParser()
  , express.session({ secret: 'htuayreve'})
  // , stylus.middleware({ 
  // 		src: __dirname ,
  //  		dest: __dirname + '/public',
  //    	compile: compile
  //  	})
  , everyauth.middleware()
);

app.configure( function () {
  	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
});

app.get('/', function (req, res) {
  	res.render('index', {
		title : 'home'
	});
});

app.get('/account', function(req, res) {
	if(req.loggedIn) {
		res.render('account');
	} else {
		console.log('not loggedin');
		res.redirect('/');
	}
});

everyauth.helpExpress(app);

app.listen(3000);

console.log('Go to http://local.host:3000');

// app.configure(function(){
//   app.set('views', __dirname + '/views');
//   app.set('view engine', 'jade');
//   app.use(express.bodyParser());
//   app.use(express.cookieParser());
//   app.use(express.session({ secret: 'ddfssf'}));
//   app.use(express.methodOverride());
//   app.use(stylus.middleware({ 
// 	src: __dirname ,
//   	dest: __dirname + '/public',
//     compile: compile
//   }));
//   everyauth.middleware();
//   app.use(app.router);
//   app.use(express.static(__dirname + '/public'));
// 
// });
// 
// everyauth.helpExpress(app);
// 
// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
// });
// 
// app.configure('production', function(){
//   app.use(express.errorHandler()); 
// });
// 
// // Routes
// 
// app.get('/', function(req, res){
//   res.render('index', {
//     title: 'Home'
//   });
// });
// 
// app.get('/about', function(req, res){
//   res.render('about', {
//     title: 'About'
//   });
// });
// 
// app.get('/contact', function(req, res){
//   res.render('contact', {
//     title: 'Contact'
//   });
// });
// 
// app.listen(3000);
// console.log('everyauth.twitter.entryPath(); : ' + everyauth.twitter.entryPath());
// 
// console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
