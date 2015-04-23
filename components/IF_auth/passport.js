// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var MeetupStrategy = require('passport-meetup').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var CustomFBStrategy = require('./custom_fb_strategy/custom_strategy').Strategy;
// load up the user model
var User = require('../IF_schemas/user_schema.js');
var Users = User; // yay.

// required for modifying userids across the platform
var Landmarks = require('../IF_schemas/landmark_schema.js');
var ContestEntries = require('../IF_schemas/contestEntry_schema.js');
var Stickers = require('../IF_schemas/sticker_schema.js');
var Worldchats = require('../IF_schemas/worldchat_schema.js');
var Projects = require('../IF_schemas/project_schema.js');
var Visits = require('../IF_schemas/visit_schema.js');
var https = require('https');
var urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "_",
    nonPrintable: "_",
    trim: true
});

var lodash = require('lodash');
var q = require('q');
var async = require('async');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {


    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {

            //validate email as real address
            if (validateEmail(email)) {
                if (password.length >= 6) {

                    //process.nextTick(function() {
                    User.findOne({
                        'local.email': email.toString().toLowerCase()
                    }, function(err, user) {
                        // if there are any errors, return the error
                        if (err) {
                            return done(err);
                        }

                        if (!user) {
                            return done('Incorrect username or password');
                        }

                        if (!user.validPassword(password)) {
                            return done('Incorrect username or password');
                        } else {
                            return done(null, user);
                        }

                    });
                    //});
                } else {
                    return done('Password needs to be at least 6 characters');
                }
            } else {
                return done('Please use a real email address');
            }


        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {

            //validate email as real address
            if (validateEmail(email)) {
                if (password.length >= 6) {
                    // asynchronous
                    process.nextTick(function() {
                       
                        //  Whether we're signing up or connecting an account, we'll need
                        //  to know if the email address is in use.
                        User.findOne({
                            'local.email': email.toString().toLowerCase()
                        }, function(err, existingUser) {

                            // if there are any errors, return the error
                            if (err){
                                console.log('hitting error in here',err)
                                return done(err);
                            }
                            // check to see if there's already a user with that email
                            if (existingUser) {
                                console.log('This email address is already in use')
                                return done('Email already exists.\ Do you want to sign in?');
                            }
                            //  If we're logged in via facebook, we're connecting a new local account.
                            if (req.user) {
                                var user = req.user;
                                user.local.email = email.toString().toLowerCase();
                                user.local.password = user.generateHash(password);
  console.log('Logged in via facebook, req.user is', req.user)
                                if (!user.profileID) {

                                    if (user.facebook.name && user.facebook.name.indexOf(" ") > -1) {
                                        user.name = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                        var input = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                    } else if (user.facebook.name) {
                                        var input = user.facebook.name
                                    } else if (!user.facebook.name) {
                                        console.log('logged in facebook user doesnt have name property. using email to generate profileID instead.', user)
                                        var input = user.local.email.slice(0, email.indexOf("@"))
                                    }

                                    uniqueProfileID(input, function(output) {
                                        user.profileID = output;
                                        user.save(function(err) {
                                            if (err)
                                                throw err;
                                            return done(null, newUser);
                                            //NEW USER CREATED
                                        });
                                    });
                                } else {
                                    user.save(function(err) {
                                        if (err)
                                            throw err;
                                        return done(null, user);
                                        //ADDED TO YOUR ACCOUNT
                                    });
                                }
                            }
                            //  We're not logged in, so we're creating a brand new user.
                            else {
                                console.log('Not logged in, creating a brand new user.')
                                // create the user
                                var newUser = new User();
                                newUser.name = email.slice(0, email.indexOf("@"));
                                newUser.local.email = email.toString().toLowerCase();
                                newUser.local.password = newUser.generateHash(password);
                                uniqueProfileID(email.slice(0, email.indexOf("@")), function(output) {
                                    newUser.profileID = output;
                                    newUser.save(function(err) {
                                        if (err)
                                            throw err;

                                        return done(null, newUser);
                                        //NEW USER CREATED
                                    });
                                });

                            }
                        });
                    });
                } else {
                    return done('Password needs to be at least 6 characters');
                }
            } else {
                return done('Please use a real email address');
            }


        }));

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    passport.use('local-basic', new BasicStrategy({},
        function(email, password, done) {
            User.findOne({
                'local.email': email.toString().toLowerCase()
            }, function(err, user) {
                if (user && user.validPassword(password)) {
                    return done(null, user);
                } else if (err) {
                    return done(err);
                } else {
                    return done(null, false);
                }
            });
        }
    ));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
	function findExistingFacebookUser(profile, callback) {
		debugger;
		// need to look for users that match this app-specific id
		// or users that match the profile email (legacy fb users from Bubbl.li)
		Users.find({$or: [
			{'facebook.id': profile.id},
			{'facebook.email': profile.email}
		]}).exec(function(err, users) {
			if (err) { return callback(err); }
			if (!users) { return callback(); }

			// When there is only one user in the db, that user might be an old
			// Bubbl.li user or just a kip user.  
			if (users.length === 1) {
				var u = users[0];

				// old bubbl.li user, update profile id
				if (u.facebook.id !== profile.id) {
					u.facebook.id = profile.id;
					u.save(function(err, u) {
						if (err) { return callback(err); }
						callback(null, u);
					});
				} else {
					callback(null, u);
				}

				return;
			}

			// When there are multiple users in the db, that means there are both Bubbl.li
			// and kip users in the db.  we need to merge them.
			mergeFacebookUsers(users, profile, callback);
		});
	}

	/**
	 * Merge Bubbl.li users into a kip user...
	 * effffff
	 */
	function mergeFacebookUsers(users, profile, callback) {
		debugger;
		if (!users || !users.length) { callback() }
		if (users.length == 1) { callback(null, users[0]) }

		console.log('LONG LOST USERS REUNITED AT LAST');
		console.log(users.map(function(u) { return u._id.toString()}).join(', '));

		// promote the first user to the kip user
		var kipUser = users[0];
		var oldUsers = users.slice(1);

		// And force the facebook stuff to be correct
		kipUser.facebook.id = profile.id;
		kipUser.facebook.email = profile.email;
		kipUser.facebook.name = profile.name;
		kipUser.facebook.token = profile.token;
		kipUser.facebook.verified = !!profile.verified;
		kipUser.facebook.locale = profile.locale;
		kipUser.facebook.timezone = profile.timezone;
		kipUser.facebook.bio = profile.bio;

		var promises = [];

		// Migrate all the other bubbles to this new id.  shit.  this gonna suck.
		var newId = kipUser._id.toString();
		var oldIds = oldUsers.map(function(u) { return u._id.toString(); });
		var inOldIds = {$in: oldIds};

		// landmarks
		promises.push(Landmarks.update({'permissions.ownerID': inOldIds}, {$set: {'permissions.ownerID': newId}}, {multi: true}));
		// i checked and there were no landmarks with viewers or admins in the db :D HJFBSDFGHL:

		// worldchats
		promises.push(Worldchats.update({'userID': inOldIds}, {$set: {'userID': newId}}, {multi: true}));

		// contest entry
		promises.push(ContestEntries.update({'userID': inOldIds}, {$set: {'userID': newId}}, {multi: true}));

		// projects
		promises.push(Projects.update({'ownerID': inOldIds}, {$set: {'ownerID': newId}}, {multi: true}));
		// i checked and there are no projects with viewers or editors in the db :D THANK GAWDS
		
		// shtickersh
		promises.push(Stickers.update({'ownerID': inOldIds}, {$set: {'ownerID': newId}}, {multi: true}));

		// visits
		promises.push(Visits.update({'userID': inOldIds}, {$set: {'userID': newId}}, {multi: true}));

		// users fffffff
		// merge might work..... we'll see.
		console.dir(kipUser);
		console.dir(oldUsers);
		oldUsers.map(function(u) {
			u = u.toObject();
			delete u._id;
			lodash.merge(kipUser, u);
		});
		console.log('merge finished');
		console.dir(kipUser);
		
		// yay
		q.all(promises).then(function() {
			console.log("all promises succeeded");
			callback(null, kipUser);

			// BURN THE OLD USERS. BURN THEM TO THE GROUND.
			oldUsers.map(function(u) {
				u.remove();
			});
		}, function(err) {
			console.log("failed a promise");
			console.error(err);
			callback(err);
		});

	}

    passport.use(new FacebookStrategy({

            clientID: global.config.facebookAuth.clientID,
            clientSecret: global.config.facebookAuth.clientSecret,
            callbackURL: global.config.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {
			if (profile._json) {
				profile = profile._json; // this is the actual data that we want
			}

            // asynchronous
            process.nextTick(function() {

				// look for an existing facebook user for this profile in the db.
				findExistingFacebookUser(profile, function(err, user) {
					if (err) {
						return done(err);
					}

					// check if the user is already logged in
					if (!req.user) {
                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name;

                                if (profile.email) {
                                    user.facebook.email = profile.email;
                                }

                                if (profile.verified) {
                                    user.facebook.verified = profile.verified;
                                }

                                if (profile.locale) {
                                    user.facebook.locale = profile.locale;
                                }

                                if (profile.timezone) {
                                    user.facebook.timezone = profile.timezone;
                                }

                                //Added, not sure if needed
                                if (profile.id) {
                                    user.facebook.id = profile.id;
                                }

                                if (!user.name) {
                                    if (user.facebook.name.indexOf(" ") > -1) {
                                        user.name = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                    } else {
                                        user.name = user.facebook.name
                                    }
                                }

                                if (user.facebook.name.indexOf(" ") > -1) {
                                    var input = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                } else {
                                    var input = user.facebook.name
                                }


                                uniqueProfileID(input, function(output) {
                                    user.profileID = output;
                                    user.save(function(err) {
                                        if (err)
                                            throw err;
                                        return done(null, user);
                                        //NEW USER CREATED
                                    });
                                });

                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.displayName;

                            if (profile.email) {
                                newUser.facebook.email = profile.email;
                            }

                            if (profile.verified) {
                                newUser.facebook.verified = profile.verified;
                            }

                            if (profile.locale) {
                                newUser.facebook.locale = profile.locale;
                            }

                            if (profile.timezone) {
                                newUser.facebook.timezone = profile.timezone;
                            }

                            if (newUser.facebook.name.indexOf(" ") > -1) {
                                newUser.name = newUser.facebook.name.slice(0, newUser.facebook.name.indexOf(" "));
                                var input = newUser.facebook.name.slice(0, newUser.facebook.name.indexOf(" "));
                            } else {
                                newUser.name = newUser.facebook.name;
                                var input = newUser.facebook.name
                            }

                            uniqueProfileID(input, function(output) {
                                newUser.profileID = output;
                                newUser.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                    //NEW USER CREATED
                                });
                            });


						}
					} else {
						// user already exists and is logged in, we have to link accounts
						var user = req.user; // pull the user out of the session
						user.facebook.id = profile.id;
						user.facebook.token = token;
						user.facebook.name = profile.displayName;
						if (profile.email) {
							user.facebook.email = profile.email;
						}
						if (profile.verified) {
							user.facebook.verified = profile.verified;
						}
						if (profile.locale) {
							user.facebook.locale = profile.locale;
						}
						if (profile.timezone) {
							user.facebook.timezone = profile.timezone;
						}

						if (!user.profileID) {
							if (user.facebook.name.indexOf(" ") > -1) {
								var input = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
							} else {
								var input = user.facebook.name
							}
							uniqueProfileID(input, function(output) {
								user.profileID = output;
								user.save(function(err) {
									if (err)
										throw err;
									return done(null, user);
									//NEW USER CREATED
								});
							});
						} else {
							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
								//ADDED TO YOUR ACCOUNT
							});
						}
					}
				});
            });

        }));

    // =========================================================================
    // FACEBOOK for Mobile =====================================================
    // =========================================================================
    // Use local strategy
    passport.use(new CustomFBStrategy({
            userId: 'userId',
            accessToken: 'accessToken'
        },
        function(userId, accessToken, response, done) {
            console.log('in the authentication function');
            if (response.error){
                return done(null, false, {
                    message: response.error.message
                });
            }


            console.log(userId);

            //parse response
            var profile = JSON.parse(response);
            
            console.log(profile.id);

            if (userId !== profile.id){
                return done(null, false, {
                    message: 'Incorrect Access Token'
                });
            }

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                console.log(response);
                if (user) {

                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.facebook.token) {
                        user.facebook.token = accessToken;
                        user.facebook.name  = profile.name;
                        
                        if (profile.email){
                            user.facebook.email = profile.email;
                        }

                        if (profile.verified){
                            user.facebook.verified = profile.verified;
                        }

                        if (profile.locale){
                            user.facebook.locale = profile.locale;
                        }

                        if (profile.timezone){
                            user.facebook.timezone = profile.timezone;
                        }

                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }

                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser            = new User();

                    newUser.facebook.id    = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.name  = profile.name;
                    if (profile.email){
                        newUser.facebook.email = profile.email; 
                    }
                    

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        } 
    ));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({
                        'twitter.id': profile.id
                    }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.twitter.displayName = profile.displayName;

                                user.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;

                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }

            });

        }));

    // =========================================================================
    // MEETUP  =================================================================
    // =========================================================================

    passport.use(new MeetupStrategy({

            consumerKey: configAuth.meetupAuth.consumerKey,
            consumerSecret: configAuth.meetupAuth.consumerSecret,
            callbackURL: configAuth.meetupAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


        },
        function(req, token, tokenSecret, profile, done) {

            // User.findOrCreate({ meetupId: profile.id }, function (err, user) {
            //   return done(err, user);
            // });

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({
                        'meetup.id': profile.id
                    }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.meetup.token) {
                                user.meetup.token = token;
                                user.meetup.displayName = profile.displayName;
                                //user.meetup.raw         = profile._raw;

                                user.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.meetup.id = profile.id;
                            newUser.meetup.token = token;
                            newUser.meetup.displayName = profile.displayName;
                            //newUser.meetup.raw         = profile._raw;

                            newUser.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.meetup.id = profile.id;
                    user.meetup.token = token;
                    user.meetup.displayName = profile.displayName;
                    //user.meetup.raw         = profile._raw;

                    user.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, user);
                    });
                }

            });


        }));






    //setting up token based auth (for ios social auth)
    passport.use(
        new BearerStrategy(
            function(token, done) {

                console.log('HELLO');

                console.log(token);

                var options = {
                    host: 'graph.facebook.com',
                    port: 443,
                    path: '/me?access_token=' + token,
                    method: 'GET',
                    headers: {
                        accept: '*/*'
                    }
                };

                var req = https.request(options, function(res) {

                    var body = '';

                    res.on('data', function(d) {
                        body += d;
                    });

                    res.on('end', function() {

                        console.log(body);

                        try {
                            var parsed = JSON.parse(body);
                        } catch (e) {
                            console.error('could not parse bearer facebook json');
                            console.error('server: ' + options.host + options.path);
                            console.error(body);
                        }

                        console.log('fbook parsed', parsed);


                        User.findOne({
                                'facebook.id': parsed.id
                            },
                            function(err, user) {

                                if (err)
                                    return done(err);

                                if (user) {

                                    // if there is a user id already but no token (user was linked at one point and then removed)
                                    if (!user.facebook.token) {
                                        user.facebook.token = token;
                                        user.facebook.name = parsed.name;
                                        // if (parsed.emails[0].value !== undefined || parsed.emails[0].value !== null){
                                        //     user.facebook.email = profile.emails[0].value;
                                        // }

                                        if (!user.name) {
                                            if (user.facebook.name.indexOf(" ") > -1) {
                                                user.name = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                            } else {
                                                user.name = user.facebook.name
                                            }
                                        }

                                        if (!user.profileID) {

                                            if (user.facebook.name.indexOf(" ") > -1) {
                                                var input = user.facebook.name.slice(0, user.facebook.name.indexOf(" "))
                                            } else {
                                                var input = user.facebook.name
                                            }
                                            uniqueProfileID(input, function(output) {
                                                user.profileID = output;
                                                user.save(function(err) {
                                                    if (err)
                                                        throw err;
                                                    return done(null, user);
                                                    //NEW USER CREATED
                                                });
                                            });
                                        } else {
                                            user.save(function(err) {
                                                if (err)
                                                    throw err;
                                                return done(null, user);
                                                //ADDED TO YOUR ACCOUNT
                                            });
                                        }

                                    }

                                    return done(null, user); // user found, return that user
                                } else {
                                    // if there is no user, create them
                                    var newUser = new User();

                                    newUser.facebook.id = parsed.id;
                                    newUser.facebook.token = token;
                                    newUser.facebook.name = parsed.name;
                                    // if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
                                    //     newUser.facebook.email = parsed.emails[0].value; 
                                    // }

                                    if (newUser.facebook.name.indexOf(" ") > -1) {
                                        newUser.name = newUser.facebook.name.slice(0, newUser.facebook.name.indexOf(" "));
                                        var input = newUser.facebook.name.slice(0, newUser.facebook.name.indexOf(" "))
                                    } else {
                                        newUser.name = newUser.facebook.name;
                                        var input = newUser.facebook.name
                                    }

                                    uniqueProfileID(input, function(output) {
                                        newUser.profileID = output;
                                        newUser.save(function(err) {
                                            if (err)
                                                throw err;

                                            return done(null, newUser);
                                            //NEW USER CREATED
                                        });
                                    });

                                }

                                // if(!user) {
                                //     return done(null, false);
                                // }

                                //return done(null, user);
                            }
                        );

                    });

                });
                req.end();

                req.on('error', function(e) {
                    console.error(e);
                });

            }
        )
    );





};




// // load all the things we need
// var LocalStrategy    = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy  = require('passport-twitter').Strategy;
// var MeetupStrategy = require('passport-meetup').Strategy;

// // load up the user model
// var User       = require('../IF_schemas/user_schema.js');

// var async = require('async');

// var urlify = require('urlify').create({
//   addEToUmlauts:true,
//   szToSs:true,
//   spaces:"_",
//   nonPrintable:"_",
//   trim:true
// });

// // load the auth variables
// var configAuth = require('./auth'); // use this one for testing

// module.exports = function(passport) {


//     // =========================================================================
//     // passport session setup ==================================================
//     // =========================================================================
//     // required for persistent login sessions
//     // passport needs ability to serialize and unserialize users out of session

//     // used to serialize the user for the session
//     passport.serializeUser(function(user, done) {
//         done(null, user.id);
//     });

//     // used to deserialize the user
//     passport.deserializeUser(function(id, done) {
//         User.findById(id, function(err, user) {
//             done(err, user);
//         });
//     });

//     // =========================================================================
//     // LOCAL LOGIN =============================================================
//     // =========================================================================
//     passport.use('local-login', new LocalStrategy({
//         // by default, local strategy uses username and password, we will override with email
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//     },
//     function(req, email, password, done) {

//         //validate email as real address
//         if (validateEmail(email)){
//             if (password.length >= 6){
//                 //ADD PASSWORD VALIDATE HERE
//                 // asynchronous
//                 process.nextTick(function() {
//                     User.findOne({ 'local.email' :  email }, function(err, user) {
//                         // if there are any errors, return the error
//                         if (err)
//                             return done(err);

//                         // if no user is found, return the message
//                         if (!user)
//                             // return;
//                             return done('Incorrect username or password');

//                         if (!user.validPassword(password))
//                             return done('Incorrect username or password');

//                         // all is well, return user
//                         else
//                             return done(null, user);
//                     });
//                 });
//             }
//             else {
//                 return done('Password needs to be at least 6 characters');  
//             }
//         }
//         else {
//             return done('Please use a real email address');
//         }


//     }));

//     // =========================================================================
//     // LOCAL SIGNUP ============================================================
//     // =========================================================================
//     passport.use('local-signup', new LocalStrategy({
//         // by default, local strategy uses username and password, we will override with email
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//     },
//     function(req, email, password, done) {

//         //validate email as real address
//         if (validateEmail(email)){
//             if (password.length >= 6){
//                 // asynchronous
//                 process.nextTick(function() {

//                     //  Whether we're signing up or connecting an account, we'll need
//                     //  to know if the email address is in use.
//                     User.findOne({'local.email': email}, function(err, existingUser) {

//                         // if there are any errors, return the error
//                         if (err)
//                             return done(err);

//                         // check to see if there's already a user with that email
//                         if (existingUser) 
//                             return done('This email address is already in use');

//                         //  If we're logged in, we're connecting a new local account.
//                         if(req.user) {

//                             //strip name from email//
//                             var s = email;
//                             var n = s.indexOf('@');
//                             s = s.substring(0, n != -1 ? n : s.length);
//                             //====================//

//                             //gen new unique profileID and save
//                             uniqueProfileID(s, function(output){

//                                 var user            = req.user;

//                                 //avoid writing over pre-exisiting profileID thx
//                                 if (!req.user.profileID || req.user.profileID == 'undefined'){
//                                     user.profileID = output;
//                                 }

//                                 user.local.email    = email;
//                                 user.local.password = user.generateHash(password);

//                                 user.save(function(err) {
//                                     if (err)
//                                         throw err;
//                                     return done(null, user);
//                                     //ADDED TO YOUR ACCOUNT
//                                 });

//                             });

//                         } 
//                         //  We're not logged in, so we're creating a brand new user.
//                         else {

//                             //strip name from email//
//                             var s = email;
//                             var n = s.indexOf('@');
//                             s = s.substring(0, n != -1 ? n : s.length);
//                             //====================//

//                             //gen new unique profileID and save
//                             uniqueProfileID(s, function(output){

//                                 // create the user
//                                 var newUser            = new User();

//                                 newUser.profileID = output;
//                                 newUser.local.email    = email;
//                                 newUser.local.password = newUser.generateHash(password);

//                                 newUser.save(function(err) {
//                                     if (err)
//                                         throw err;

//                                     return done(null, newUser);
//                                     //NEW USER CREATED
//                                 });

//                             });



//                         }
//                     });
//                 });
//             }
//             else {
//                 return done('Password needs to be at least 6 characters');  
//             }
//         }
//         else {
//             return done('Please use a real email address');
//         }


//     }));

//     function validateEmail(email) { 
//         var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//         return re.test(email);
//     } 


//     // =========================================================================
//     // FACEBOOK ================================================================
//     // =========================================================================
//     passport.use(new FacebookStrategy({

//         clientID        : configAuth.facebookAuth.clientID,
//         clientSecret    : configAuth.facebookAuth.clientSecret,
//         callbackURL     : configAuth.facebookAuth.callbackURL,
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

//     },
//     function(req, token, refreshToken, profile, done) {

//         // asynchronous
//         process.nextTick(function() {

//             // check if the user is already logged in
//             if (!req.user) {

//                 User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
//                     if (err)
//                         return done(err);

//                     if (user) {

//                         // if there is a user id already but no token (user was linked at one point and then removed)
//                         if (!user.facebook.token) {
//                             user.facebook.token = token;
//                             user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
//                             if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
//                                 user.facebook.email = profile.emails[0].value;
//                             }

//                             //add name from facebook if not exist
//                             if (!req.user.name || req.user.name == 'undefined'){
//                                 user.name = profile.name.givenName + ' ' + profile.name.familyName;
//                             }

//                             //if no profileID, gen new ID then save
//                             if (!req.user.profileID || req.user.profileID == 'undefined'){

//                                 if (!profile.displayName || profile.displayName == 'undefined'){
//                                     profile.displayName = 'user'; //if displayName missing
//                                 }

//                                 //gen new unique profileID and save
//                                 uniqueProfileID(profile.displayName, function(output){

//                                     user.profileID = output;

//                                     user.save(function(err) {
//                                         if (err)
//                                             throw err;
//                                         return done(null, user);
//                                     });
//                                 });

//                             }
//                             //profileID already exists, save
//                             else {
//                                 user.save(function(err) {
//                                     if (err)
//                                         throw err;
//                                     return done(null, user);
//                                 });
//                             }

//                         }

//                         return done(null, user); // user found, return that user
//                     } else {
//                         // if there is no user, create them
//                         var newUser            = new User();

//                         newUser.facebook.id    = profile.id;
//                         newUser.facebook.token = token;
//                         newUser.facebook.name  = profile.displayName;
//                         if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
//                             newUser.facebook.email = profile.emails[0].value; 
//                         }

//                         if (!profile.displayName){
//                             profile.displayName = 'user';
//                         }

//                         //gen new unique profileID and save
//                         uniqueProfileID(profile.displayName, function(output){

//                             newUser.profileID = output;
//                             newUser.name = profile.name.givenName + ' ' + profile.name.familyName;

//                             newUser.save(function(err) {
//                                 if (err)
//                                     throw err;
//                                 return done(null, newUser);
//                             });
//                         });


//                     }
//                 });

//             } else {
//                 // user already exists and is logged in, we have to link accounts
//                 var user            = req.user; // pull the user out of the session

//                 user.facebook.id    = profile.id;
//                 user.facebook.token = token;
//                 user.facebook.name  = profile.displayName;
//                 if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
//                     user.facebook.email = profile.emails[0].value;
//                 }

//                 if (!profile.displayName){
//                     profile.displayName = 'user';
//                 }

//                 //gen new unique profileID and save
//                 uniqueProfileID(profile.displayName, function(output){

//                     //avoid writing over pre-exisiting profileID thx
//                     if (!req.user.profileID || req.user.profileID == 'undefined'){
//                         user.profileID = output;
//                     }

//                     //add name from facebook if not exist
//                     if (!req.user.name || req.user.name == 'undefined'){
//                         user.name = profile.name.givenName + ' ' + profile.name.familyName;
//                     }

//                     user.save(function(err) {
//                         if (err)
//                             throw err;
//                         return done(null, user);
//                     });
//                 });

//             }
//         });

//     }));

//     // =========================================================================
//     // TWITTER =================================================================
//     // =========================================================================
//     passport.use(new TwitterStrategy({

//         consumerKey     : configAuth.twitterAuth.consumerKey,
//         consumerSecret  : configAuth.twitterAuth.consumerSecret,
//         callbackURL     : configAuth.twitterAuth.callbackURL,
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

//     },
//     function(req, token, tokenSecret, profile, done) {

//         // asynchronous
//         process.nextTick(function() {

//             // check if the user is already logged in
//             if (!req.user) {

//                 User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
//                     if (err)
//                         return done(err);

//                     if (user) {
//                         // if there is a user id already but no token (user was linked at one point and then removed)
//                         if (!user.twitter.token) {
//                             user.twitter.token       = token;
//                             user.twitter.username    = profile.username;
//                             user.twitter.displayName = profile.displayName;

//                             if (!profile.displayName){
//                                 profile.displayName = 'user';
//                             }
//                             //gen new unique profileID and save
//                             uniqueProfileID(profile.displayName, function(output){

//                                 //avoid writing over pre-exisiting profileID thx
//                                 if (!req.user.profileID || req.user.profileID == 'undefined'){
//                                     user.profileID = output;
//                                 }

//                                 //add name from twitter if not exist
//                                 if (!req.user.name || req.user.name == 'undefined'){
//                                     user.name = profile.displayName;
//                                 }

//                                 user.save(function(err) {
//                                     if (err)
//                                         throw err;
//                                     return done(null, user);
//                                 });
//                             });

//                         }

//                         return done(null, user); // user found, return that user
//                     } else {
//                         // if there is no user, create them
//                         var newUser                 = new User();

//                         newUser.twitter.id          = profile.id;
//                         newUser.twitter.token       = token;
//                         newUser.twitter.username    = profile.username;
//                         newUser.twitter.displayName = profile.displayName;


//                         if (!profile.displayName){
//                             profile.displayName = 'user';
//                         }

//                         //gen new unique profileID and save
//                         uniqueProfileID(profile.displayName, function(output){

//                             newUser.profileID = output;
//                             newUser.name = profile.displayName;

//                             newUser.save(function(err) {
//                                 if (err)
//                                     throw err;
//                                 return done(null, newUser);
//                             });
//                         });
//                     }
//                 });

//             } else {
//                 // user already exists and is logged in, we have to link accounts
//                 var user                 = req.user; // pull the user out of the session

//                 user.twitter.id          = profile.id;
//                 user.twitter.token       = token;
//                 user.twitter.username    = profile.username;
//                 user.twitter.displayName = profile.displayName;

//                 if (!profile.displayName){
//                     profile.displayName = 'user';
//                 }

//                 //gen new unique profileID and save
//                 uniqueProfileID(profile.displayName, function(output){

//                     //avoid writing over pre-exisiting profileID thx
//                     if (!req.user.profileID || req.user.profileID == 'undefined'){
//                         user.profileID = output;
//                     }

//                     //add name from twitter if not exist
//                     if (!req.user.name || req.user.name == 'undefined'){
//                         user.name = user.displayName;
//                     }

//                     user.save(function(err) {
//                         if (err)
//                             throw err;
//                         return done(null, user);
//                     });
//                 });

//             }

//         });

//     }));

//    // =========================================================================
//    // MEETUP  =================================================================
//    // =========================================================================

//     passport.use(new MeetupStrategy({

//         consumerKey     : configAuth.meetupAuth.consumerKey,
//         consumerSecret  : configAuth.meetupAuth.consumerSecret,
//         callbackURL     : configAuth.meetupAuth.callbackURL,
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


//       },
//       function(req, token, tokenSecret, profile, done) {

//         // User.findOrCreate({ meetupId: profile.id }, function (err, user) {
//         //   return done(err, user);
//         // });

//         // asynchronous
//         process.nextTick(function() {

//             // check if the user is already logged in
//             if (!req.user) {

//                 User.findOne({ 'meetup.id' : profile.id }, function(err, user) {
//                     if (err)
//                         return done(err);

//                     if (user) {
//                         // if there is a user id already but no token (user was linked at one point and then removed)
//                         if (!user.meetup.token) {
//                             user.meetup.token       = token;
//                             user.meetup.displayName = profile.displayName;
//                             //user.meetup.raw         = profile._raw;

//                             if (!profile.displayName){
//                                 profile.displayName = 'user';
//                             }
//                             //gen new unique profileID and save
//                             uniqueProfileID(profile.displayName, function(output){

//                                 //avoid writing over pre-exisiting profileID thx
//                                 if (!req.user.profileID || req.user.profileID == 'undefined'){
//                                     user.profileID = output;
//                                 }

//                                 //add name from meetup if not exist
//                                 if (!req.user.name || req.user.name == 'undefined'){
//                                     user.name = profile.displayName;
//                                 }

//                                 user.save(function(err) {
//                                     if (err)
//                                         throw err;
//                                     return done(null, user);
//                                 });
//                             });

//                         }
//                         return done(null, user); // user found, return that user
//                     } else {
//                         // if there is no user, create them
//                         var newUser                 = new User();

//                         newUser.meetup.id          = profile.id;
//                         newUser.meetup.token       = token;
//                         newUser.meetup.displayName = profile.displayName;
//                         //newUser.meetup.raw         = profile._raw;

//                         if (!profile.displayName){
//                             profile.displayName = 'user';
//                         }

//                         //gen new unique profileID and save
//                         uniqueProfileID(profile.displayName, function(output){

//                             newUser.profileID = output;
//                             newUser.name = profile.displayName;

//                             newUser.save(function(err) {
//                                 if (err)
//                                     throw err;
//                                 return done(null, newUser);
//                             });
//                         });
//                     }
//                 });

//             } else {
//                 // user already exists and is logged in, we have to link accounts
//                 var user                 = req.user; // pull the user out of the session

//                 user.meetup.id          = profile.id;
//                 user.meetup.token       = token;
//                 user.meetup.displayName = profile.displayName;
//                 //user.meetup.raw         = profile._raw;

//                 if (!profile.displayName){
//                     profile.displayName = 'user';
//                 }

//                 //gen new unique profileID and save
//                 uniqueProfileID(profile.displayName, function(output){

//                     //avoid writing over pre-exisiting profileID thx
//                     if (!req.user.profileID || req.user.profileID == 'undefined'){
//                         user.profileID = output;
//                     }

//                     //add name from twitter if not exist
//                     if (!req.user.name || req.user.name == 'undefined'){
//                         user.name = user.displayName;
//                     }

//                     user.save(function(err) {
//                         if (err)
//                             throw err;
//                         return done(null, user);
//                     });
//                 });
//             }

//         });


//     }));



function uniqueProfileID(input, callback) {

    var uniqueIDer = urlify(input);
    urlify(uniqueIDer, function() {
        User.findOne({
            'profileID': uniqueIDer
        }, function(err, data) {
            if (data) {
                var uniqueNumber = 1;
                var newUnique;

                async.forever(function(next) {

                        var uniqueNum_string = uniqueNumber.toString();
                        newUnique = data.profileID + uniqueNum_string;

                        User.findOne({
                            'profileID': newUnique
                        }, function(err, data) {
                            if (data) {
                                uniqueNumber++;
                                console.log('user exists, new uniqueNumber is..', uniqueNumber)
                                next();
                            } else {
                                // console.log('is this hitting?')
                                next('unique!'); // This is where the looping is stopped
                            }
                        });
                    },
                    function() {
                        // console.log('hitting async forever end', newUnique)
                        callback(newUnique);
                    });

            } else {
                callback(uniqueIDer);
            }
        });
    });
}

// };
