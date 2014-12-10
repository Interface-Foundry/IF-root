/*
_|_|_|              _|                              _|_|                              
  _|    _|_|_|    _|_|_|_|    _|_|    _|  _|_|    _|        _|_|_|    _|_|_|    _|_|  
  _|    _|    _|    _|      _|_|_|_|  _|_|      _|_|_|_|  _|    _|  _|        _|_|_|_|
  _|    _|    _|    _|      _|        _|          _|      _|    _|  _|        _|      
_|_|_|  _|    _|      _|_|    _|_|_|  _|          _|        _|_|_|    _|_|_|    _|_|_|
                                                                                      
_|_|_|_|                                    _|                    
_|        _|_|    _|    _|  _|_|_|      _|_|_|  _|  _|_|  _|    _|
_|_|_|  _|    _|  _|    _|  _|    _|  _|    _|  _|_|      _|    _|
_|      _|    _|  _|    _|  _|    _|  _|    _|  _|        _|    _|
_|        _|_|      _|_|_|  _|    _|    _|_|_|  _|          _|_|_|
                                                                _|
                                                            _|_|  

  interfacefoundry.com <3 <3 <3 

  v0.6 Illya 
*/

var fs = require('fs');
var im = require('imagemagick'); //must also install imagemagick package on server /!\
var async = require('async');
var moment = require('moment');
var http = require('http');
var connectBusboy = require('connect-busboy');
var mmm = require('mmmagic'), Magic = mmm.Magic;
var configDB = require('./components/IF_auth/database.js');
var mailerTransport = require('./components/IF_mail/IF_mail.js');
var crypto = require('crypto');
var validator = require('validator');
var passport = require('passport');
var flash    = require('connect-flash');
var urlify = require('urlify').create({
  addEToUmlauts:true,
  szToSs:true,
  spaces:"_",
  nonPrintable:"_",
  trim:true
});
var request = require('request');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser = require('body-parser');

//--- BUBBLE ROUTING ----//
var worlds_query = require('./components/IF_bubbleroutes/worlds_query');

//----MONGOOOSE & SCHEMAS----//
var mongoose = require('mongoose'),
    landmarkSchema = require('./components/IF_schemas/landmark_schema.js'),
    styleSchema = require('./components/IF_schemas/style_schema.js'),
    projectSchema = require('./components/IF_schemas/project_schema.js'),
    User = require('./components/IF_schemas/user_schema.js'), //temp? need to integrate into passport module
    serverwidgetsSchema = require('./components/IF_schemas/serverwidgets_schema.js'),
    worldchatSchema = require('./components/IF_schemas/worldchat_schema.js'),
    visitSchema = require('./components/IF_schemas/visit_schema.js'),
    monguurl = require('monguurl');

mongoose.connect(configDB.url); 
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//

http.globalAgent.maxSockets = 100;

//----- For checking on size of instagram upload dir -----//
var util  = require('util');
//----//


// passport config
require('./components/IF_auth/passport')(passport); 

//socket.io init
var socket = require('./components/IF_chat/socket.js');

//===== EXPRESS INIT =====//

var express = require('express'),
    app = module.exports.app = express(),
    // cors = require('cors'),
    db = require('mongojs').connect('if'); //THIS IS TEMPORARY!!!! remove once all mongojs queries changed to mongoose

    //express compression
    var oneDay = 86400000;
    var compression = require('compression');
    app.use(compression());

    var server = http.createServer(app);
    var io = require('socket.io').listen(server); // Hook Socket.io into Express

    app.use(express.static(__dirname + '/app/dist', { maxAge: oneDay }));


    //===== PASSPORT TO EXPRESS=====//
    // set up express app
    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies (needed for auth)

    app.use(bodyParser.urlencoded({
      extended: true
    })); // get information from html forms

    app.use(bodyParser.json({
      extended: true
    })); // get information from html forms

    // passport to express requires
    app.use(session({ secret: 'rachelwantstomakecakebutneedseggs' })); // session secret to 'prevent' session hijacking 
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

//===================//

//-------------------------------------//
//---- Sending Feedback via Email -----//
//-------------------------------------//
app.post('/feedback', function (req, res) {
    if (req.body.emailText){   
        var sText = req.body.emailText.replace(/[^\w\s\.\@]/gi, '');
        var feedbackTo = 'jrbaldwin@interfacefoundry.com';

        var mailOptions = {
            to: feedbackTo,
            from: 'IF Bubbl <mail@bubbl.li>',
            subject: 'Bubbl Feedback',
            text: sText
          };
          mailerTransport.sendMail(mailOptions, function(err) {
            res.send('email sent');
          });  
    }
    else {
        res.send(500,'bad email parameters');
    }
});


//====================================//
//======= RESET PASSWORD MAILER ======//
//====================================//

app.post('/forgot', function (req, res, next) {

      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          if (validateEmail(req.body.email)){
              User.findOne({ 'local.email': req.body.email }, function(err, user) {
                if (!user) {
                  done('No account with that email address exists, or you signed up only through Facebook/Twitter');
                }

                else {
                    user.local.resetPasswordToken = token;
                    user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                      done(err, token, user);
                    }); 
                }
              });
          }
          else {
            return done('Please use a real email address');
          }
        },
        function(token, user, done) {
            if (req.headers.host){
              var mailOptions = {
                to: user.local.email,
                from: 'IF Bubbl <mail@bubbl.li>',
                subject: 'Bubbl Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'https://' + req.headers.host + '/#/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              mailerTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
                done(err, 'done');
              });  
            }
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/#/forgot');
      });

    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 
});

app.post('/resetConfirm/:token', function(req, res) {
  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      //req.flash('error', 'Password reset token is invalid or has expired.');
      // return res.redirect('/#/forgot');
        res.send(403);
    }
    else {
        res.send('yeah its fine');
    }
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          //return res.redirect('/#/forgot');
          res.send(403);
        }

        else {
            if (req.body.password.length >= 6) {
                user.local.password = user.generateHash(req.body.password);
                user.local.resetPasswordToken = undefined;
                user.local.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
            }
            else {
                return done('Password needs to be at least 6 characters');  
            }          
        }
      });
    },
    function(user, done) {

      var mailOptions = {
        to: user.local.email,
        from: 'IF Bubbl <mail@bubbl.li>',
        subject: 'Your Bubbl Password was reset',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed. If this is an error, please contact: hello@interfacefoundry.com\n'
      };
      mailerTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
        done(err, 'done');
      });

    }
  ], function(err) {
    res.send('password changed successfully');
  });
}); 

//====================================//
//========  END MAIL RESET  ==========//
//====================================//

//LIMITING UPLOADS TO 10MB 
app.use(connectBusboy({
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
}));

// Socket.io Communication
io.sockets.on('connection', socket);

// io.set('transports', [                     // enable all transports (optional if you want flashsocket)
//     'websocket'
//   , 'jsonp-polling'
// ]);

// passport routes ======================================================================
require('./components/IF_auth/auth_routes.js')(app, passport, landmarkSchema); // load our routes and pass in our app and fully configured passport

/* Helpers */

//Parts (just a bit at this point) of express code from: https://github.com/dalcib/angular-phonecat-mongodb-rest
//To allow use ObjectId or other any type of _id
var objectId = function (_id) {
    if (_id.length === 24 && parseInt(db.ObjectId(_id).getTimestamp().toISOString().slice(0,4), 10) >= 2010) {
        return db.ObjectId(_id);
    } 
    return _id;
}

//Function callback
var fn = function (req, res) {
    res.contentType('application/json');
    var fn = function (err, doc) { 
        if (err) { 
            if (err.message) {
                doc = {error : err.message} 
            } else {
                doc = {error : JSON.stringify(err)} 
            }
        }
        if (typeof doc === "number" || req.params.cmd === "distinct") { doc = {ok : doc}; } 
        res.send(doc); 
    };
    return fn;
};

/* Routes */


// Query
app.get('/api/:collection', function(req, res) { 

    var item, sort = {};

    //route to world
    if (req.params.collection == 'worlds'){

     worlds_query(req.query.userCoordinate[0], req.query.userCoordinate[1], req.query.localTime,res);
    }

    //querying landmark collection (events, places, etc)
    if (req.params.collection == 'landmarks'){

        //if has parentID parameter (world landmark query)
        if (req.query.parentID && req.query.queryFilter){
            //filtering landmarks
            switch (req.query.queryFilter) {
              //show all landmarks inside parent world
              case 'all':
                var qw = {
                    parentID:req.query.parentID,
                    world:false //only landmarks
                };   
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));     
                break;
              //return live landmarks inside parent world
              case 'now':
                console.log('now');
                if (req.query.userTime){
                    var currentTime = new Date(req.query.userTime);  //time was passed from front-end (preferable to sync with user timezone)
                }
                else {
                    var currentTime = new Date(); //no time passed from front-end, weird but ok!
                }

                var qw = {
                    parentID:req.query.parentID,
                    world:false,
                    'time.start': {$lt: currentTime},
                    'time.end': {$gt: currentTime}
                };   

                landmarkSchema.find(qw).sort({'time.start': 1}).exec(function(err, data) {

                  if (data){
                      var stringArr = [];
                      async.forEach(data, function (obj, done){ 
                          stringArr.push({_id: obj._id});
                          done(); 
                      }, function(err) {
                          //console.log(stringArr);
                          res.send(JSON.stringify(stringArr));
                      }); 
                      
                  }
                  else {
                      console.log('no results');
                      res.send({err:'no results'});            
                  }
                });

                break;
              //return upcoming landmarks inside parent world
              case 'upcoming':

                console.log('upcoming');
                if (req.query.userTime){
                    var currentTime = new Date(req.query.userTime);
                }
                else {
                    var currentTime = new Date();
                }

                var qw = {
                    parentID:req.query.parentID,
                    world:false,
                    'time.start': {$gt: currentTime}
                };   

                landmarkSchema.find(qw).sort({'time.start': 1}).exec(function(err, data) {

                  if (data){
                      var stringArr = [];
                      async.forEach(data, function (obj, done){ 
                         stringArr.push({_id: obj._id});
                         done(); 
                      }, function(err) {
                         //console.log(stringArr);
                         //console.log(JSON.stringify(stringArr));
                         res.send(JSON.stringify( stringArr ));
                      });
                      
                  } else {
                      console.log('no results');
                      res.send({err:'no results'});
                  }
                });    

                break;
              default:

                var qw = {
                    parentID:req.query.parentID,
                    world:false
                };   
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));   

                break;
            }

        }

        //not a landmark query
        else {
            //places
            if (req.query.queryType == "places"){
                //do a location radius search here option
                //console.log(req.query.queryFilter);

                if (req.query.queryFilter == "all"){
                    var qw = {
                        'type' : 'place'
                    };
                    db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
                }
                else {
                    var qw = {
                        'subType' : req.query.queryFilter
                    };
                    db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
                }
            }

            //search
            if (req.query.queryType == "search"){

                var searchResults = {};

                var qw = {
                    "name" : {$regex : ".*"+req.query.queryFilter+".*", $options: 'i'}
                };
                db.collection('landmarks').find(qw).sort({_id: -1}).toArray(addSearch(req,res));
                //searchResults.push(search);

                function addSearch(req,res){
                     // console.log(req);
                     //console.log(res);
                }
            }
        }   
    }


    //querying tweets (social media and internal comments too, eventually)
    if (req.params.collection == 'tweets'){

        if (req.query.tag){ //hashtag filtering
            //has limit
            if (req.query.limit){
              var Twlimit = parseInt(req.query.limit);
              var qw = {
                 'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
              };
              db.collection('tweets').find(qw).limit(Twlimit).sort({_id: -1}).toArray(fn(req, res));
            }
            //no limit
            else {
              var qw = {
                 'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
              };
              db.collection('tweets').find(qw).sort({_id: -1}).toArray(fn(req, res));            
            }
        }
        else {
            if (req.query.limit){ //limited tweet query
                limit = parseInt(req.query.limit);
                db.collection(req.params.collection).find(qw).limit(limit).sort({_id: -1}).toArray(fn(req, res));
            }
            else {
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }
        }
    }

    //querying instagrams
    if (req.params.collection == 'instagrams'){

        if (req.query.tag){ //hashtag filtering
            //has limit
            if (req.query.limit){
              var Inlimit = parseInt(req.query.limit);
              var qw = {
                 'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
              };
              db.collection('instagrams').find(qw).limit(Inlimit).sort({_id: -1}).toArray(fn(req, res));
            }
            //no limit
            else {
              var qw = {
                 'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
              };
              db.collection('instagrams').find(qw).sort({_id: -1}).toArray(fn(req, res));            
            }

        }
        else {
            if (req.query.limit){ //limited tweet query
                limit = parseInt(req.query.limit);
                db.collection(req.params.collection).find(qw).limit(limit).sort({_id: -1}).toArray(fn(req, res));
            }
            else {
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }
        }
    }



    //querying worldchat
    if (req.params.collection == 'worldchat'){

        if (req.query.sinceID == 'none' || !req.query.sinceID){
            var qw ={
              worldID: req.query.worldID
            }
        } else {
            var qw ={
              worldID: req.query.worldID,
              _id: { $gt: mongoose.Types.ObjectId(req.query.sinceID) }
            }
        }
		
		if (req.query.limit == 1) {
			db.collection('worldchats').find(qw).sort({_id: -1}).limit(1).toArray(function(err, data) {
			if (err) {
				console.log(err)
				res.send(err);
			} else if (data) {
				res.send(data);
			} else {
				res.send(500,['error']);
			}
			});
		} 
		else {
			db.collection('worldchats').find(qw).limit(30).sort({_id: 1}).toArray(fn(req, res));
		}
    }



    //querying visits
    if (req.params.collection == 'visit'){

        //query for user history
        if (req.query.option == 'userHistory'){
          //logged in
          if (req.user){
            if(req.user._id){
              var userString = req.user._id.toString();
              var qw = {
                userID: userString
              }
              console.log(qw);
              db.collection('visits').find(qw).sort({_id: -1}).toArray(fn(req, res));
            }
          }
          else {
            res.send(403, ['need to be logged in']);
          }
        }
        //query for visits to world within one hour
        else {

            var d = new Date(Date.now() - 60 * 60 * 1000);
           // var n = d.toISOString();

            var qw = {
              timestamp: { // 1 hour ago (from now)
                  $gt: d
              },
              worldID: req.query.worldID
            }    
            db.collection('visits').find(qw).sort({_id: -1}).toArray(fn(req, res));
        }
    }

});

// Search
app.get('/api/textsearch', function(req, res) {

    var sText = req.body.textQuery.replace(/[^\w\s]/gi, '');

    // landmarkSchema.find(
    //     { $text : { $search : sText } },
    //     { score : { $meta: "textScore" } }
    //   ).
    //   sort({ score : { $meta : 'textScore' } }).
    //   limit(100).
    //   exec(function(err, data) {
    //     if (data){
    //         res.send(data);
    //     }
    //     else {
    //         console.log('no results');
    //         res.send({err:'no results'});            
    //     }
    //   });
});



// Read 
app.get('/api/:collection/:id', function(req, res) {
    //Return a world
    if (req.url.indexOf("/api/worlds/") > -1){ 

        //return by mongo id
        //console.log(req.query.m);
        if (req.query.m == "true") {
			
          db.collection('landmarks').findOne({_id:objectId(req.params.id),world:true}, function(err, data){
              if (data){
                  combineQuery(data, res);
              }
              else {
                  console.log('540: world doesnt exist');
                  console.log(err);
                  res.send({err:'540: world doesnt exist'});
              }      
          }); 
        }
        //return by IF id
        else {
          db.collection('landmarks').findOne({id:req.params.id,world:true}, function(err, data){
              if (data){
                  combineQuery(data, res);
              }
              else {
                  console.log('552: world doesnt exist');
                  res.send({err:'552: world doesnt exist'});
              }      
          }); 
        }
        //if world, query for style and return
        function combineQuery(data, res){
          //look up style associated with world

          if (data.style){
            if (data.style.styleID){
              styleSchema.findById(data.style.styleID, function(err, style) {
                  if (!style){
                    console.log(err);
                  }
                  if(style) {
                      console.log(style);
                      var resWorldStyle = {
                          "world" : data,
                          "style" : style
                      };
                      res.send(200, resWorldStyle);
                  }
              }); 

              landmarkSchema.update({ _id : data._id}, { $inc: { views : 1 } }, function(err){
                  if(err){
                      console.log('view update failed');
                  }
                  else{ 
                      console.log('view update succes');
                  }
              });


            }
          }
          else {
            console.log('world doesnt have a styleID');
          }

        }
    }
    //Return a landmark
    else {
        db.collection(req.params.collection).findOne({id:req.params.id,world:false}, fn(req, res));
    }
});


// Save world visitor anonymously
app.post('/api/visit/create', function(req, res) {

    if (req.body.worldID){
      var vs = new visitSchema({
        worldID: req.body.worldID
      });

      //logged in
      if (req.user){
        if(req.user._id){
          vs.userID = req.user._id;
        }
      }

      if (req.body.userName){
        vs.userName = req.body.userName;
      }

      vs.save(function (err, data) {
          if (err){
              console.log(err);
              res.send(err);
          }
          else {
              res.status(200).send([data]);
          }
      });
    }
    else {
      res.status(200).send(['need worldID to save visit']);
    }
});


// Save 
app.post('/api/:collection/create', isLoggedIn, function(req, res) {

    if (req.url == "/api/styles/create"){
        editStyle(); //edit style
    }

    if (req.url == "/api/projects/create"){
        editProject(); //edit project info
    }

    if (req.url == "/api/worldchat/create"){
    
    	console.log('image '+req.body.img);

        var wc = new worldchatSchema({
            userID: req.user._id,
            worldID: req.body.worldID,
            nick: req.body.nick,
            msg: req.body.msg,
            pic: req.body.pic,
            avatar: req.body.avatar
        });
		console.log(wc);
        wc.save(function (err, data) {
            if (err){
                console.log(err);
                res.send(err);
            }
            else {
            	console.log(data);
                console.log('SAVED new message');
                res.status(200).send([data]);
            }
        });
    }

    //edit a world
    if (req.url == "/api/worlds/create"){
        var worldVal = true;

        if (req.body.editMap){ //adding map options to world
            worldMapEdit();
        }

        else {
            contSaveLandmark(); 
        }
    }
    //a landmark
    else if (req.url == "/api/landmarks/create"){
        var worldVal = false;
        contSaveLandmark();
    }

    //adding/editing map to world
    function worldMapEdit(){ 
   
         landmarkSchema.findById(req.body.worldID, function(err, lm) {
          if (!lm){
            console.log(err);
          }
          else if (req.user._id == lm.permissions.ownerID){ //check permissions to edit

            lm.style.maps.type = req.body.type; //local, cloud or both
            lm.style.maps.cloudMapID = req.body.mapThemeSelect.cloudMapID; 
            lm.style.maps.cloudMapName = req.body.mapThemeSelect.cloudMapName;

            //NEED TO CHANGE TO ARRAY to push new marker types, eventually (???)
            lm.style.markers = {
                name:req.body.markerSelect.name, 
                category:'all'
            };

            lm.save(function(err, landmark) {
                if (err){
                    console.log('error');
                }
                else {
                    console.log(landmark);
                    console.log('success');
                }
            });
          }
          else {
            console.log('unauthorized user'); //no permissions
          }
        });       
    }


    function contSaveLandmark(){

        //new landmark, no name
        if (!req.body.name) {
            console.log('generating number id');
            idGen(crypto.randomBytes(15).toString('hex'));
        }

        //landmark already has name
        else {

            //not a new landmark
            if (!req.body.newStatus){ 

                if (req.body.worldID) {
                    var lookupID = req.body.worldID;
                }

                if (req.body._id) {
                    var lookupID = req.body._id;
                }    

                landmarkSchema.findById(lookupID, function(err, lm) {
                  //same name, so dont gen new id
				  if (!lm) {
					 console.log(err);
				  } else {
	                  if (lm.name == req.body.name){
	                    saveLandmark(lm.id);
	                  }
	                  //a new name was used
	                  else {
	                    idGen(req.body.name);
	                  }
                  }
                });
            }

            //new landmark
            else {
                idGen(req.body.name);
            }
        }

        //generating a unique id for world/landmark
        function idGen(input){
            var uniqueIDer = urlify(input);
            urlify(uniqueIDer, function(){
                db.collection('landmarks').findOne({'id':uniqueIDer,'world':worldVal}, function(err, data){
                    if (data){
                        var uniqueNumber = 1;
                        var newUnique;

                        async.forever(function (next) {
                          var uniqueNum_string = uniqueNumber.toString(); 
                          newUnique = data.id + uniqueNum_string;

                          db.collection('landmarks').findOne({'id':newUnique,'world':worldVal}, function(err, data){
                            if (data){
                              console.log('entry found!');
                              uniqueNumber++;
                              next();
                            }
                            else {
                              console.log('entry not found!');
                              next('unique!'); // This is where the looping is stopped
                            }
                          });
                        },
                        function () {
                          saveLandmark(newUnique);
                        });
                    }
                    else {
                        saveLandmark(uniqueIDer);
                    }
                });
            });
        }

        //unique id found, now save/ update
        function saveLandmark(finalID){
            
            //an edit
            if (!req.body.newStatus){

                if (req.body.worldID){
                    var lookupID = req.body.worldID;
                }
                if (req.body._id){
                    var lookupID = req.body._id;
                }         
                console.log('lookupID', lookupID);
                
                landmarkSchema.findById(lookupID, function(err, lm) {
                  if (!lm){
                    console.log(err);
                  }
                  else if (req.user._id == lm.permissions.ownerID){ //checking if logged in user is owner
                    
                    lm.name = req.body.name;
                    lm.id = finalID;
                    lm.valid = 1;
                    lm.status = req.body.status || 'draft';
                    
                    if (req.body.hasOwnProperty('loc')) {
                    	if (req.body.loc.hasOwnProperty('coordinates')) {
                    	lm.loc = {type:'Point', coordinates:[req.body.loc.coordinates[0],req.body.loc.coordinates[1]]};
                    	}
                    }
              
                    lm.hasLoc = req.body.hasLoc || false;
                    
                    if (req.body.avatar){
                    	lm.avatar = req.body.avatar;
                    }

                    if (req.body.parentID){
                        lm.parentID = req.body.parentID;
                    }

                    if (req.body.description){
                        lm.description = req.body.description;
                    }
                    if (req.body.summary){
                        lm.summary = req.body.summary;
                    }
                    if (req.body.category){
                        lm.category = req.body.category;
                    }
                    if (req.body.landmarkCategories){
	                    lm.landmarkCategories = req.body.landmarkCategories;
                    }
					          
                    if (req.body.resources){
                      if (req.body.resources.hashtag){
                          lm.resources.hashtag = req.body.resources.hashtag;
                      }                 
                    }

                    if (req.body.widgets) {
                    	/*if (req.body.widgets.twitter) {lm.widgets.twitter = req.body.widgets.twitter;}
	                   	if (req.body.widgets.instagram) {lm.widgets.instagram = req.body.widgets.instagram;}
	                    if (req.body.widgets.upcoming) {lm.widgets.upcoming = req.body.widgets.upcoming;}
	                    if (req.body.widgets.category) {lm.widgets.category = req.body.widgets.category;}*/
                    }

                    //if user checks box to activate time 

          					if (req.body.style) {
          						lm.style = req.body.style;
          					}
					
					        if (req.body.hasOwnProperty('time')) {
                    if (req.body.time.hasOwnProperty('start')) {
						
                        /*lm.timetext.datestart = req.body.timetext.datestart;
                        lm.timetext.dateend = req.body.timetext.dateend;
                        lm.timetext.timestart = req.body.timetext.timestart;
                        lm.timetext.timeend = req.body.timetext.timeend;

                        //------ Combining Date and Time values -----//
                        var timeStart = req.body.timetext.timestart;
                        var timeEnd = req.body.timetext.timeend;

                        var dateStart = new Date(req.body.timetext.datestart).toDateString();
                        var dateEnd = new Date(req.body.timetext.dateend).toDateString();

                        var datetimeStart = new Date(dateStart+' '+timeStart);
                        var datetimeEnd = new Date(dateEnd+' '+timeEnd);
                        //----------//
						
                        lm.time.start = datetimeStart;
                        lm.time.end = datetimeEnd;*/
                        if (req.body.time.start){
                          lm.time.start = req.body.time.start;
                          
                          if (req.body.time.hasOwnProperty('end')) {
  	                        lm.time.end = req.body.time.end;
                          } else {
  	                        lm.time.end = lm.time.start;
                          }
                        }
                        
                        //if no end time, match start time
                    }
                  }

                    lm.save(function(err, landmark) {
                        if (err){
                        	console.log(err);
                            console.log('lm.save error');
                        }
                        else {
                            console.log(landmark);
                            console.log('success');
                            res.send(200,[landmark]);

                            //update serverwidget object for world
                            if (req.body.world_id && req.body.hashtag){
                                manageServerWidgets(req.body.world_id, req.body.hashtag, lm.widgets); //add/remove server tags
                            }
                        }
                    });
                  }
                  else {
                    console.log('unauthorized user');
                  }
                });

            }

            //not an edit
            else {

                //new world
                if (worldVal) {
                    saveStyle(req.body.name, function(styleRes){ //creating new style to add to landmark
                        saveNewLandmark(styleRes);
                    });
                }

                //new landmark
                else {

                    //checking for auth of parent ID (world) to add new landmarks...bad security if attacker changes world val?? idk!

                    landmarkSchema.findById(req.body.parentID, function(err, lm) {
                        if (!lm){
                            console.log(err);
                        }
                        else if (req.user._id == lm.permissions.ownerID){ //checking if logged in user is owner
                            saveNewLandmark();
                        }
                        else {
                            console.log('unauthorized user');
                        }
                    });
                }

                function saveNewLandmark(styleRes){
                    var lm = new landmarkSchema({
                        	name: req.body.name,
            							id: finalID,
            							world: worldVal,
            							valid: 1,
                          views: 0,
            							avatar: req.body.avatar,
            							status: 'draft',
            							permissions: {
                            ownerID: req.user._id //from auth user ID
            							},
            							style: {
            								maps: {
            									cloudMapID: 'interfacefoundry.jh58g2al',
            									cloudMapName: 'forum'
            								}
            							},
            							resources: {
            							}
                    });
					
          					if (req.body.loc) {
          						lm.loc = {type: 'Point',
          								coordinates: [req.body.loc.coordinates[0],
          									req.body.loc.coordinates[1]]}
          						lm.hasLoc = true;
          					} else {
          						//fake location
          						lm.loc = {type: 'Point',
          								coordinates: [-74.0059,40.7127]}
          						lm.hasLoc = false;	
          					}
					
                    if (styleRes !== undefined){ //if new styleID created for world
                        lm.style.styleID = styleRes;
                    }

                    if (req.body.parentID){
                        lm.parentID = req.body.parentID;
                    }

                    if (req.body.description){
                        lm.description = req.body.description;
                    }
                    if (req.body.summary){
                        lm.summary = req.body.summary;
                    }
                    if (req.body.category){
                        lm.category = req.body.category;
                    }

                    if (req.body.landmarkCategories){
	                    lm.landmarkCategories = req.body.landmarkCategories;
                    }

                    if (req.body.resources){
                      if (req.body.resources.hashtag){
                        lm.resources.hashtag = req.body.resources.hashtag;
                      }
                    }
                    
                    if (!req.body.avatar) {
	                    lm.avatar = "img/tidepools/default.jpg";
                    }

                    //if user checks box to activate time 
                    if (req.body.hasTime == true){   
                        lm.time.start = req.body.time.start || null;
                        lm.time.end = req.body.time.end || null;
                        lm.hasTime = true;
                    }

                    lm.save(function (err, landmark) {
                        if (err)
                            console.log(err);
                        else{
                            console.log(landmark);
                            //world created
                            if (worldVal == true){
                                saveProject(landmark._id, styleRes, req.user._id, function(projectRes){
                                    
                                var idArray = [{'worldID': landmark._id, 'projectID':projectRes,'styleID':styleRes,'worldURL':landmark.id}];
                                    res.send(200,idArray);
                                });
                            }

                            //landmark created
                            else {
                                res.send(200,[{"_id":landmark._id}]);
                            }
                        }
                    });

                }             
            }
        }

        function saveStyle(inputName, callback){
            var st = new styleSchema({
                name: inputName,
                bodyBG_color: "#eceff1",  
        				titleBG_color: "#ff7043", 
        				navBG_color: "rgba(244,81,30,.8)",  
        	
        				landmarkTitle_color: "#455a64", // RGB Hex
        				categoryTitle_color: "#ff5722", // RGB Hex
        		
        				widgets: {
        					twitter: false,
        					instagram: false,
        					upcoming: false,
        					category: false,
                  messages: true,
                  presents: false,
                  streetview: false
        				}
            });
            
            saveIt(function (res) {
                callback(res);
            });
            
            function saveIt(callback){
                st.save(function (err, style) {
                    if (err)
                        console.log(err);
                    else {
                        callback(style._id);
                    }
                });
            }
        }

        function saveProject(world,style,owner,callback){
            var pr = new projectSchema({
                worldID: world,
                styleID: style,
                permissions: {
                    ownerID: owner
                }
            });

            saveIt(function (res) {
                callback(res);
            });
            
            function saveIt(callback){
                pr.save(function (err, project) {
                    if (err)
                        console.log(err);
                    else {
                        callback(project._id);
                    }
                });
            }   
        }

    }

        function editProject(input){
             projectSchema.findById(req.body.projectID, function(err, lm) {
              if (!lm){
                console.log(err);
              }
              else if (req.user._id == lm.permissions.ownerID) {

                lm.save(function(err, style) {
                    if (err){
                        console.log('error');
                    }
                    else {
                        console.log(style);
                        console.log('success');
                    }
                });
              }
            });             
        }

        function editStyle(input){

         styleSchema.findById(req.body._id, function(err, lm) {
          if (!lm){
            console.log(err);
          }
          else {

            lm.bodyBG_color = req.body.bodyBG_color; // RGB Hex
            lm.cardBG_color = req.body.cardBG_color; // RGB Hex
            lm.titleBG_color = req.body.titleBG_color; //RGB Hex
            lm.navBG_color = req.body.navBG_color;

            lm.cardBorder = req.body.cardBorder; // off by default
            lm.cardBorder_color = req.body.cardBorder_color; // RGB Hex
            lm.cardBorder_corner = req.body.cardBorder_corner; // px to round

            lm.worldTitle_color = req.body.worldTitle_color; // RGB Hex
            lm.landmarkTitle = req.body.landmarkTitle; // off by default
            lm.landmarkTitle_color = req.body.landmarkTitle_color; // RGB Hex
            lm.categoryTitle = req.body.categoryTitle; // off by default
            lm.categoryTitle_color = req.body.categoryTitle_color; // RGB Hex
            lm.accent = req.body.accent; // off by default
            lm.accent_color = req.body.accent_color; // RGB Hex
            lm.bodyText = req.body.bodyText; // off by default
            lm.bodyText_color = req.body.bodyText_color; // RGB Hex

            lm.bodyFontName = req.body.bodyFontName; // font name
            lm.bodyFontFamily = req.body.bodyFontFamily; // font family
            lm.themeFont = req.body.themeFont; // off by default
            lm.themeFontName = req.body.themeFontName; // font name

            //console.log(req.body.widgets);
			
      			if (req.body.widgets) {
        			lm.widgets.twitter = req.body.widgets.twitter;
        			lm.widgets.instagram = req.body.widgets.instagram;
        			lm.widgets.upcoming = req.body.widgets.upcoming;
        			lm.widgets.category = req.body.widgets.category;
        			lm.widgets.messages = req.body.widgets.messages;
              lm.widgets.presents = req.body.widgets.presents;
              lm.widgets.streetview = req.body.widgets.streetview;
      			}
			
            lm.save(function(err, style) {
                if (err){
                    console.log('error');
                }
                else {
                    console.log(style);
                    console.log('success');

                    if(res){
                      res.send(200, [style]);
                    }
                    
                    //if parameters from world passed to style, then add to serverwidget object
                    if (req.body.world_id && req.body.hashtag){
                        manageServerWidgets(req.body.world_id, req.body.hashtag, lm.widgets); //add/remove server tags
                    }
                }
            });
          }
        }); 

    }

});

//for adding / removing items from widget services
function manageServerWidgets(id, tag, widgets){

    if(widgets.twitter == undefined){
        widgets.twitter = false;
    }

    if(widgets.instagram == undefined){
        widgets.instagram = false;
    }

    serverwidgetsSchema.findOne({worldID:id}, function(err, sw) {

      if (err) {
        console.log(err);
      }
      else {

        //doesn't exist, create new
        if (sw == null){
          //doc doesn't exist, write new
          console.log('new');

          var sw = new serverwidgetsSchema({
              worldID : id,
              worldTag: tag,
              twitter: widgets.twitter,
              instagram: widgets.instagram
          });

          sw.save(function (err, data) {
              if (err)
                  console.log(err);
              else {
                  console.log('SAVED NEW '+data);
              }
          });
        }
        //exists, update
        else {

          sw.worldID = id;
          sw.worldTag = tag;
          sw.twitter = widgets.twitter;
          sw.instagram = widgets.instagram;

          console.log('update=');
          //previously saved doc updated
          sw.save(function (err, data) {
              if (err)
                  console.log(err);
              else {
                  console.log('SAVED UPDATE '+data);
              }
          });  

        }

      }

    });
 
}

//upload profile pictures for worlds and landmarks and (users?)
app.post('/api/upload', isLoggedIn, function (req, res) {

        var fstream;
        req.pipe(req.busboy);

        console.log(req.headers['content-length']);


        req.busboy.on('file', function (fieldname, file, filename, filesize, mimetype) {



             ////// SECURITY RISK ///////
             ///////// ------------------> enable mmmagic to check MIME type of incoming data ////////
             // var parseFile = JSON.stringify(req.files.files[0]);
             // console.log(parseFile);
             // var magic = new Magic(mmm.MAGIC_MIME_TYPE);
             //  magic.detectFile(parseFile, function(err, result) {
             //      if (err){ throw err};
             //      console.log(result);
             //      // output on Windows with 32-bit node:
             //      //    application/x-dosexec
             //  });
              ///////////////////////////


             file.on('data', function(data) {
                 console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
             });

            var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename; //removing file type
            var fileType = filename.split('.').pop(); //removing file name

            if (mimetype == 'image/jpeg' || mimetype == 'image/png' || mimetype == 'image/gif' || mimetype == 'image/jpg'){

                while (1) {

                    var fileNumber = Math.floor((Math.random()*100000000)+1); //generate random file name
                    var fileNumber_str = fileNumber.toString(); 
                    var current = fileNumber_str + '.' + fileType;

                    //checking for existing file, if unique, write to dir
                    if (fs.existsSync("app/dist/uploads/" + current)) {
                        continue; //if there are max # of files in the dir this will infinite loop...
                    } 
                    else {

                        var newPath = "app/dist/uploads/" + current;

                        fstream = fs.createWriteStream(newPath);
                        var count = 0; 
                        var totalSize = req.headers['content-length'];
                        file.on('data', function(data) {
                          count += data.length;
                          var percentUploaded = Math.floor(count/totalSize * 100);
                          console.log("Uploaded " + percentUploaded + "%");
                          io.emit('uploadstatus',{ message: "Uploaded " + percentUploaded + "%"} );
                        }).pipe(fstream);

                        fstream.on('close', function () {
                             im.crop({
                              srcPath: newPath,
                              dstPath: newPath,
                              width: 300,
                              height: 300,
                              quality: 85,
                              gravity: "Center"
                            }, function(err, stdout, stderr){

                                res.send("uploads/"+current);

                            });                       
                        });

                        break;
                    }
                }

            }

            else {
                console.log('Please use .jpg .png or .gif');
                res.send(500,'Please use .jpg .png or .gif');
            }
        });
});


//upload pictures not for avatars
app.post('/api/uploadPicture', isLoggedIn, function (req, res) {

        var fstream;
        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename, filesize, mimetype) {

             ////// SECURITY RISK ///////
             ///////// ------------------> enable mmmagic to check MIME type of incoming data ////////
             // var parseFile = JSON.stringify(req.files.files[0]);
             // console.log(parseFile);
             // var magic = new Magic(mmm.MAGIC_MIME_TYPE);
             //  magic.detectFile(parseFile, function(err, result) {
             //      if (err){ throw err};
             //      console.log(result);
             //      // output on Windows with 32-bit node:
             //      //    application/x-dosexec
             //  });
              ///////////////////////////

            var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename; //removing file type
            var fileType = filename.split('.').pop(); //removing file name

            if (mimetype == 'image/jpeg' || mimetype == 'image/png' || mimetype == 'image/gif' || mimetype == 'image/jpg'){

                while (1) {

                    var fileNumber = Math.floor((Math.random()*100000000)+1); //generate random file name
                    var fileNumber_str = fileNumber.toString(); 
                    var current = fileNumber_str + '.' + fileType;

                    //checking for existing file, if unique, write to dir
                    if (fs.existsSync("app/dist/pictures/" + current)) {
                        continue; //if there are max # of files in the dir this will infinite loop...
                    } 
                    else {

                        var newPath = "app/dist/pictures/" + current;

                        fstream = fs.createWriteStream(newPath);
                        file.pipe(fstream);
                        fstream.on('close', function () {
                            //RESIZING IMAGES
                            im.resize({
                              srcPath: newPath,
                              dstPath: newPath,
                              width: 600,
                              quality: 0.8
                            }, function(err, stdout, stderr){
                                res.send("pictures/"+current);
                            });

                        });

                        break;
                    }
                }

            }

            else {
                console.log('Please use .jpg .png or .gif');
                res.send(500,'Please use .jpg .png or .gif');
            }
        });
});


//upload map to build
app.post('/api/upload_maps', isLoggedIn, function (req, res) {

    // TEMPORARY FILE UPLOAD AND DELETE, needs to direct stream from form upload...or keep like this?
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, filesize, mimetype) {

       ////// SECURITY RISK ///////
       ///////// ------------------> enable mmmagic to check MIME type of incoming data ////////
       // var parseFile = JSON.stringify(req.files.files[0]);
       // console.log(parseFile);
       // var magic = new Magic(mmm.MAGIC_MIME_TYPE);
       //  magic.detectFile(parseFile, function(err, result) {
       //      if (err){ throw err};
       //      console.log(result);
       //      // output on Windows with 32-bit node:
       //      //    application/x-dosexec
       //  });
        ///////////////////////////

        var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename;
        var fileType = filename.split('.').pop();

        if (mimetype == 'image/jpg' || mimetype == 'image/png' || mimetype == 'image/jpeg') {

            while (1) {

                var fileNumber = Math.floor((Math.random()*100000000)+1); //generate random file name
                var fileNumber_str = fileNumber.toString(); 
                var current = fileNumber_str + '.' + fileType;

                //checking for existing file, if unique, write to dir
                if (fs.existsSync("app/dist/temp_map_uploads/" + current)) {
                    continue; //if there are max # of files in the dir this will infinite loop...
                } 
                else {

                    var newPath = "app/dist/temp_map_uploads/" + current;

                    fstream = fs.createWriteStream(newPath);
                    file.pipe(fstream);
                    fstream.on('close', function() {
                        res.send("temp_map_uploads/"+current);
                    }); 
                    break;
                }
            }
        }
        else {
            console.log('Please use .jpg or .png');
            res.send(500,'Please use .jpg or .png');
        }
    });
});


//map send to tile server to build 
app.post('/api/build_map', isLoggedIn, function (req, res) {

  if (fs.existsSync(__dirname + '/app/dist/'+ req.body.mapIMG)) {
    
      //this entire area hurts my eyes, i can't even D:
      var map_text = JSON.stringify(req.body.coords); 
      map_text = map_text.replace(/\\"/g, '%22'); //ugh idk, just do it

      // after file saved locally, send to IF-Tiler server
      var r = request.post('http://107.170.180.141:3000/api/upload', function optionalCallback (err, httpResponse, body) {
        if (err) {
            //deleting temp map upload
            if (fs.existsSync(__dirname + '/app/dist/'+ req.body.mapIMG)) {
                //delete temp file
                fs.unlink(__dirname + '/app/dist/'+ req.body.mapIMG, function (err) {
                  if (err) throw err;
                  console.log('successfully deleted '+__dirname + '/app/dist/'+ req.body.mapIMG);
                });              
            }
            else {
                console.log('could not delete, file does not exist: '+__dirname + '/app/dist/'+ req.body.mapIMG);
            }
          return console.error('upload failed:', err);
        }
        else {
          console.log('Upload successful! Server responded with:', body);
          worldMapTileUpdate(req, res, body, req.mapBuild);
            //deleting temp map upload
            if (fs.existsSync(__dirname + '/app/dist/'+ req.body.mapIMG)) {
                //delete temp file
                fs.unlink(__dirname + '/app/dist/'+ req.body.mapIMG, function (err) {
                  if (err) throw err;
                  console.log('successfully deleted '+__dirname + '/app/dist/'+ req.body.mapIMG);
                });
            }
            else {
                console.log('could not delete, file does not exist: '+__dirname + '/app/dist/'+ req.body.mapIMG);
            }
         }
      });
      
      
        var form = r.form();
        form.append('my_buffer', new Buffer([1, 2, 3]));
        form.append(map_text, fs.createReadStream(__dirname + '/app/dist/'+ req.body.mapIMG)); //passing fieldname as json cause ugh.
    }
    else {
      console.log('map image doesnt exist');
    }

});


//updating world map with return from tile server
function worldMapTileUpdate(req, res, data, mapBuild){ //adding zooms, should be incorp into original function

    var tileRes = JSON.parse(data); //incoming box coordinates

     landmarkSchema.findById(tileRes.worldID, function(err, lm) {
      if (!lm){
        console.log(err);
      }
      else if (req.user._id == lm.permissions.ownerID){

        var min = tileRes.zooms[0];
        var max = tileRes.zooms.slice(-1)[0];

        lm.style.maps = {
            localMapID: tileRes.mapURL, 
            localMapName: tileRes.worldID
        };

        lm.style.maps.localMapOptions = {
            minZoom: min,
            maxZoom: max,
            attribution: "IF",
            reuseTiles: true,
            tms: true
        }

        //NEED TO CHANGE TO ARRAY to push new marker types, eventually
        //lm.style.markers = {name:req.body.markerSelect.name, category:'all'};

        lm.save(function(err, landmark) {
            if (err){
                console.log('error');
            }
            else {
                console.log(landmark);
                console.log('success');
                res.send(200,landmark);
            }
        });
      }
      else {
        console.log('unauthorized user');
      }
    });       
}

//looking for meetups in system created by user who logs in via meetup, then add them as owner
app.post('/api/process_meetups', isLoggedIn, function (req, res) {

  if (req.user.meetup){
    if (req.user.meetup.id){

      //find new meetups user organizes on Meetup
      findNewMeetups(parseInt(req.user.meetup.id), req.user._id, function(err){
        findRelatedMeetups();
      });

      //after new meetups created, find any others in DB tied to user
      function findRelatedMeetups(){
        landmarkSchema.find({ 'source_meetup.event_hosts.member_id': parseInt(req.user.meetup.id) }, function(err, ls) {

          if (err){
            res.send({err:'there was an error'});
            console.log('there was an error');
          }
          else if (ls){
              
              async.forEach(ls, function (obj, done){ 

                  //skip if there's already an owner ID
                  if (obj.permissions){
                    if (obj.permissions.ownerID){
                      if (obj.permissions.ownerID.length > 1){
                        done();
                      }    
                      else {
                        updateOwnerID();
                      }             
                    }
                    else {
                      updateOwnerID();
                    }
                  }
                  else {
                    updateOwnerID();
                  }

                  function updateOwnerID(){
                    obj.permissions.ownerID = req.user._id;
                    console.log('update=');
                    obj.save(function (err, data) {
                        if (err)
                            console.log(err);
                        else {
                            console.log('Updated Owner on world');
                        }
                    });  
                    done();  
                  }

              }, function(err) {
                  if (err){
                    console.log(err);
                  }
                  res.send('success');
                  console.log('added user as owner to all matching worlds');
              }); 
              
          }
          else {
              console.log('no results');
              res.send('no results');            
          }

        });      
      }

    }
    else {
      console.log('user doesnt have meetup id');
      res.send('could not find any matching worlds');
    }
  }
  else {
    console.log('user doesnt have meetup entry');
    res.send('could not find any matching worlds');
  }

});

//this finds the latest meetups by signed in Meetup user
function findNewMeetups(meetupID, userID, callback){

    findNew(function (err) {
       callback();
    }); 

    function findNew(callback){

      var source = "https://api.meetup.com/2/profiles?&sign=true&photo-host=public&role=leads&member_id="+meetupID+"&format=json&page=100&key=b22467d19d797837175c661932275c"
        request({uri:source},function(err,response,body){

            if (err){
              console.log(err);
            }
            var roleArray=[]; 
            var results=JSON.parse(body).results;

            //adding only groups where member has a role value (are all roles admin though?)
            async.forEach(results, function (obj, done){ 

                if (obj.role && obj.group){
                  roleArray.push(obj.group.id.toString());
                }
                done(); 

            }, function(err) {
                if (err){
                  console.log(err);
                }

                var toMeetupServer = {
                  "userID" : userID,
                  "groupIDs": roleArray
                };

                postArray(function(err){
                  callback();
                });

                function postArray(callback){

                  request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     'http://localhost:3134/api/process_meetups',
                    body:    JSON.stringify(toMeetupServer) 
                  }, function(err, response, body){
                    if (err){
                      console.log(err);
                    }
                    callback();
                  });
                }
            }); 
        });
    }
}



//updates user profile
app.post('/api/updateuser', isLoggedIn, function (req, res) {

    if (req.body._id == req.user._id){

      User.findById(req.user._id, function(err, us) {
      if (err){
        console.log(err);
        res.send(200, 'there was an error');
      }
      else if(!us){
        console.log('user not found');
        res.send(200, 'user not found');
      }
      else {  

        if (req.body.addr){
          us.addr = req.body.addr;
          //us.addrP = req.body.addrP;         
        }
		
    		if (req.body.addr2) {
    			us.addr2 = req.body.addr2;
    		}

        if (req.body.bday && req.body.bdayP){
          us.bday = req.body.bday;
          us.bdayP = req.body.bdayP;
        }

        if (req.body.lang){
          us.lang = req.body.lang;
        }

        if (req.body.avatar){
          us.avatar = req.body.avatar;
        }

        if (req.body.name){
          us.name = req.body.name;

          //use nick as unique if no userID
          // if (!req.body.userID){
          //   req.body.userID = req.body.name;
          // }
        }

        if (req.body.note){
          us.note = req.body.note;
        }

        if (req.body.social){

            if (req.body.social.linkedIn && req.body.social.linkedInP){
              us.social.linkedIn = req.body.social.linkedIn;
              us.social.linkedInP = req.body.social.linkedInP;
            }

            if (req.body.social.twitter && req.body.social.twitterP){
              us.social.twitter = req.body.social.twitter;
              us.social.twitterP = req.body.social.twitterP;
            }

            if (req.body.social.facebook && req.body.social.facebookP){
              us.social.facebook = req.body.social.facebook;
              us.social.facebookP = req.body.social.facebookP;
            }

            if (req.body.social.gplus && req.body.social.gplusP){
              us.social.gplus = req.body.social.gplus;
              us.social.gplusP = req.body.social.gplusP;
            }

            if (req.body.social.github && req.body.social.githubP){
              us.social.github = req.body.social.github;
              us.social.githubP = req.body.social.githubP;
            }
        }
    		
    		if (req.body.email) {
    			us.email = req.body.email;
    		}
    		
    		if (req.body.tel) {
    			us.tel = req.body.tel;
    		}

        if (req.body.presents) {
          us.presents = req.body.presents;
        }

        //check for unique profileID before save
        if (req.body.profileID){

          //if missing profileID, try to fill it in using name
          if (req.body.profileID == 'undefined' && req.body.name){

            uniqueProfileID(req.body.name, function(output){
              us.profileID = output;
              saveUser();
            });
          }
          else if (req.body.profileID == 'undefined' && us.name){

            uniqueProfileID( us.name, function(output){
              us.profileID = output;
              saveUser();
            });
          }
          else if (req.body.profileID == 'undefined'){
            req.body.profileID = 'user';

            uniqueProfileID(req.body.profileID, function(output){
              us.profileID = output;
              saveUser();
            });
          }
          else {
            us.profileID = req.body.profileID;
            saveUser();  
          }

        }
        //or just save if no unique userID
        else {
          saveUser();
        }

        function saveUser(){
          us.save(function(err){
            if (err){
              console.log(err);
              res.send(200, 'there was an error saving user info');
            }
            else {
              res.send(200, 'user updated'); 
            }
          });  
        }


        /*async.parallel({
            one: function(callback){

                //this should allow insert of mixed array, not sure...
                if (req.body.org){
                  async.each(req.body.org, function( z, callback) {

                    var orgObj = {};

                    if (z.label){
                      orgObj.label = z.label;
                    }
                    if (z.name){
                      orgObj.name = z.name;
                    }
                    if (z.P){
                      orgObj.P = z.P;
                    }

                    us.org.push(orgObj);
                    callback();
                    
                  }, function(err){
                      if( err ) {
                        console.log(err);
                      } else {
                        console.log('user org object array finished');
                        callback();
                      }
                  });
                }
                else {
                  callback();
                }
            },
            two: function(callback){

                //this should allow insert of mixed array, not sure...
                if (req.body.email){
                  async.each(req.body.email, function( e, callback) {

                    var emailObj = {};

                    if (e.label){
                      emailObj.label = e.label;
                    }
                    if (e.addr){
                      emailObj.addr = e.addr;
                    }
                    if (e.P){
                      emailObj.P = e.P;
                    }

                    us.email.push(emailObj);
                    callback();
                    
                  }, function(err){
                      if( err ) {
                        console.log(err);
                      } else {
                        console.log('user email object array finished');
                        callback();
                      }
                  });
                }
                else {
                  callback();
                }
            },
            three: function(callback){
                //this should allow insert of mixed array, not sure...
                if (req.body.tel){
                  async.each(req.body.tel, function( e, callback) {

                    var telObj = {};

                    if (e.label){
                      telObj.label = e.label;
                    }
                    if (e.number){
                      telObj.number = e.number;
                    }
                    if (e.P){
                      telObj.P = e.P;
                    }

                    us.tel.push(telObj);
                    callback();
                    
                  }, function(err){
                      if( err ) {
                        console.log(err);
                      } else {
                        console.log('user email object array finished');
                        callback();
                      }
                  });
                }
                else{
                  callback();
                }
            },
            four: function(callback){
                //this should allow insert of mixed array, not sure...
                if (req.body.contact){
                  async.each(req.body.contact, function( e, callback) {

                    var contactObj = {};

                    if (e.fauserID){
                      contactObj.fauserID = e.fauserID;
                    }
                    if (e.permission){
                      contactObj.permission = e.permission;
                    }

                    us.contact.push(contactObj);
                    callback();
                    
                  }, function(err){
                      if( err ) {
                        console.log(err);
                      } else {
                        console.log('user contact object array finished');
                        callback();
                      }
                  });
                }
                else{
                  callback();
                }
            }
        },
        function(err, results) {
            if (err){
              console.log(err);
            }
            else {
              //processed all array things, now update user
              us.save(function(err){
                if (err){
                  console.log(err);
                  res.send(200, 'there was an error saving user info');
                }
                else {
                  res.send(200, 'user updated'); 
                }

              });
            }
        });*/

      }

    });

  }
  else {
    console.log('unauthorized user');
  }


});


function uniqueProfileID(input, callback){

    var uniqueIDer = urlify(input);
    urlify(uniqueIDer, function(){
        db.collection('users').findOne({'profileID':uniqueIDer}, function(err, data){
            if (data){
                var uniqueNumber = 1;
                var newUnique;

                async.forever(function (next) {
                  var uniqueNum_string = uniqueNumber.toString(); 
                  newUnique = data.profileID + uniqueNum_string;

                  db.collection('users').findOne({'profileID': newUnique}, function(err, data){

                    if (data){
                      uniqueNumber++;
                      next();
                    }
                    else {
                      next('unique!'); // This is where the looping is stopped
                    }
                  });
                },
                function () {
                  callback(newUnique);
                });
            }
            else {
                callback(uniqueIDer);
            }
        });
    });
}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    console.log(req.user);
    if (!req.isAuthenticated()){ 
        res.send(401);  //send unauthorized 
    }
    else{ 
        return next();
    }
}



// Delete
app.delete('/api/:collection/:id', function(req, res) {
   db.collection(req.params.collection).remove({_id:objectId(req.params.id)}, {safe:true}, fn(req, res));
});

//Group
app.put('/api/:collection/group', function(req, res) {
    db.collection(req.params.collection).group(req.body, fn(req, res));
})

// MapReduce
app.put('/api/:collection/mapReduce', function(req, res) {
    if (!req.body.options) {req.body.options  = {}};
    req.body.options.out = { inline : 1};
    req.body.options.verbose = false;
    db.collection(req.params.collection).mapReduce(req.body.map, req.body.reduce, req.body.options, fn(req, res));    
})

// Command (count, distinct, find, aggregate)
app.put('/api/:collection/:cmd',  function (req, res) {
    if (req.params.cmd === 'distinct') {req.body = req.body.key}
    db.collection(req.params.collection)[req.params.cmd](req.body, fn(req, res)); 
})


// //for routing auth to passport
// var router = express.Router();
// router.get('/auth/*', function (req, res, next) {
//   next();
// })
// app.use(router);

// app.all('/w/*', function(req, res) {
//   console.log('asdf '+req.url);
// });



//for routing all else to angular
app.all('/*', function(req, res) {

  function endsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  //if file path, then add file to end
  if (req.url.indexOf('.') != -1 ){
    res.sendfile(req.url, { root: __dirname + '/app/dist' },  function (err) {
	   if (err) {
	      	console.log(err);
	      	res.status(err.status).end();
	   }
	   else {
	   		console.log('Sent:', req.url);
	   }
	  });
  }

  /*else if (endsWith(req.url,'/0')){
    console.log('dont send back, but who cares');
    res.status(404).send({err: '/0'});
  }*/

  else {
    res.sendfile('index.html', { root: __dirname + '/app/dist' });
  }

});


//3 Hour checkup on size of image directories, emails if over 10gb
//from: http://stackoverflow.com/questions/7529228/how-to-get-totalsize-of-files-in-directory
// async.whilst(
//     function () { return true }, 
//     function (callback) {

//         var spawn = require('child_process').spawn,
//         size = spawn('du', ['-sh', './app/dist/img/instagram/']);

//         size.stdout.on('data', function (data) {

//           if (parseFloat(data.toString('utf8')) > 10000){ //size is 10gb send email warning!
      
//             var sText = req.body.emailText.replace(/[^\w\s\.\@]/gi, '');
//             var feedbackTo = 'jrbaldwin@interfacefoundry.com';

//             var mailOptions = {
//                 to: feedbackTo,
//                 from: 'IF Bubbl <mail@bubbl.li>',
//                 subject: 'INSTAGRAM SIZE WARNING, exceeded 10gb',
//                 text: 'help me'
//               };
//               mailerTransport.sendMail(mailOptions, function(err) {
//                 console.log('warning size message sent');
//               });  
//           }

//         });

//         setTimeout(callback, 10800000); // every 3 hour check
//     },
//     function (err) {
//     }
// );


server.listen(2997, function() {
    console.log("Illya casting magic on 2997 ~ ~ ♡");
});






