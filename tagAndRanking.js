var express = require('express')
  , stylus = require('stylus')
  , mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId
	;
	

// pagenater
// little bit of design
// tag editing


// TODO 3. consider view count ranking
// TODO 3. user view record page > use capped collection?
// TODO 3. expire code
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


// var TagSchema = new Schema({
//     name : { type : String }
// //  , posts : [ { type : ObjectId, ref : 'Post' }]
// });


var PostSchema = new Schema( {	
	  author : { type : ObjectId, ref : 'User', required : true }
  , title : { type : String, required : true }
  , description : { type : String, required : true }
  , view_count : { type : Number , default : 1 }
  , tags : [ String ]
  , published_at : { type : Date, default : Date.now }
  , content : { type : String, required : true }
});

// TODO : if anonymouse, use IP address
var ViewSchema = new Schema({
    postId : { type : ObjectId, ref : 'Post', required : true }
  , userId : { type : ObjectId, ref : 'User' }
  , ipAddress : String
  , date : { type : Date, default : Date.now }
  //, last_viewed : { type : Date, default : Date.now }
});


        

var User = mongoose.model('User', UserSchema)
  , Post = mongoose.model('Post', PostSchema)
  , View = mongoose.model('View', ViewSchema)
//  , Tag = mongoose.model('Tag', TagSchema)
  ;
//Post.ensureIndex({ tags.name : 1 });
//  Post.ensureIndex({ author : 1 });
//Post.ensureIndex({ tags : 1 });



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
  res.render('login', {
    title: 'login'
  });  
});


app.post('/session', findOrCreateUser, function (req, res) {
      //TODO : should avoid expose user info?
    req.session.isLoggedIn = true;
    req.session.user = req.user;
    //TODO : before login, should store redirect url somewhere
    res.redirect('/');
});

// TODO : use upsert
function findOrCreateUser(req, res, next) {
  var name = req.body.username;
  User.findOne({ name : name }, function (err, doc) {
    if(err || !doc) {
        var user = new User({
            name : name
        });
        user.save(function (err2, doc2) {
            if(err2) {
              // TODO what to do? implement error
              console.log('error err2===================');
              res.redirect('/login');
            }
            req.user = {
                name : name
              , userId : doc2._id
            }
            next();
        });
    } else {
        doc.last_login = new Date();
        doc.save();
        req.user = {
            name : doc.name
          , userId : doc._id
        }
        next();
    }
  });  
}

app.get('/post', function (req, res) {
  res.render('post', {
    title : 'post'
  })
});


app.get('/post/:id', loadPostById, function (req, res) {
  // TODO : search IP address
  var postId = req.params.id
    , viewProp = { postId : postId };
  
  if(!req.session.isLoggedIn) {
    var ipAddress = getClientIp(req);
    console.log('ipAddress : ' + ipAddress);
    viewProp.ipAddress = ipAddress;
  } else {
    viewProp.userId = req.session.user.userId;
  }
  
  View.findOne(viewProp, function (err, doc) {
      if(err || !doc) {
        var view = new View(viewProp);
        view.save();
        req.post['view_count'] += 1;
        req.post.save();
      }
  });
  
  res.render('postView', {
      title : 'post'
    , post : req.post
  });  
});


function loadPostById (req, res, next) {
  var postId = req.params.id;  
  Post.findById(postId)
    .populate('author', ['name'])
    .exec(function(err, doc) {
      if(doc) {
        req.post = doc;
        next();
      } else {
        // define error
        res.send('cant find post', 400);
        return;
      }        
  });
}


function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

// TODO see if request has session
// TODO can do multiple edit?
app.post('/tag/create/:id', function(req, res) {
  console.log('tag create');
  var tagname = req.body.tagname;
  console.log(JSON.stringify(req.body));
  if(!tagname || tagname === '') {
    console.log('dont have tagname');
    res.json('you need specify tagname', 400);
    return;    
  }
  
  Post.findById(req.params.id, function(err, doc) {
    if(err || !doc) {
      console.log('there is no such post id');
      res.json('there is no such post id', 400);
    } else {
      // TODO see if duplicate      
      doc.tags.push(tagname);
      doc.save(function(err, doc) {
        if(err) {
          res.json('internal server error', 500);
        } else {
          console.log('ok');
          res.json('ok', 200); 
        }
      });
    }
  });
});

//TODO
app.post('/tag/destroy/:id', function(req, res) {
  
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
  User.findOne({name : name }, function (err, doc) {
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

app.get('/search', function (req, res) {
  console.log('search');  
  var query = req.query;
  console.log('query : ' + query);
  var tag = query.tag;
  console.log('tag : ' + tag);
  Post.find({tags : tag}, function (err, docs) {
    res.render('search', {
        title : 'search'
      , posts : docs
    });
  });  
});


app.get('/ranking', function (req, res) {
    Post.find({})
      .sort( 'view_count', -1 )
      .populate('author', ['name'])
      .exec(function (err, docs) {
          if(err || !docs) {
              console.log('errorrrr');
              console.log('JSON.stringify(err) : ' + JSON.stringify(err));              
              res.send(500);
          } else {
              console.log('JSON.stringify(docs) : ' + JSON.stringify(docs));            
              res.render('search', {
                  title : 'ranking'
                , posts : docs
              });
          }
      });
});


app.get('/about', function (req, res) {
  res.render('about', {
    title : 'about'
  });
});


function UserLoadError(msg){
  this.name = 'UserLoadError';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

function InternalServerError(msg) {
  this.name = 'InternalServerError';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

// TODO : when create Error, specify redirectUrl or json msg
app.error(function(err, req, res, next) {
  if(err instanceof UserLoadError) {
    console.log('user load error');
    res.redirect('/post');
  } else if ( err instanceof InternalServerError) {
    //res.
  }
  next();
});


app.listen(3000);

console.log('Go to http://local.host:3000');

