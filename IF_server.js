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

  v0.8 Illya 
*/

var fs = require('fs');
var im = require('imagemagick'); //must also install imagemagick package on server /!\
var async = require('async');
var moment = require('moment');
var http = require('http');
var connectBusboy = require('connect-busboy');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var configDB = require('./components/IF_auth/database.js');

var mailerTransport = require('./components/IF_mail/IF_mail.js');
var submitContestEntry = require('./components/IF_contests/IF_contests.js');


var crypto = require('crypto');
var validator = require('validator');
var passport = require('passport');
var flash = require('connect-flash');
var urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "_",
    nonPrintable: "_",
    trim: true
});
var request = require('request');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var readChunk = require('read-chunk');
var fileTypeProcess = require('file-type');
var _ = require('underscore');
var sanitize = require('mongo-sanitize');
// var multer  = require('multer');


//--- BUBBLE ROUTING ----//
var worlds_query = require('./components/IF_bubbleroutes/worlds_query');
var random_bubble = require('./components/IF_bubbleroutes/random_bubble');



//---- SEARCH -------//
var text_search = require('./components/IF_search/text_search');
var bubble_search = require('./components/IF_search/bubble_search');

//----MONGOOOSE & SCHEMAS----//
var mongoose = require('mongoose'),
    stickerSchema = require('./components/IF_schemas/sticker_schema.js'),
    landmarkSchema = require('./components/IF_schemas/landmark_schema.js'),
    styleSchema = require('./components/IF_schemas/style_schema.js'),
    projectSchema = require('./components/IF_schemas/project_schema.js'),
    User = require('./components/IF_schemas/user_schema.js'), //temp? need to integrate into passport module
    serverwidgetsSchema = require('./components/IF_schemas/serverwidgets_schema.js'),
    worldchatSchema = require('./components/IF_schemas/worldchat_schema.js'),
    visitSchema = require('./components/IF_schemas/visit_schema.js'),
    anonUserSchema = require('./components/IF_schemas/anon_user_schema.js'),
    contestSchema = require('./components/IF_schemas/contest_schema.js'),
    contestEntrySchema = require('./components/IF_schemas/contestEntry_schema.js'),
    analyticsSchema = require('./components/IF_schemas/analytics_schema.js'),
    monguurl = require('monguurl');

mongoose.connect(configDB.url);
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//

http.globalAgent.maxSockets = 100;

//----- For checking on size of instagram upload dir -----//
var util = require('util');
//----//

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

app.use(express.static(__dirname + '/app/dist', {
    maxAge: oneDay
}));

// app.use(multer({
//   dest: './app/dist/temp_avatar_uploads/',
//   limits: {
//     fileSize: 10000000
//   },

//   onFileSizeLimit: function (file) {   
//     console.log('Failed: ', file.originalname)
//     fs.unlink('./' + file.path) // delete the partially written file
//   }
// }));

//===== PASSPORT TO EXPRESS=====//
// set up express app
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser('rachelwantstomakecakebutneedseggs')); // read cookies (needed for auth)

app.use(bodyParser.urlencoded({
    extended: true
})); // get information from html forms

app.use(bodyParser.json({
    extended: true
})); // get information from html forms

// passport to express requires
// app.use(session({ secret: 'rachelwantstomakecakebutneedseggs' })); // session secret to 'prevent' session hijacking 

app.use(session({
    secret: 'rachelwantstomakecakebutneedseggs',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//===================//




// passport config
require('./components/IF_auth/passport')(passport);

//LIMITING UPLOADS TO 10MB  ///This is not working
app.use(connectBusboy({
    highWaterMark: 10 * 1024 * 1024,
    limits: {
        fileSize: 1024 * 1024 * 10 // 
    }
}));



// Socket.io Communication
io.sockets.on('connection', socket);

// passport routes ======================================================================
require('./components/IF_auth/auth_routes.js')(app, passport, landmarkSchema); // load our routes and pass in our app and fully configured passport

//-------------------------------------//
//---- Sending Feedback via Email -----//
//-------------------------------------//
app.post('/feedback', function(req, res) {
    if (req.body.emailText) {
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
    } else {
        res.send(500, 'bad email parameters');
    }
});



//-------------------------------------//
//---- Redis -----//
//-------------------------------------//
// var redis = require('redis');
// var client = redis.createClient(); //creates a new client 

var redis = require("redis"),
    client = redis.createClient();

//---------------------------------------//
//-------- Send Email Confirmation ------//
//---------------------------------------//


app.post('/email/confirm', function(req, res, next) {
	console.log("entering /email/confirm");

    if (!validateEmail(req.user.local.email)) {
		console.log('bad email address: ' + req.user.local.email);
		next('Please use a real email address');
		return;
	}

	if (!req.headers.host) {
		console.log("Cannot send confirmation mail without req.headers.host");
		next("Can not send confirmation mail: no host");
		return;
	}

    crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
		var email = req.user.local.email;

        User.findOne({'local.email': email},	function(err, user) {
            if (!user) {
                next('No account with that email address exists, or you signed up only through Facebook/Twitter');
				return;
            }

            user.local.confirmEmailToken = token;
            user.local.confirmEmailExpires = Date.now() + 15767999999; // about half a year before it expires
            user.save(function(err) {
				if (err) {
					return next(err);
				}

				var mailOptions = {
					to: email,
					from: 'Kip <noreply@kipapp.co>',
					subject: 'Kip – Confirm your email',
					text: 'Thanks for signing up for Kip! \n\n' +
                          'Please click on the following link to confirm your email:\n\n' +
                          'https://' + req.headers.host + '/email/confirm/' + token + '\n\n'
                };
                mailerTransport.sendMail(mailOptions, function(err) {
					if (err) {
						return next(err);
					}
                    console.log('sent confirmation email');
                    res.send("｡◕‿◕｡");
                });
            });
        });
    });

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
});


app.post('/email/request_confirm/:token', function(req, res) {

    User.findOne({
        'local.confirmEmailToken': req.params.token,
        'local.confirmEmailExpires': {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            res.send('Email confirm token is invalid or has expired.');
        } else {
            user.local.confirmedEmail = true;
            user.local.confirmEmailToken = undefined;
            user.local.confirmEmailExpires = undefined;

            user.save(function(err) {
                res.status(200).send('Email address confirmed');
            });
        }
    });
});



//====================================//
//======= RESET PASSWORD MAILER ======//
//====================================//

app.post('/forgot', function(req, res, next) {

    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            if (validateEmail(req.body.email)) {
                User.findOne({
                    'local.email': req.body.email
                }, function(err, user) {
                    if (!user) {
                        done('No account with that email address exists, or you signed up only through Facebook/Twitter');
                    } else {
                        user.local.resetPasswordToken = token;
                        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        user.save(function(err) {
                            done(err, token, user);
                        });
                    }
                });
            } else {
                return done('Please use a real email address');
            }
        },
        function(token, user, done) {
            if (req.headers.host) {
                var mailOptions = {
                    to: user.local.email,
                    from: 'IF Bubbl <mail@bubbl.li>',
                    subject: 'Bubbl Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
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
    User.findOne({
        'local.resetPasswordToken': req.params.token,
        'local.resetPasswordExpires': {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            //req.flash('error', 'Password reset token is invalid or has expired.');
            // return res.redirect('/#/forgot');
            res.send(403);
        } else {
            res.send('yeah its fine');
        }
    });
});

app.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                'local.resetPasswordToken': req.params.token,
                'local.resetPasswordExpires': {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    //return res.redirect('/#/forgot');
                    res.send(403);
                } else {
                    if (req.body.password.length >= 6) {
                        user.local.password = user.generateHash(req.body.password);
                        user.local.resetPasswordToken = undefined;
                        user.local.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    } else {
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



/* Helpers */

//Parts (just a bit at this point) of express code from: https://github.com/dalcib/angular-phonecat-mongodb-rest
//To allow use ObjectId or other any type of _id
var objectId = function(_id) {
    if (_id.length === 24 && parseInt(db.ObjectId(_id).getTimestamp().toISOString().slice(0, 4), 10) >= 2010) {
        return db.ObjectId(_id);
    }
    return _id;
}

//Function callback
var fn = function(req, res) {
    res.contentType('application/json');
    var fn = function(err, doc) {
        if (err) {
            if (err.message) {
                doc = {
                    error: err.message
                }
            } else {
                doc = {
                    error: JSON.stringify(err)
                }
            }
        }
        if (typeof doc === "number" || req.params.cmd === "distinct") {
            doc = {
                ok: doc
            };
        }
        res.send(doc);
    };
    return fn;
};

/* Routes */


// route to test if the user is logged in or not 
app.get('/api/user/loggedin', function(req, res) {
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.sendStatus(500);
    }
});

//--- SUPER USER ROUTER ----//
app.use('/api/announcements', require('./components/IF_superuser/announcement_routes'));
app.use('/api/contests', require('./components/IF_superuser/contest_routes'));
app.use('/api/entries', require('./components/IF_superuser/contestEntry_routes'));
//--- INSTAGRAM / TWITTER ROUTER ----//
app.use('/api/instagrams', require('./components/IF_apiroutes/instagram_routes'));
//--- IP GEOLOCATION AND NAME ROUTER ----//
app.use('/api/geolocation', require('./components/IF_apiroutes/geo_routes'));

// PROFILE SECTION =========================
app.get('/api/user/profile', isLoggedIn, function(req, res) {

    // // console.log(req);
    // console.log('---------- before ---------------');
    // console.log(req.sessionStore);

    // req.session.reload(function(err) {
    //   // session updated

    //   console.log('---------- after ---------------');

    //   console.log(req.sessionStore);
    // })

    // console.log(req.sessionStore);


    var qw = {
        'world': true,
        'permissions.ownerID': req.user._id
    };
    landmarkSchema.find(qw, function(err, lm) {
        res.send(lm);
    });
});




// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {

        if (req.headers.authorization) {

            if (req.headers.authorization.indexOf('asic') > -1) {
                passport.authenticate('local-basic', function(err, user, info) {
                    if (err) {
                        res.sendStatus(401);
                    }
                    if (!user) {
                        res.sendStatus(401);
                    }
                    if (user) {
                        return next();
                    }
                })(req, res, next)
            } else if (req.headers.authorization.indexOf('earer') > -1) {
                passport.authenticate('bearer', function(err, user, info) {
                    if (err) {
                        res.sendStatus(401);
                    }
                    if (!user) {
                        res.sendStatus(401);
                    }
                    if (user) {
                        return next();
                    }
                })(req, res, next)
            }
        }


    } else {
        return next();
    }
}



// Query

// Search
app.get('/api/textsearch', function(req, res) {
    text_search(req.query.textQuery, req.query.userLat, req.query.userLng, req.query.localTime, res);
});
//In Bubble Search
app.get('/api/bubblesearch/:type', function(req, res) {
    bubble_search(req.params.type, req.query, res);
});

/* Logging Analytics */

//Creates new analytics object 
app.post('/api/analytics/:action', function(req, res) {
    var analytics = new analyticsSchema();

    //objects sent from front-end will be sent to redis as-is, with splitting occuring at a later point.
    client.rpush(analytics, function(err, reply) {
        console.log(reply);
        res.send('pushed!');
    });

    // DONE!  then a separate node process dumps the redis cache to db

    //From Stackoverflow:
    // Create a caching service. This is really the hardest part, but the general flow looks something like this:
    // make request to cache service.
    // cache service checks redis for cached object based on query.
    // cache returns data from redis if it exists OR from mongo if it doesn't exist.
    // if data didn't already exist in redis or had expired, cache service writes data to redis.

    // client.get(cacheKey, function(err, data) {
    //     // data is null if the key doesn't exist
    //     if (err || data === null) {
    //         mongoose.model('users').find(function(err, users) {
    //             console.log('Setting cache: ' + cacheKey);
    //             client.set(cacheKey, users, redis.print);
    //             res.send(users);
    //         });
    //     } else {
    //         return data;
    //     }
    // });

});




// Save world visitor anonymously
app.post('/api/visit/create', function(req, res) {

    if (req.body.worldID) {
        var vs = new visitSchema({
            worldID: req.body.worldID
        });

        //logged in
        if (req.user) {
            if (req.user._id) {
                vs.userID = req.user._id;
            }
        }

        if (req.body.userName) {
            vs.userName = req.body.userName;
        }

        vs.save(function(err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.status(200).send([data]);
            }
        });
    } else {
        res.status(200).send(['need worldID to save visit']);
    }
});



//for adding / removing items from widget services
function manageServerWidgets(id, tag, widgets) {

    if (widgets.twitter == undefined) {
        widgets.twitter = false;
    }

    if (widgets.instagram == undefined) {
        widgets.instagram = false;
    }

    serverwidgetsSchema.findOne({
        worldID: id
    }, function(err, sw) {

        if (err) {
            console.log(err);
        } else {

            //doesn't exist, create new
            if (sw == null) {
                //doc doesn't exist, write new
                console.log('new');

                var sw = new serverwidgetsSchema({
                    worldID: id,
                    worldTag: tag,
                    twitter: widgets.twitter,
                    instagram: widgets.instagram
                });

                sw.save(function(err, data) {
                    if (err)
                        console.log(err);
                    else {
                        console.log('SAVED NEW ' + data);
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
                sw.save(function(err, data) {
                    if (err)
                        console.log(err);
                    else {
                        console.log('SAVED UPDATE ' + data);
                    }
                });

            }

        }

    });

}


//upload profile pictures for worlds and landmarks and (users?)
app.post('/api/upload', isLoggedIn, function(req, res) {

    var fstream;
    req.pipe(req.busboy);

    req.busboy.on('file', function(fieldname, file, filename, filesize, mimetype) {

        if (mimetype == 'image/jpeg' || mimetype == 'image/png' || mimetype == 'image/gif' || mimetype == 'image/jpg') {
            if (req.headers['content-length'] > 10000000) {
                console.log("Filesize too large.");
            } else {

                var stuff_to_hash = filename + (new Date().toString());
                var object_key = crypto.createHash('md5').update(stuff_to_hash).digest('hex');
                var fileType = filename.split('.').pop();
                var date_in_path = (new Date().getUTCFullYear()) + "/" + (new Date().getUTCMonth()) + "/"
                var current = object_key + "." + fileType;
                var tempPath = "app/dist/temp_avatar_uploads/" + current;
                var awsKey = date_in_path + current;

                fstream = fs.createWriteStream(tempPath);
                var count = 0;
                var totalSize = req.headers['content-length'];

                file.on('data', function(data) {
                    count += data.length;
                    var percentUploaded = Math.floor(count / totalSize * 100);
                    console.log(percentUploaded);
                    //res.write(parseInt(percentUploaded));
                    //io.emit('uploadstatus',{ message: "Uploaded " + percentUploaded + "%"} );
                })

                file.pipe(fstream);

                fstream.on('close', function() {
                    var buffer = readChunk.sync(tempPath, 0, 262);

                    if (fileTypeProcess(buffer) == false) {
                        fs.unlink(tempPath); //Need to add an alert if there are several attempts to upload bad files here
                    } else {
                        im.crop({
                            srcPath: tempPath,
                            dstPath: tempPath,
                            width: 300,
                            height: 300,
                            quality: 85,
                            gravity: "Center"
                        }, function(err, stdout, stderr) {

                            fs.readFile(tempPath, function(err, fileData) {

                                var s3 = new AWS.S3();

                                s3.putObject({
                                    Bucket: 'if-server-avatar-images',
                                    Key: awsKey,
                                    Body: fileData,
                                    ACL: 'public-read'
                                }, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.write("https://s3.amazonaws.com/if-server-avatar-images/" + awsKey);
                                        res.end();
                                        fs.unlink(tempPath);
                                    }
                                });
                            });

                        });
                    }
                });
            }
        } else {
            res.send(500, 'Please use .jpg .png or .gif');


        }
    });


});

//upload pictures not for avatars
app.post('/api/uploadPicture', isLoggedIn, function(req, res) {

    var uploadContents = '';

    //capturing incoming extra data in upload
    req.busboy.on('field', function(key, val) {
        uploadContents += val;
    });

    //Detect if captured on iPhone and set iphone boolean
    // console.log('user-AGENT IS ', req.headers)
    // var iphone = req.headers['user-agent'].indexOf('iPhone') > -1 ? true : false;


    var fstream;
    req.pipe(req.busboy);

    req.busboy.on('file', function(fieldname, file, filename, filesize, mimetype) {

        if (!mimetype == 'image/jpeg' || !mimetype == 'image/png' || !mimetype == 'image/gif' || !mimetype == 'image/jpg') {

            res.send(500, 'Please use .jpg .png or .gif');

        }
        if (req.headers['content-length'] > 10000000) {
            console.log("Filesize too large.");
        } else {

            var stuff_to_hash = filename + (new Date().toString());
            var object_key = crypto.createHash('md5').update(stuff_to_hash).digest('hex');
            var fileType = filename.split('.').pop();
            var date_in_path = (new Date().getUTCFullYear()) + "/" + (new Date().getUTCMonth()) + "/"
            var current = object_key + "." + fileType;
            var tempPath = "app/dist/temp_general_uploads/" + current;
            var awsKey = date_in_path + current;
            fstream = fs.createWriteStream(tempPath);
            var count = 0;
            var totalSize = req.headers['content-length'];
            var picorientation;
            file.on('data', function(data) {
                count += data.length;
                var percentUploaded = Math.floor(count / totalSize * 100);
                io.emit('uploadstatus', {
                    message: "Uploaded " + percentUploaded + "%"
                });
            }).pipe(fstream);

            fstream.on('close', function() {

                    var buffer = readChunk.sync(tempPath, 0, 262);

                    if (fileTypeProcess(buffer) == false) {
                        fs.unlink(tempPath); //Need to add an alert if there are several attempts to upload bad files here
                    } else {

                        //AUTO-REORIENT
                        im.convert([tempPath, '-auto-orient', '-quality', '0.8', '-format', '%[exif:orientation]', tempPath], function(err, stdout, stderr) {
                            if (err) console.log(err)

                            fs.readFile(tempPath, function(err, fileData) {
                                var s3 = new AWS.S3();
                                s3.putObject({
                                    Bucket: 'if-server-general-images',
                                    Key: awsKey,
                                    Body: fileData,
                                    ACL: 'public-read'
                                }, function(err, data) {

                                    if (err)
                                        console.log(err);
                                    else {
                                        res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                                        fs.unlink(tempPath);

                                        //Testing redis
                                        client.rpush({
                                            test: 'test'
                                        }, function(err, reply) {
                                            console.log('redis reply: ', reply);

                                        });

                                        var options = {
                                                url: "https://api.cloudsightapi.com/image_requests",
                                                headers: {
                                                    "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
                                                },
                                                qs: {
                                                    'image_request[remote_image_url]': "https://s3.amazonaws.com/if-server-general-images/" + awsKey,
                                                    'image_request[locale]': 'en-US',
                                                    'image_request[language]': 'en'
                                                }
                                            }
                                            //CLOUDSIGHT STUFF: Run aws image and retrieve description, store in hashtag of contest entry
                                        request.post(options, function(err, res, body) {
                                            if (err) console.log(err);
                                            var data = JSON.parse(body);

                                            var results = {
                                                status: 'not completed'
                                            };
                                            var description = '';

                                            var tries = 0;

                                            async.whilst(
                                                function() {
                                                    return (results.status == 'not completed' && tries < 10);
                                                },
                                                function(callback) {
                                                    var options = {
                                                        url: "https://api.cloudsightapi.com/image_responses/" + data.token,
                                                        headers: {
                                                            "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
                                                        }
                                                    }

                                                    request(options, function(err, res, body) {
                                                        if (err) console.log(err);
                                                        console.log('cloudsight status is..', body)
                                                        body = JSON.parse(body);
                                                        if (body.status == 'completed') {
                                                            results.status = 'completed';
                                                            description = body.name;
                                                        }
                                                    })
                                                    tries++;
                                                    setTimeout(callback, 5000);
                                                },
                                                function(err) {
                                                    console.log('Description of image is..', description)
                                                        //additional content was passed with the image, handle it here
                                                    if (uploadContents) {
                                                        try {
                                                            uploadContents = JSON.parse(uploadContents);
                                                        } catch (err) {
                                                            console.log(err);
                                                        }
                                                        if (uploadContents.type == 'retail_campaign') {
                                                            var newString = description.replace(/[^A-Z0-9]/ig, "");
                                                            uploadContents.description = newString;
                                                            submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                                                        }
                                                    }

                                                }
                                            );


                                        })

                                    }
                                });
                            });
                        })

                        // im.identify(['-format', '%[exif:orientation]', tempPath], function(err, output) {
                        //     if (err) throw err;
                        //     console.log('orientation: ' + output);
                        //     var picorientation = output.toString().trim();
                        //     switch (picorientation) {
                        //         case '1':
                        //             im.convert([tempPath, '-resize', '600', '-quality', '0.8', tempPath], function(err, stdout, stderr) {
                        //                 if (err) console.log(err)
                        //                 console.log('not flipped.')
                        //                 fs.readFile(tempPath, function(err, fileData) {
                        //                     var s3 = new AWS.S3();
                        //                     s3.putObject({
                        //                         Bucket: 'if-server-general-images',
                        //                         Key: awsKey,
                        //                         Body: fileData,
                        //                         ACL: 'public-read'
                        //                     }, function(err, data) {

                        //                         if (err)
                        //                             console.log(err);
                        //                         else {
                        //                             res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                        //                             fs.unlink(tempPath);

                        //                             //additional content was passed with the image, handle it here
                        //                             if (uploadContents) {
                        //                                 try {
                        //                                     uploadContents = JSON.parse(uploadContents);
                        //                                 } catch (err) {
                        //                                     console.log(err);
                        //                                 }
                        //                                 if (uploadContents.type == 'retail_campaign') {
                        //                                     submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                        //                                 }
                        //                             }

                        //                         }
                        //                     });
                        //                 });
                        //             })
                        //             break;
                        //         case '3':
                        //             im.convert([tempPath, '-resize', '600', '-quality', '0.8', '-rotate', '180', tempPath], function(err, stdout, stderr) {
                        //                 if (err) console.log(err)
                        //                 console.log('flipped')
                        //                 fs.readFile(tempPath, function(err, fileData) {
                        //                     var s3 = new AWS.S3();
                        //                     s3.putObject({
                        //                         Bucket: 'if-server-general-images',
                        //                         Key: awsKey,
                        //                         Body: fileData,
                        //                         ACL: 'public-read'
                        //                     }, function(err, data) {

                        //                         if (err)
                        //                             console.log(err);
                        //                         else {
                        //                             res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                        //                             fs.unlink(tempPath);

                        //                             //additional content was passed with the image, handle it here
                        //                             if (uploadContents) {
                        //                                 try {
                        //                                     uploadContents = JSON.parse(uploadContents);
                        //                                 } catch (err) {
                        //                                     console.log(err);
                        //                                 }
                        //                                 if (uploadContents.type == 'retail_campaign') {
                        //                                     submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                        //                                 }
                        //                             }

                        //                         }
                        //                     });
                        //                 });
                        //             })
                        //             break;
                        //         case '6':
                        //             console.log('hitting ', picorientation);
                        //             im.convert([tempPath, '-resize', '600', '-quality', '0.8', '-rotate', '90', tempPath], function(err, stdout, stderr) {
                        //                 if (err) console.log(err)
                        //                 console.log('flipped!!!!!')
                        //                 fs.readFile(tempPath, function(err, fileData) {
                        //                     var s3 = new AWS.S3();
                        //                     s3.putObject({
                        //                         Bucket: 'if-server-general-images',
                        //                         Key: awsKey,
                        //                         Body: fileData,
                        //                         ACL: 'public-read'
                        //                     }, function(err, data) {

                        //                         if (err)
                        //                             console.log(err);
                        //                         else {
                        //                             console.log('front end link is https://s3.amazonaws.com/if-server-general-images/' + awsKey)
                        //                             res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                        //                             fs.unlink(tempPath);

                        //                             //additional content was passed with the image, handle it here
                        //                             if (uploadContents) {
                        //                                 try {
                        //                                     uploadContents = JSON.parse(uploadContents);
                        //                                 } catch (err) {
                        //                                     console.log(err);
                        //                                 }
                        //                                 if (uploadContents.type == 'retail_campaign') {
                        //                                     submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                        //                                 }
                        //                             }

                        //                         }
                        //                     });
                        //                 });
                        //             })
                        //             break;
                        //         case '8':
                        //             im.convert([tempPath, '-resize', '600', '-quality', '0.8', '-rotate', '270', tempPath], function(err, stdout, stderr) {
                        //                 if (err) console.log(err)
                        //                 console.log('flipped!!!!!')
                        //                 fs.readFile(tempPath, function(err, fileData) {
                        //                     var s3 = new AWS.S3();
                        //                     s3.putObject({
                        //                         Bucket: 'if-server-general-images',
                        //                         Key: awsKey,
                        //                         Body: fileData,
                        //                         ACL: 'public-read'
                        //                     }, function(err, data) {

                        //                         if (err)
                        //                             console.log(err);
                        //                         else {
                        //                             res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                        //                             fs.unlink(tempPath);

                        //                             //additional content was passed with the image, handle it here
                        //                             if (uploadContents) {
                        //                                 try {
                        //                                     uploadContents = JSON.parse(uploadContents);
                        //                                 } catch (err) {
                        //                                     console.log(err);
                        //                                 }
                        //                                 if (uploadContents.type == 'retail_campaign') {
                        //                                     submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                        //                                 }
                        //                             }

                        //                         }
                        //                     });
                        //                 });
                        //             })
                        //             break;
                        //         default:
                        //             im.convert([tempPath, '-resize', '600', '-quality', '0.8', tempPath], function(err, stdout, stderr) {
                        //                 if (err) console.log(err)
                        //                 console.log('not flipped.')
                        //                 fs.readFile(tempPath, function(err, fileData) {
                        //                     var s3 = new AWS.S3();
                        //                     s3.putObject({
                        //                         Bucket: 'if-server-general-images',
                        //                         Key: awsKey,
                        //                         Body: fileData,
                        //                         ACL: 'public-read'
                        //                     }, function(err, data) {

                        //                         if (err)
                        //                             console.log(err);
                        //                         else {

                        //                             res.send("https://s3.amazonaws.com/if-server-general-images/" + awsKey);
                        //                             fs.unlink(tempPath);

                        //                             //additional content was passed with the image, handle it here
                        //                             if (uploadContents) {
                        //                                 try {
                        //                                     uploadContents = JSON.parse(uploadContents);
                        //                                 } catch (err) {
                        //                                     console.log(err);
                        //                                 }
                        //                                 if (uploadContents.type == 'retail_campaign') {
                        //                                     submitContestEntry("https://s3.amazonaws.com/if-server-general-images/" + awsKey, uploadContents, req.user._id); //contest entry, send to bac
                        //                                 }
                        //                             }

                        //                         }
                        //                     });
                        //                 });
                        //             })
                        //     } //END OF SWITCH
                        // }); //END OF IM.IDENTIFY




                    } //END OF INNER ELSE
                }) //END OF FS.STREAM ON
        } //END OF OUTER ELSE

    });
});



///////////////////////////
///////TILE MAP APIs///////  
///////////////////////////

//upload map to temp folder locally until map built
app.post('/api/upload_maps', isLoggedIn, function(req, res) {

    var fileBuffer = new Buffer('');

    // TEMPORARY FILE UPLOAD AND DELETE, needs to direct stream from form upload...or keep like this?
    var fstream;
    req.pipe(req.busboy);

    req.busboy.on('file', function(fieldname, file, filename, filesize, mimetype) {

        var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename;
        var fileType = filename.split('.').pop();
        if (req.headers['content-length'] > 25000000) {
            console.log("Filesize too large.");
        } else {
            if (mimetype == 'image/jpg' || mimetype == 'image/png' || mimetype == 'image/jpeg') {

                while (1) {
                    var fileNumber = Math.floor((Math.random() * 100000000) + 1); //generate random file name
                    var fileNumber_str = fileNumber.toString();
                    var current = fileNumber_str + '.' + fileType;

                    //checking for existing file, if unique, write to dir
                    if (fs.existsSync("app/dist/temp_map_uploads/" + current)) {
                        continue; //if there are max # of files in the dir this will infinite loop...
                    } else {

                        var newPath = "app/dist/temp_map_uploads/" + current;

                        fstream = fs.createWriteStream(newPath);
                        file.pipe(fstream);
                        fstream.on('close', function() {

                            var buffer = readChunk.sync("app/dist/temp_map_uploads/" + current, 0, 262);

                            if (fileTypeProcess(buffer) == false) {
                                fs.unlink("app/dist/temp_map_uploads/" + current); //Need to add an alert if there are several attempts to upload bad files here
                                res.send(500);
                            } else {
                                res.send("temp_map_uploads/" + current);
                            }
                        });
                        break;
                    }
                }
            } else {
                console.log('Please use .jpg or .png');
                res.send(500, 'Please use .jpg or .png');
            }
        }
    });
});


//after map upload, the front end calls to this API to save world ID with temp URL and map ID for front end tracking
app.post('/api/temp_map_upload', isLoggedIn, function(req, res) {

    if (req.body.worldID) {
        landmarkSchema.findById(req.body.worldID, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else if (req.user._id == lm.permissions.ownerID) {
                //NEED TO ADD CHECKS FOR INCOMING DATA HERE
                var newMap = {
                    map_marker_viewID: req.body.map_marker_viewID,
                    floor_num: req.body.floor_num,
                    floor_name: req.body.floor_name,
                    temp_upload_path: req.body.temp_upload_path
                };

                //CHECK HERE IF OBJECT EXISTS BEFORE PUSH!!
                function mapExists(callback) {
                    callback(!_.isEmpty(_.where(lm.style.maps.localMapArray, {
                        map_marker_viewID: req.body.map_marker_viewID
                    })));
                }
                mapExists(function(d) {
                    console.log('exist?', d);
                });

                lm.style.maps.localMapArray.push(newMap);
                lm.save(function(err, landmark) {
                    if (err) {
                        console.log('error');
                    } else {
                        //console.log(landmark);
                        console.log('success');

                        console.log(JSON.stringify(landmark));
                        res.status(200).send(landmark);
                    }
                });
            } else {
                console.log('unauthorized user');
            }
        });
    }
});

//map send to tile server to build 
app.post('/api/build_map', isLoggedIn, function(req, res) {

    if (fs.existsSync(__dirname + '/app/dist/' + req.body.mapIMG)) {

        //this entire area hurts my eyes, i can't even D:
        var map_text = JSON.stringify(req.body.coords);
        map_text = map_text.replace(/\\"/g, '%22'); //ugh idk, just do it

        // after file saved locally, send to IF-Tiler server
        var r = request.post('http://107.170.180.141:3000/api/upload', function optionalCallback(err, httpResponse, body) {
            if (err) {
                //deleting temp map upload
                if (fs.existsSync(__dirname + '/app/dist/' + req.body.mapIMG)) {
                    //delete temp file
                    fs.unlink(__dirname + '/app/dist/' + req.body.mapIMG, function(err) {
                        if (err) throw err;
                        console.log('successfully deleted ' + __dirname + '/app/dist/' + req.body.mapIMG);
                    });
                } else {
                    console.log('could not delete, file does not exist: ' + __dirname + '/app/dist/' + req.body.mapIMG);
                }
                return console.error('upload failed:', err);
            } else {
                console.log('Upload successful! Server responded with:', body);
                worldMapTileUpdate(req, res, body, req.mapBuild);
                //deleting temp map upload
                if (fs.existsSync(__dirname + '/app/dist/' + req.body.mapIMG)) {
                    //delete temp file
                    fs.unlink(__dirname + '/app/dist/' + req.body.mapIMG, function(err) {
                        if (err) throw err;
                        console.log('successfully deleted ' + __dirname + '/app/dist/' + req.body.mapIMG);
                    });
                } else {
                    console.log('could not delete, file does not exist: ' + __dirname + '/app/dist/' + req.body.mapIMG);
                }
            }
        });

        var form = r.form();
        form.append('my_buffer', new Buffer([1, 2, 3]));
        form.append(map_text, fs.createReadStream(__dirname + '/app/dist/' + req.body.mapIMG)); //passing fieldname as json cause ugh.
    } else {
        console.log('map image doesnt exist');
    }

});


//updating world map with return from tile server
function worldMapTileUpdate(req, res, data, mapBuild) {

    var tileRes = JSON.parse(data); //incoming box coordinates

    landmarkSchema.findById(tileRes.worldID, function(err, lm) {
        if (!lm) {
            console.log(err);
        } else if (req.user._id == lm.permissions.ownerID) {

            var min = tileRes.zooms[0];
            var max = tileRes.zooms.slice(-1)[0];

            if (lm.style.maps.localMapArray) {
                for (var i = 0; i < lm.style.maps.localMapArray.length; i++) { //better way to do this with mongo $set 

                    if (lm.style.maps.localMapArray[i].map_marker_viewID) {
                        if (lm.style.maps.localMapArray[i].map_marker_viewID == req.body.map_marker_viewID) {
                            lm.style.maps.localMapArray[i]['temp_upload_path'] = '';
                            lm.style.maps.localMapArray[i]['localMapID'] = tileRes.mapURL;
                            lm.style.maps.localMapArray[i]['localMapName'] = tileRes.worldID;
                            lm.style.maps.localMapArray[i]['localMapOptions'] = {
                                minZoom: min,
                                maxZoom: max,
                                attribution: "IF",
                                reuseTiles: true,
                                tms: true
                            };
                            saveMap();
                            break;
                        }
                    }
                }

                function saveMap() {
                    lm.markModified('style.maps.localMapArray'); //letting mongo know to update obj in arr
                    lm.save(function(err, landmark) {
                        if (err) {
                            console.log('error');
                        } else {
                            console.log('map updated');
                            res.status(200).send(landmark);
                        }
                    });
                }

            }

        } else {
            console.log('unauthorized user');
        }
    });
}

//updates the map floor number and floor name, eventually can replace the map layer too
app.post('/api/update_map', isLoggedIn, function(req, res) {
    if (req.body.worldID) {
        landmarkSchema.findById(req.body.worldID, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else if (req.user._id == lm.permissions.ownerID) {

                if (lm.style.maps.localMapArray) {

                    for (var i = 0; i < lm.style.maps.localMapArray.length; i++) { //better way to do this with mongo $set 
                        if (lm.style.maps.localMapArray[i].map_marker_viewID) {
                            if (lm.style.maps.localMapArray[i].map_marker_viewID == req.body.map_marker_viewID) { //finding right item in array

                                if (req.body.floor_num) {
                                    if (!isNaN(parseFloat(req.body.floor_num)) && isFinite(req.body.floor_num)) { //real number
                                        lm.style.maps.localMapArray[i]['floor_num'] = req.body.floor_num;
                                    } else {
                                        console.log('not a real number');
                                    }
                                }
                                if (req.body.floor_name) {
                                    lm.style.maps.localMapArray[i]['floor_name'] = req.body.floor_name;
                                }

                                if (req.body.floor_name || req.body.floor_num) { //ok update and save kthx
                                    saveMap();
                                    break;
                                } else {
                                    console.log('nothing to update');
                                }
                            }
                        }
                    }

                    function saveMap() {
                        lm.markModified('style.maps.localMapArray'); //letting mongo know to update obj in arr
                        lm.save(function(err, landmark) {
                            if (err) {
                                console.log('error');
                            } else {
                                console.log('map updated');
                                res.status(200).send(landmark);
                            }
                        });
                    }

                }
            } else {
                console.log('unauthorized user');
            }
        });
    }

});

//remove map from map array
app.post('/api/delete_map', isLoggedIn, function(req, res) {

    if (req.body.worldID) {

        landmarkSchema.findById(req.body.worldID, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else if (req.user._id == lm.permissions.ownerID) {

                if (lm.style.maps.localMapArray) {
                    for (var i = 0; i < lm.style.maps.localMapArray.length; i++) { //better way to do this with mongo $set 
                        if (lm.style.maps.localMapArray[i].map_marker_viewID) {
                            if (lm.style.maps.localMapArray[i].map_marker_viewID == req.body.map_marker_viewID) { //found right item in array
                                //**********//
                                //if(lm.style.maps.localMapArray[i].localMapID){
                                //if map built (localMapID) CALL TO TILE SERVER HERE TO REMOVE MAP TILES
                                //**********//
                                lm.style.maps.localMapArray.splice(i, 1); //delete the map
                                saveMap();
                                break;
                            }
                        }
                    }
                    //this function can be used across 
                    function saveMap() {
                        lm.markModified('style.maps.localMapArray'); //letting mongo know to update obj in arr
                        lm.save(function(err, landmark) {
                            if (err) {
                                console.log('error');
                            } else {
                                console.log('map updated');
                                res.status(200).send(landmark);
                            }
                        });
                    }
                }
            } else {
                console.log('unauthorized user');
            }
        });
    }
});


/////////////////////
/////////////////////


///////////////////////
// ANON USER HANDLING//
//////////////////////

app.post('/api/anon_user/create', function(req, res) {

    //expecting lat lon time

    var au = new anonUserSchema({});

    //

    console.log(req.body);

    au.instances.push({
        userTime: req.body.userTime
    });

    au.save(function(err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.status(200).send([data._id]);
            //NEW SESSION ID
        }
    });

});


//check user ID
// CHECK IF USER EXISTS
// THEN IF YES: GEN NEW SESSION ID AND RETURN
// IF NOT, GEN NEW USER AND SEND BACK SESSION ID AND USER ID 


app.post('/api/anon_user/update', function(req, res) {

    //expecting lat lon time
    //expecting sessionID to track current user session to find and update in arr

    console.log(req.body);

    if (req.body.anonID) {

        //IF USER ID DOESN"T EXIST CREATE NEW USER AND SEND TAHT ID BACK

        anonUserSchema.findById(req.body.anonID, function(err, au) {

            au.instances.push({
                userTime: req.body.userTime
            });

            au.save(function(err, data) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.status(200).send([data._id]);
                }
            });

        });

    }


});

///////////////////////////
//END ANON USER HANDLING///
//////////////////////////

//looking for meetups in system created by user who logs in via meetup, then add them as owner
app.post('/api/process_meetups', isLoggedIn, function(req, res) {

    if (req.user.meetup) {
        if (req.user.meetup.id) {

            //find new meetups user organizes on Meetup
            findNewMeetups(parseInt(req.user.meetup.id), req.user._id, function(err) {
                findRelatedMeetups();
            });

            //after new meetups created, find any others in DB tied to user
            function findRelatedMeetups() {
                landmarkSchema.find({
                    'source_meetup.event_hosts.member_id': parseInt(req.user.meetup.id)
                }, function(err, ls) {

                    if (err) {
                        res.send({
                            err: 'there was an error'
                        });
                        console.log('there was an error');
                    } else if (ls) {

                        async.forEach(ls, function(obj, done) {

                            //skip if there's already an owner ID
                            if (obj.permissions) {
                                if (obj.permissions.ownerID) {
                                    if (obj.permissions.ownerID.length > 1) {
                                        done();
                                    } else {
                                        updateOwnerID();
                                    }
                                } else {
                                    updateOwnerID();
                                }
                            } else {
                                updateOwnerID();
                            }

                            function updateOwnerID() {
                                obj.permissions.ownerID = req.user._id;
                                console.log('update=');
                                obj.save(function(err, data) {
                                    if (err)
                                        console.log(err);
                                    else {
                                        console.log('Updated Owner on world');
                                    }
                                });
                                done();
                            }

                        }, function(err) {
                            if (err) {
                                console.log(err);
                            }
                            res.send('success');
                            console.log('added user as owner to all matching worlds');
                        });

                    } else {
                        console.log('no results');
                        res.send('no results');
                    }

                });
            }

        } else {
            console.log('user doesnt have meetup id');
            res.send('could not find any matching worlds');
        }
    } else {
        console.log('user doesnt have meetup entry');
        res.send('could not find any matching worlds');
    }

});

//this finds the latest meetups by signed in Meetup user
function findNewMeetups(meetupID, userID, callback) {

    findNew(function(err) {
        callback();
    });

    function findNew(callback) {

        var source = "https://api.meetup.com/2/profiles?&sign=true&photo-host=public&role=leads&member_id=" + meetupID + "&format=json&page=100&key=b22467d19d797837175c661932275c"
        request({
            uri: source
        }, function(err, response, body) {

            if (err) {
                console.log(err);
            }
            var roleArray = [];
            var results = JSON.parse(body).results;

            //adding only groups where member has a role value (are all roles admin though?)
            async.forEach(results, function(obj, done) {

                if (obj.role && obj.group) {
                    roleArray.push(obj.group.id.toString());
                }
                done();

            }, function(err) {
                if (err) {
                    console.log(err);
                }

                var toMeetupServer = {
                    "userID": userID,
                    "groupIDs": roleArray
                };

                postArray(function(err) {
                    callback();
                });

                function postArray(callback) {

                    request.post({
                        headers: {
                            'content-type': 'application/json'
                        },
                        url: 'http://localhost:3134/api/process_meetups',
                        body: JSON.stringify(toMeetupServer)
                    }, function(err, response, body) {
                        if (err) {
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
app.post('/api/updateuser', isLoggedIn, function(req, res) {

    if (req.body._id == req.user._id) {

        User.findById(req.user._id, function(err, us) {
            if (err) {
                console.log(err);
                res.status(200).send('there was an error');
            } else if (!us) {
                console.log('user not found');
                res.status(200).send('user not found');
            } else {

                if (req.body.addr) {
                    us.addr = req.body.addr;
                    //us.addrP = req.body.addrP;         
                }

                if (req.body.addr2) {
                    us.addr2 = req.body.addr2;
                }

                if (req.body.bday && req.body.bdayP) {
                    us.bday = req.body.bday;
                    us.bdayP = req.body.bdayP;
                }

                if (req.body.lang) {
                    us.lang = req.body.lang;
                }

                if (req.body.avatar) {
                    us.avatar = req.body.avatar;
                }

                if (req.body.name) {
                    us.name = req.body.name;

                    //use nick as unique if no userID
                    // if (!req.body.userID){
                    //   req.body.userID = req.body.name;
                    // }
                }

                if (req.body.note) {
                    us.note = req.body.note;
                }

                if (req.body.social) {

                    if (req.body.social.linkedIn && req.body.social.linkedInP) {
                        us.social.linkedIn = req.body.social.linkedIn;
                        us.social.linkedInP = req.body.social.linkedInP;
                    }

                    if (req.body.social.twitter && req.body.social.twitterP) {
                        us.social.twitter = req.body.social.twitter;
                        us.social.twitterP = req.body.social.twitterP;
                    }

                    if (req.body.social.facebook && req.body.social.facebookP) {
                        us.social.facebook = req.body.social.facebook;
                        us.social.facebookP = req.body.social.facebookP;
                    }

                    if (req.body.social.gplus && req.body.social.gplusP) {
                        us.social.gplus = req.body.social.gplus;
                        us.social.gplusP = req.body.social.gplusP;
                    }

                    if (req.body.social.github && req.body.social.githubP) {
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
                if (req.body.profileID) {

                    //if missing profileID, try to fill it in using name
                    if (req.body.profileID == 'undefined' && req.body.name) {

                        uniqueProfileID(req.body.name, function(output) {
                            us.profileID = output;
                            saveUser();
                        });
                    } else if (req.body.profileID == 'undefined' && us.name) {

                        uniqueProfileID(us.name, function(output) {
                            us.profileID = output;
                            saveUser();
                        });
                    } else if (req.body.profileID == 'undefined') {
                        req.body.profileID = 'user';

                        uniqueProfileID(req.body.profileID, function(output) {
                            us.profileID = output;
                            saveUser();
                        });
                    } else {
                        us.profileID = req.body.profileID;
                        saveUser();
                    }

                }
                //or just save if no unique userID
                else {
                    saveUser();
                }

                function saveUser() {
                    us.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.status(200).send('there was an error saving user info');
                        } else {
                            res.status(200).send('user updated');
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

    } else {
        console.log('unauthorized user');
    }
});


function uniqueProfileID(input, callback) {

    var uniqueIDer = urlify(input);
    urlify(uniqueIDer, function() {
        db.collection('users').findOne({
            'profileID': uniqueIDer
        }, function(err, data) {
            if (data) {
                var uniqueNumber = 1;
                var newUnique;

                async.forever(function(next) {
                        var uniqueNum_string = uniqueNumber.toString();
                        newUnique = data.profileID + uniqueNum_string;

                        db.collection('users').findOne({
                            'profileID': newUnique
                        }, function(err, data) {

                            if (data) {
                                uniqueNumber++;
                                next();
                            } else {
                                next('unique!'); // This is where the looping is stopped
                            }
                        });
                    },
                    function() {
                        callback(newUnique);
                    });
            } else {
                callback(uniqueIDer);
            }
        });
    });
}

//Route that picks a random bubble nearby
app.get('/api/find/random', function(req, res) {

    random_bubble(req.query.userCoordinate[0], req.query.userCoordinate[1], req.query.localTime, res);

});


//queries
app.get('/api/:collection', function(req, res) {

    var item, sort = {};

    //route to world
    if (req.params.collection == 'worlds') {

        worlds_query(req.query.userCoordinate[0], req.query.userCoordinate[1], req.query.localTime, res);
    }

    //querying landmark collection (events, places, etc)
    if (req.params.collection == 'landmarks' && req.query.parentID) {
        landmarkSchema.find({
                parentID: req.query.parentID,
                world: false
            }).sort({
                'time.start': 1
            }).exec(function(err, data) {
                if (err) {
                    res.send({
                        err: 'No Results'
                    });
                } else {
                    res.send({
                        landmarks: data
                    });
                }
            })
            //filtering landmarks
            /*switch (req.query.queryFilter) {
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
            }*/


    }
    //not a landmark query
    else {
        //places
        if (req.query.queryType == "places") {
            //do a location radius search here option
            //console.log(req.query.queryFilter);

            if (req.query.queryFilter == "all") {
                var qw = {
                    'type': 'place'
                };
                db.collection(req.params.collection).find(qw).sort({
                    _id: -1
                }).toArray(fn(req, res));
            } else {
                var qw = {
                    'subType': req.query.queryFilter
                };
                db.collection(req.params.collection).find(qw).sort({
                    _id: -1
                }).toArray(fn(req, res));
            }
        }

        //search
        if (req.query.queryType == "search") {

            var searchResults = {};

            var qw = {
                "name": {
                    $regex: ".*" + req.query.queryFilter + ".*",
                    $options: 'i'
                }
            };
            db.collection('landmarks').find(qw).sort({
                _id: -1
            }).toArray(addSearch(req, res));
            //searchResults.push(search);

            function addSearch(req, res) {
                // console.log(req);
                //console.log(res);
            }
        }
    }


    ////sticker query
    if (req.params.collection == 'stickers') {

        db.collection('stickers').find({
            worldID: req.query.worldID
        }).toArray(fn(req, res));

    }


    //querying tweets (social media and internal comments too, eventually)
    if (req.params.collection == 'tweets') {

        if (req.query.tag) { //hashtag filtering
            //has limit
            if (req.query.limit) {
                var Twlimit = parseInt(req.query.limit);
                var qw = {
                    'hashtags': {
                        '$in': [req.query.tag]
                    }
                };
                db.collection('tweets').find(qw).limit(Twlimit).sort({
                    _id: -1
                }).toArray(fn(req, res));
            }
            //no limit
            else {
                var qw = {
                    'hashtags': {
                        '$in': [req.query.tag]
                    }
                };
                db.collection('tweets').find(qw).sort({
                    _id: -1
                }).toArray(fn(req, res));
            }
        } else {
            if (req.query.limit) { //limited tweet query
                limit = parseInt(req.query.limit);
                db.collection(req.params.collection).find(qw).limit(limit).sort({
                    _id: -1
                }).toArray(fn(req, res));
            } else {
                db.collection(req.params.collection).find(qw).sort({
                    _id: -1
                }).toArray(fn(req, res));
            }
        }
    }

    //querying instagrams
    // if (req.params.collection == 'instagrams') {

    //     if (req.query.tag) { //hashtag filtering
    //         //has limit
    //         if (req.query.limit) {
    //             var Inlimit = parseInt(req.query.limit);
    //             var qw = {
    //                 'tags': {
    //                     $in: [req.query.tag]
    //                 }
    //             };
    //             db.collection('instagrams').find(qw).limit(Inlimit).sort({
    //                 _id: -1
    //             }).toArray(fn(req, res));
    //         }
    //         //no limit
    //         else {
    //             var qw = {
    //                 'tags': {
    //                     $in: [req.query.tag]
    //                 }
    //             };
    //             db.collection('instagrams').find(qw).sort({
    //                 _id: -1
    //             }).toArray(fn(req, res));
    //         }

    //     } else {
    //         if (req.query.limit) { //limited tweet query
    //             limit = parseInt(req.query.limit);
    //             db.collection(req.params.collection).find(qw).limit(limit).sort({
    //                 _id: -1
    //             }).toArray(fn(req, res));
    //         } else {
    //             db.collection(req.params.collection).find(qw).sort({
    //                 _id: -1
    //             }).toArray(fn(req, res));
    //         }
    //     }
    // }



    //querying worldchat
    if (req.params.collection == 'worldchat') {

        if (req.query.sinceID == 'none' || !req.query.sinceID) {
            var qw = {
                roomID: req.query.roomID
            }
        } else {
            var qw = {
                roomID: req.query.roomID,
                _id: {
                    $gt: mongoose.Types.ObjectId(req.query.sinceID)
                }
            }
        }

        if (req.query.limit == 1) {
            db.collection('worldchats').find(qw).sort({
                _id: -1
            }).limit(1).toArray(function(err, data) {
                if (err) {
                    console.log(err)
                    res.send(err);
                } else if (data) {
                    res.send(data);
                } else {
                    res.send(500, ['error']);
                }
            });
        } else {
            db.collection('worldchats').find(qw).limit(30).sort({
                _id: 1
            }).toArray(fn(req, res));
        }
    }



    //querying visits
    if (req.params.collection == 'visit') {

        //query for user history
        if (req.query.option == 'userHistory') {
            //logged in
            if (req.user) {
                if (req.user._id) {
                    var userString = req.user._id.toString();
                    var qw = {
                        userID: userString
                    }
                    console.log(qw);
                    db.collection('visits').find(qw).sort({
                        _id: -1
                    }).toArray(fn(req, res));
                }
            } else {
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
            db.collection('visits').find(qw).sort({
                _id: -1
            }).toArray(fn(req, res));
        }
    }

});
// rewrite it specifying collectoin to look in

//Read Stickers
app.get('/api/stickers/:id', function(req, res) {

    db.collection('stickers').findOne({
        _id: objectId(req.params.id)
    }, function(err, data) {

        if (data) {
            ///what do to here
            console.log(data);
            res.send(data);
        } else {
            console.log('540 : Sticker doesn not exist.');
            console.log(err);
            res.send({
                err: '540: Sticker does not exist.'
            });
        }
    })

});


// Read World
app.get('/api/worlds/:id', function(req, res) {

    if (req.query.m == "true") {

        db.collection('landmarks').findOne({
            _id: objectId(req.params.id),
            world: true
        }, function(err, data) {
            if (data) {
                combineQuery(data, res);
            } else {
                console.log('540: world doesnt exist');
                console.log(err);
                res.send({
                    err: '540: world doesnt exist'
                });
            }
        });
    }
    //return by IF id
    else {
        db.collection('landmarks').findOne({
            id: req.params.id,
            world: true
        }, function(err, data) {
            if (data) {
                combineQuery(data, res);
            } else {
                console.log('552: world doesnt exist');
                res.send({
                    err: '552: world doesnt exist'
                });
            }
        });
    }




    //if world, query for style and return
    function combineQuery(data, res) {
        //look up style associated with world

        if (data.style) {
            if (data.style.styleID) {
                styleSchema.findById(data.style.styleID, function(err, style) {
                    if (!style) {
                        console.log(err);
                    }
                    if (style) {

                        //IS THIS BUBBLE RETAIL?
                        if (data.category == 'Retail') {

                            var contestSubmissions = [];

                            contestSchema.findOne({
                                live: true
                            }, function(err, contest) {
                                if (err) console.log(err)
                                //IS USER LOGGED IN?
                                if (req.user) {
                                    //DOES USER HAVE RELEVANT SUBMISSIONS?
                                    if (req.user.submissions) {
                                        req.user.submissions.forEach(function(el) {
                                            if (el.worldID == data.id && el.contestID == contest._id) {
                                                contestSubmissions.push(el);
                                            }
                                        })
                                        var submits = _.pluck(contestSubmissions, hashtag, imgURL)
                                        res.send({
                                            contest: contest,
                                            submissions: submits,
                                            style: style,
                                            world: data
                                        });
                                    } //end of if user has submissions field
                                    //if user logged in but no submissions
                                    res.send({
                                        contest: contest,
                                        submissions: null,
                                        style: style,
                                        world: data
                                    });
                                } //END OF USER LOGGED IN
                            })
                        } //END OF RETAIL

                        //If user not logged in and world is not retail
                        res.send({
                            contest: null,
                            submissions: null,
                            style: style,
                            world: data
                        });
                    }
                });

                landmarkSchema.update({
                    _id: data._id
                }, {
                    $inc: {
                        views: 1
                    }
                }, function(err) {
                    if (err) {
                        console.log('view update failed');
                    } else {
                        console.log('view update succes');
                    }
                });


            }
        } else {
            console.log('world doesnt have a styleID');
        }

    }

});


// Save 
app.post('/api/:collection/create', isLoggedIn, function(req, res) {

    if (req.url == "/api/styles/create") {


        editStyle(); //edit style
    }

    if (req.url == "/api/projects/create") {
        editProject(); //edit project info
    }

    if (req.url == "/api/worldchat/create") {

        //console.log('image '+req.body.img);

        var wc = new worldchatSchema({
            userID: req.body.userID,
            roomID: req.body.roomID,
            nick: req.body.nick,
            kind: req.body.kind,
            msg: req.body.msg,
            pic: req.body.pic,
            href: req.body.href,
            avatar: req.body.avatar
        });

        if (req.body.sticker) {
            wc.sticker = {
                img: req.body.sticker.img,
                _id: req.body.sticker._id
            }
        }

        console.log(wc);
        wc.save(function(err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                //console.log(data);
                //console.log('SAVED new message');
                res.status(200).send([data]);
            }
        });
    }

    if ((req.url == "/api/stickers/create") && req.body.roomID
        //&& req.user._id
        && req.body.name) {

        var sticker = new stickerSchema({
            name: req.body.name,
            ownerID: req.body.userID,
            roomID: req.body.roomID
        });

        if (req.body.loc) {
            sticker.loc = {
                type: 'Point',
                coordinates: [req.body.loc.coordinates[0],
                    req.body.loc.coordinates[1]
                ]
            }
        }
        if (req.body.message) {
            sticker.message = req.body.message;
        }
        if (req.body.stickerKind) {
            sticker.stickerKind = req.body.stickerKind;
        }
        if (req.body.stickerAction) {
            sticker.stickerAction = req.body.stickerAction;
        }
        if (req.body.href) {
            sticker.href = req.body.href;
        }
        if (req.body.stats) {
            sticker.stats.alive = true; //should it start true? 
            if (req.body.stats.age) {
                sticker.stats.age = req.body.stats.age;
            }
            if (req.body.stats.important) {
                sticker.stats.important = req.body.stats.important;
            }
            if (req.body.stats.clicks) {
                sticker = req.body.stats.clicks; // or should it start at zero?
            }
        }
        if (req.body.stickerID) {
            sticker.stickerID = req.body.stickerID;
        }
        if (req.user.name) {
            sticker.ownerName = req.user.name;
        }
        sticker.avatar = req.body.avatar;

        if (req.body.iconInfo) {
            if (req.body.iconInfo.iconUrl) {
                sticker.iconInfo.iconUrl = req.body.iconInfo.iconUrl;
            }
            if (req.body.iconInfo.iconRetinaUrl) {
                sticker.iconInfo.iconRetinaUrl = req.body.iconInfo.iconRetinaUrl;
            }
            if (req.body.iconInfo.iconSize) {
                sticker.iconInfo.iconSize = req.body.iconInfo.iconSize;
            }
            if (req.body.iconInfo.iconAnchor) {
                sticker.iconInfo.iconAnchor = req.body.iconInfo.iconAnchor;
            }
            if (req.body.iconInfo.popupAnchor) {
                sticker.iconInfo.popupAnchor = req.body.iconInfo.popupAnchor;
            }
            if (req.body.iconInfo.iconOrientation) {
                sticker.iconInfo.iconOrientation = req.body.iconInfo.iconOrientation;
            }
        }

        sticker.save(function(err, data) {
            if (err) {
                console.log(data);
                console.log(err);
                res.send(err);
            } else {
                res.status(200).send(data);
            }
        })
    }


    //edit a world
    if (req.url == "/api/worlds/create") {
        var worldVal = true;

        if (req.body.editMap) { //adding map options to world
            worldMapEdit();
        } else {
            contSaveLandmark();
        }
    }
    //a landmark
    else if (req.url == "/api/landmarks/create") {
        var worldVal = false;
        contSaveLandmark();
    }

    //adding/editing map to world
    function worldMapEdit() {


        landmarkSchema.findById(req.body.worldID, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else if (req.user._id == lm.permissions.ownerID) { //check permissions to edit

                lm.style.maps.type = req.body.type; //local, cloud or both
                lm.style.maps.cloudMapID = req.body.mapThemeSelect.cloudMapID;
                lm.style.maps.cloudMapName = req.body.mapThemeSelect.cloudMapName;



                //NEED TO CHANGE TO ARRAY to push new marker types, eventually (???)
                lm.style.markers = {
                    name: req.body.markerSelect.name,
                    category: 'all'
                };

                lm.save(function(err, landmark) {
                    if (err) {
                        console.log('error');
                    } else {
                        //console.log(landmark);
                        console.log('success');
                    }
                });
            } else {
                console.log('unauthorized user'); //no permissions
            }
        });
    }


    function contSaveLandmark() {

        //new landmark, no name
        if (!req.body.name) {
            console.log('generating number id');
            idGen(crypto.randomBytes(15).toString('hex'));
        }

        //landmark already has name
        else {

            //not a new landmark
            if (!req.body.newStatus) {

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
                        if (lm.name == req.body.name) {
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
        function idGen(input) {
            var uniqueIDer = urlify(input);
            urlify(uniqueIDer, function() {
                db.collection('landmarks').findOne({
                    'id': uniqueIDer,
                    'world': worldVal
                }, function(err, data) {
                    if (data) {
                        var uniqueNumber = 1;
                        var newUnique;

                        async.forever(function(next) {
                                var uniqueNum_string = uniqueNumber.toString();
                                newUnique = data.id + uniqueNum_string;

                                db.collection('landmarks').findOne({
                                    'id': newUnique,
                                    'world': worldVal
                                }, function(err, data) {
                                    if (data) {
                                        console.log('entry found!');
                                        uniqueNumber++;
                                        next();
                                    } else {
                                        console.log('entry not found!');
                                        next('unique!'); // This is where the looping is stopped
                                    }
                                });
                            },
                            function() {
                                saveLandmark(newUnique);
                            });
                    } else {
                        saveLandmark(uniqueIDer);
                    }
                });
            });
        }

        //unique id found, now save/ update
        function saveLandmark(finalID) {

            //an edit
            if (!req.body.newStatus) {

                if (req.body.worldID) {
                    var lookupID = req.body.worldID;
                }
                if (req.body._id) {
                    var lookupID = req.body._id;
                }
                console.log('lookupID', lookupID);

                landmarkSchema.findById(lookupID, function(err, lm) {
                    if (!lm) {
                        console.log(err);
                    } else if (req.user._id == lm.permissions.ownerID) { //checking if logged in user is owner

                        lm.name = req.body.name;
                        lm.id = finalID;
                        lm.valid = 1;
                        lm.status = req.body.status || 'draft';

                        if (req.body.hasOwnProperty('loc')) {
                            if (req.body.loc.hasOwnProperty('coordinates')) {
                                lm.loc = {
                                    type: 'Point',
                                    coordinates: [req.body.loc.coordinates[0], req.body.loc.coordinates[1]]
                                };
                            }
                        }

                        lm.hasLoc = req.body.hasLoc || false;

                        if (req.body.avatar) {
                            lm.avatar = req.body.avatar;
                        }

                        if (req.body.parentID) {
                            lm.parentID = req.body.parentID;
                        }

                        if (req.body.description) {
                            lm.description = req.body.description;
                        }
                        if (req.body.summary) {
                            lm.summary = req.body.summary;
                        }
                        if (req.body.category) {
                            lm.category = req.body.category;
                        }
                        if (req.body.landmarkCategories) {
                            lm.landmarkCategories = req.body.landmarkCategories;
                        }

                        if (req.body.resources) {
                            if (req.body.resources.hashtag) {
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

                        //ADDING / UPDATING CLOUD MAP INFO
                        if (req.body.style) {
                            if (req.body.style.styleID) {
                                lm.style.styleID = req.body.style.styleID;
                            }
                            if (req.body.style.maps) {
                                if (req.body.style.maps.type) {
                                    lm.style.maps.type = req.body.style.maps.type;
                                }
                                if (req.body.style.maps.cloudMapID) {
                                    lm.style.maps.cloudMapID = req.body.style.maps.cloudMapID;
                                }
                                if (req.body.style.maps.cloudMapName) {
                                    lm.style.maps.cloudMapName = req.body.style.maps.cloudMapName;
                                }
                            }
                        }

                        if (req.body.hasOwnProperty('time')) {
                            lm.time.start = req.body.time.start;
                            lm.time.end = req.body.time.end;
                        }

                        //adding map location info
                        if (req.body.hasOwnProperty('loc_info')) {

                            if (req.body.loc_info.hasOwnProperty('floor_num')) {

                                lm.loc_info.floor_num = req.body.loc_info.floor_num;
                            }

                            if (req.body.loc_info.hasOwnProperty('room_name')) {

                                lm.loc_info.room_name = req.body.loc_info.room_name;
                            }

                        }

                        //---------- TAG HANDLING -----------//

                        if (req.body.tags && lm.tags) { //init check of objs
                            if (req.body.tags.length > 0) { //actually content
                                var count = 0;
                                for (var i = 0; i < req.body.tags.length; i++) { //loop content

                                    var newTag = req.body.tags[i].replace(/[^\w\s]/gi, ''); //removing all but alphanumeric and spaces

                                    if (lm.tags.indexOf(newTag) > -1) { //check if tag already in saved arr
                                        //exists dont add tag again
                                    } else {
                                        lm.tags.push(newTag); //else add to array
                                    }
                                    if (count == req.body.tags.length - 1) { //stop on final loop     
                                        checktoRemove(); //on loop end check to remove anything
                                    }
                                    count++;
                                }
                            } else {
                                checktoRemove(); //no new tags, check for removes
                            }

                            //check if we should really remove tags or go to save
                            function checktoRemove() {
                                if (req.body.landmarkTagsRemoved) {
                                    if (req.body.landmarkTagsRemoved.length > 0) { //actually contents
                                        removeTags();
                                    } else {
                                        saveLandmark();
                                    }
                                } else {
                                    saveLandmark();
                                }
                            }
                        } else if (req.body.landmarkTagsRemoved && lm.tags) { //no tags to add but remove tags plz
                            if (req.body.landmarkTagsRemoved.length > 0) { //actually contents
                                removeTags();
                            } else {
                                saveLandmark();
                            }
                        } else {
                            saveLandmark(); //nm, just save everything else
                        }

                        //remove tags 
                        function removeTags() {
                            var count = 0;
                            for (var i = 0; i < req.body.landmarkTagsRemoved.length; i++) {
                                console.log(count);

                                var position = lm.tags.indexOf(req.body.landmarkTagsRemoved[i]); //find string position
                                if (~position) { //if exists remove it
                                    lm.tags.splice(position, 1);
                                }
                                if (count == req.body.landmarkTagsRemoved.length - 1) { //stop on final loop
                                    saveLandmark();
                                }
                                count++;

                            }
                        }

                        //---------- END HANDLING -----------//

                        function saveLandmark() {

                            lm.save(function(err, landmark) {
                                if (err) {
                                    console.log(err);
                                    console.log('lm.save error');
                                } else {
                                    console.log(landmark);
                                    console.log('success');
                                    res.status(200).send([landmark]);

                                    //update serverwidget object for world
                                    if (req.body.world_id && req.body.hashtag) {
                                        manageServerWidgets(req.body.world_id, req.body.hashtag, lm.widgets); //add/remove server tags
                                    }
                                }
                            });
                        }

                    } else {
                        console.log('unauthorized user');
                    }
                });

            }

            //not an edit
            else {

                //new world
                if (worldVal) {
                    saveStyle(req.body.name, function(styleRes) { //creating new style to add to landmark
                        saveNewLandmark(styleRes);
                    });
                }

                //new landmark
                else {

                    //checking for auth of parent ID (world) to add new landmarks...bad security if attacker changes world val?? idk!

                    landmarkSchema.findById(req.body.parentID, function(err, lm) {
                        if (!lm) {
                            console.log(err);
                        } else if (req.user._id == lm.permissions.ownerID) { //checking if logged in user is owner
                            saveNewLandmark();
                        } else {
                            console.log('unauthorized user');
                        }
                    });
                }

                function saveNewLandmark(styleRes) {
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
                        resources: {}
                    });

                    if (req.body.loc) {
                        lm.loc = {
                            type: 'Point',
                            coordinates: [req.body.loc.coordinates[0],
                                req.body.loc.coordinates[1]
                            ]
                        }
                        lm.hasLoc = true;
                    } else {
                        //fake location
                        lm.loc = {
                            type: 'Point',
                            coordinates: [-74.0059, 40.7127]
                        }
                        lm.hasLoc = false;
                    }

                    if (styleRes !== undefined) { //if new styleID created for world
                        lm.style.styleID = styleRes;
                    }

                    if (req.body.parentID) {
                        lm.parentID = req.body.parentID;
                    }

                    if (req.body.description) {
                        lm.description = req.body.description;
                    }
                    if (req.body.summary) {
                        lm.summary = req.body.summary;
                    }
                    if (req.body.category) {
                        lm.category = req.body.category;
                    }

                    if (req.body.landmarkCategories) {
                        lm.landmarkCategories = req.body.landmarkCategories;
                    }

                    if (req.body.resources) {
                        if (req.body.resources.hashtag) {
                            lm.resources.hashtag = req.body.resources.hashtag;
                        }
                    }

                    if (!req.body.avatar) {
                        lm.avatar = "img/tidepools/default.jpg";
                    }

                    //if user checks box to activate time 
                    if (req.body.hasTime == true) {
                        lm.time.start = req.body.time.start || null;
                        lm.time.end = req.body.time.end || null;
                        lm.hasTime = true;
                    }

                    //ADDING / UPDATING CLOUD MAP INFO
                    if (req.body.style) {
                        if (req.body.style.styleID) {
                            lm.style.styleID = req.body.style.styleID;
                        }
                        if (req.body.style.maps) {
                            if (req.body.style.maps.type) {
                                lm.style.maps.type = req.body.style.maps.type;
                            }
                            if (req.body.style.maps.cloudMapID) {
                                lm.style.maps.cloudMapID = req.body.style.maps.cloudMapID;
                            }
                            if (req.body.style.maps.cloudMapName) {
                                lm.style.maps.cloudMapName = req.body.style.maps.cloudMapName;
                            }
                        }
                    }


                    //adding map location info
                    if (req.body.hasOwnProperty('loc_info')) {

                        if (req.body.loc_info.hasOwnProperty('floor_num')) {
                            lm.loc_info.floor_num = req.body.loc_info.floor_num || null;
                        }

                        if (req.body.loc_info.hasOwnProperty('room_name')) {
                            lm.loc_info.room_name = req.body.loc_info.room_name || null;
                        }
                    }

                    //---------- TAG HANDLING -----------//

                    if (req.body.tags && lm.tags) { //init check of objs
                        if (req.body.tags.length > 0) { //actually content
                            var count = 0;
                            for (var i = 0; i < req.body.tags.length; i++) { //loop content

                                var newTag = req.body.tags[i].replace(/[^\w\s]/gi, ''); //removing all but alphanumeric and spaces

                                newTag = newTag.toLowerCase();

                                if (lm.tags.indexOf(newTag) > -1) { //check if tag already in saved arr
                                    //exists dont add tag again
                                } else {
                                    lm.tags.push(newTag); //else add to array
                                }
                                if (count == req.body.tags.length - 1) { //stop on final loop     
                                    checktoRemove(); //on loop end check to remove anything
                                }
                                count++;
                            }
                        } else {
                            checktoRemove(); //no new tags, check for removes
                        }

                        //check if we should really remove tags or go to save
                        function checktoRemove() {
                            if (req.body.landmarkTagsRemoved) {
                                if (req.body.landmarkTagsRemoved.length > 0) { //actually contents
                                    removeTags();
                                } else {
                                    saveLandmark();
                                }
                            } else {
                                saveLandmark();
                            }
                        }
                    } else if (req.body.landmarkTagsRemoved && lm.tags) { //no tags to add but remove tags plz
                        if (req.body.landmarkTagsRemoved.length > 0) { //actually contents
                            removeTags();
                        } else {
                            saveLandmark();
                        }
                    } else {
                        saveLandmark(); //nm, just save everything else
                    }

                    //remove tags 
                    function removeTags() {
                        var count = 0;
                        for (var i = 0; i < req.body.landmarkTagsRemoved.length; i++) {
                            console.log(count);

                            var position = lm.tags.indexOf(req.body.landmarkTagsRemoved[i]); //find string position
                            if (~position) { //if exists remove it
                                lm.tags.splice(position, 1);
                            }
                            if (count == req.body.landmarkTagsRemoved.length - 1) { //stop on final loop
                                saveLandmark();
                            }
                            count++;

                        }
                    }

                    //---------- END HANDLING -----------//

                    function saveLandmark() {
                        lm.save(function(err, landmark) {
                            if (err)
                                console.log(err);
                            else {
                                console.log(landmark);
                                //world created
                                if (worldVal == true) {
                                    saveProject(landmark._id, styleRes, req.user._id, function(projectRes) {

                                        var idArray = [{
                                            'worldID': landmark._id,
                                            'projectID': projectRes,
                                            'styleID': styleRes,
                                            'worldURL': landmark.id
                                        }];
                                        res.status(200).send(idArray);
                                    });
                                }

                                //landmark created
                                else {
                                    res.status(200).send([{
                                        "_id": landmark._id
                                    }]);
                                }
                            }
                        });
                    }


                }
            }
        }

        function saveStyle(inputName, callback) {
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
                    streetview: false,
                    nearby: true
                }
            });

            saveIt(function(res) {
                callback(res);
            });

            function saveIt(callback) {
                st.save(function(err, style) {
                    if (err)
                        console.log(err);
                    else {
                        callback(style._id);
                    }
                });
            }
        }

        function saveProject(world, style, owner, callback) {
            var pr = new projectSchema({
                worldID: world,
                styleID: style,
                permissions: {
                    ownerID: owner
                }
            });

            saveIt(function(res) {
                callback(res);
            });

            function saveIt(callback) {
                pr.save(function(err, project) {
                    if (err)
                        console.log(err);
                    else {
                        callback(project._id);
                    }
                });
            }
        }

    }

    function editProject(input) {
        projectSchema.findById(req.body.projectID, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else if (req.user._id == lm.permissions.ownerID) {

                lm.save(function(err, style) {
                    if (err) {
                        console.log('error');
                    } else {
                        //console.log(style);
                        console.log('success');
                    }
                });
            }
        });
    }

    function editStyle(input) {

        styleSchema.findById(req.body._id, function(err, lm) {
            if (!lm) {
                console.log(err);
            } else {

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
                    lm.widgets.nearby = req.body.widgets.nearby;
                }

                lm.save(function(err, style) {
                    if (err) {
                        console.log('error');
                    } else {
                        //console.log(style);
                        console.log('success');

                        if (res) {
                            res.status(200).send([style]);
                        }

                        //if parameters from world passed to style, then add to serverwidget object
                        if (req.body.world_id && req.body.hashtag) {
                            manageServerWidgets(req.body.world_id, req.body.hashtag, lm.widgets); //add/remove server tags
                        }
                    }
                });
            }
        });

    }

});


// Delete
app.delete('/api/:collection/:id', function(req, res) {
    db.collection(req.params.collection).remove({
        _id: objectId(req.params.id)
    }, {
        safe: true
    }, fn(req, res));
});

//Group
app.put('/api/:collection/group', function(req, res) {
    db.collection(req.params.collection).group(req.body, fn(req, res));
})

// MapReduce
app.put('/api/:collection/mapReduce', function(req, res) {
    if (!req.body.options) {
        req.body.options = {}
    };
    req.body.options.out = {
        inline: 1
    };
    req.body.options.verbose = false;
    db.collection(req.params.collection).mapReduce(req.body.map, req.body.reduce, req.body.options, fn(req, res));
})

// Command (count, distinct, find, aggregate)
app.put('/api/:collection/:cmd', function(req, res) {
    if (req.params.cmd === 'distinct') {
        req.body = req.body.key
    }
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
app.all('/*', function(req, res, next) {

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    //if file path, then add file to end
    if (req.url.indexOf('.') != -1) {
        res.sendFile(req.url, {
            root: __dirname + '/app/dist'
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.url);
            }
        });
    } else if (req.url.indexOf('api') > -1) {
        return next();
    } else {
        res.sendFile('index.html', {
            root: __dirname + '/app/dist'
        });
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

// function generate_xml_sitemap(){
//     var root_path = 'http://www.bubbl.li/';
//     var priority = 0.5;
//     var freq = 'monthly';

//   landmarkSchema.find({}, {'id':1}, function (err, docs) {
//     if (err) {
//       console.log("Error Occured: ", err);
//     } else { 

//       var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
//       for (var i in docs) {
//         xml += '<url>';
//         xml += '<loc>'+ root_path + '/w/' + docs[i].id + '</loc>';
//         xml += '<changefreq>'+ freq +'</changefreq>';
//         xml += '<priority>'+ priority +'</priority>';
//         xml += '</url>';
//         i++;
//       }
//       xml += '</urlset>';
//       console.log(xml);
//       return xml;
//     }
//     });
// }

// app.get('/sitemap.xml', function(req, res) {
//     res.header('Content-Type', 'text/xml');
//     res.send(generate_xml_sitemap());     
// })

server.listen(2997, function() {
    console.log("Illya casting magic on 2997 ~ ~ ♡");
});
