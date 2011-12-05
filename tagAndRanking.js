var express = require('express')
  , stylus = require('stylus')
  , mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId
	;
	

// pagenater
// little bit of design



// TODO 2. every user can edit tag

// TODO 3. consider view count ranking

// TODO 4. deploy them

// TODO 5. validation and so on.
// TODO 6. try unit test

// TODO 7. add omment


mongoose.connect('mongodb://localhost/mydb');

var UserSchema = new Schema({
    name  :  { type: String, index: { unique : true } } 
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
        

var User = mongoose.model('User', UserSchema)
  , Post = mongoose.model('Post', PostSchema);






// Configuration

function compile(str, path) {
  return stylus(str)
    .import(__dirname + '/stylesheets/mixins')
    .set('filename', path)
    .set('warn', true)
    .set('compress', true);
}


// var app = express.createServer(
//     express.bodyParser()
//   , express.static(__dirname + "/public")
//   , express.cookieParser()
//   , express.session({ secret: 'htuayreve'})
//   , stylus.middleware({ 
//         src: __dirname ,
//         dest: __dirname + '/public',
//         compile: compile
//     })
// 
//   , express.errorHandler()
//  // , everyauth.middleware()
// );
var app = express.createServer();

app.configure( function() {
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
 /// app.use(express.methodOverride());
  app.use(stylus.middleware({ 
       src: __dirname
     , dest: __dirname + '/public'
     , compile: compile
  }));  
  app.use(express.static(__dirname + "/public"));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(app.router);
//  app.use(express.errorHandler());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});


app.get('/', loadPosts, function (req, res) {
	console.log('index====');
	if(req.session) {
     console.log('JSON.stringify(req.session) : ' + JSON.stringify(req.session));       
  }
  var posts = req.posts || { };
  console.log('JSON.stringify(posts) : ' + JSON.stringify(posts));
  
  res.render('index', {
      title : 'home'
    , posts : posts
  });
});

function loadPosts(req, res, next) {
  Post.find({})
    .populate('author', ['name'])
//    .limit(5)
    .exec(function(err, docs) {
      if(docs) {       
        req.posts = docs;
      }
      next();
    });
}

app.get('/login', function (req, res) {
  console.log('req.query.username : ' + req.query.username);  
  var name = req.query.username;
      //pass = req.query.password;
  if(name) {
//    console.log('pass : ' + pass);    
    req.session.isLoggedIn = true;
    req.session.user = {
      name : name
    };
    findOrCreateUser(name);
    res.redirect('/');
  } else {
    res.render('login', {
      title: 'login'
    });
  }
});

function findOrCreateUser(name) {
  User.findOne({name : name }, function(err, doc) {
    if(err || !doc) {
      var user = new User({
        name : name
      })
      user.save();
    } else {
      doc.last_login = new Date();
      doc.save();
    }
  });  
}

app.get('/post', function (req, res) {
  res.render('post', {
    title : 'post'
  })
});

app.get('/post/:id', function(req, res) {
        
  Post.findById(req.params.id)
    .populate('author', ['name'])
    .exec(function(err, doc) {      
      if(doc) {
          res.render('postView', {
              title : 'post'
            , post : doc
          });
      } else {
          console.log('I dont have that');
          res.send(404);
      }
  });
});



app.post('/post', loadUser, function (req, res) {
  var body = req.body  
    , title = body.title
    , description = body.description
    , content = body.content
    , id = req._id
    ;

  var post = new Post({
      author : id
    , title : title
    , description : description
    , content : content
  });
  
  post.save();  

  res.redirect('/');  
});

function loadUser(req, res, next) {
  var name = req.session.user.name;
  User.findOne({name : name }, function(err, doc) {
    if(err) {
      console.log('error cant find ObjectId');
      next(new UserLoadError());
    }
    req._id = doc._id;
    next();
  });
}
// 
app.get('/logout', function (req, res) {
  console.log('logout');
  if(req.session.isLoggedIn) {
    req.session.destroy();    
  } else {
    console.log('===========not loggedin============');   
  }
  res.redirect('/');
});


app.get('/about', function(req, res) {
  res.render('about', {
    title : 'about'
  });
});

function UserLoadError(msg){
  this.name = 'UserLoadError';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

app.error(function(err, req, res, next) {
  if(err instanceof UserLoadError) {
    console.log('user load error');
    res.redirect('/post');
  }
  next();
});


app.listen(3000);

console.log('Go to http://local.host:3000');

