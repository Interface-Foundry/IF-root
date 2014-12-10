// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var MeetupStrategy = require('passport-meetup').Strategy;

// load up the user model
var User       = require('../IF_schemas/user_schema.js');



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
        done(null, user.id);
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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        //validate email as real address
        if (validateEmail(email)){
            if (password.length >= 6){
                //ADD PASSWORD VALIDATE HERE
                // asynchronous
                //process.nextTick(function() {
                    User.findOne({ 'local.email' :  email }, function(err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // if no user is found, return the message
                        if (!user)
                            // return;
                            return done('Incorrect username or password');

                        if (!user.validPassword(password))
                            return done('Incorrect username or password');

                        // all is well, return user
                        else
                            return done(null, user);
                    });
               // });
            }
            else {
                return done('Password needs to be at least 6 characters');  
            }
        }
        else {
            return done('Please use a real email address');
        }


    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        //validate email as real address
        if (validateEmail(email)){
            if (password.length >= 6){
                // asynchronous
                process.nextTick(function() {

                    //  Whether we're signing up or connecting an account, we'll need
                    //  to know if the email address is in use.
                    User.findOne({'local.email': email}, function(err, existingUser) {

                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if there's already a user with that email
                        if (existingUser) 
                            return done('This email address is already in use');

                        //  If we're logged in, we're connecting a new local account.
                        if(req.user) {
                            var user            = req.user;
                            user.local.email    = email;
                            user.local.password = user.generateHash(password);
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                                //ADDED TO YOUR ACCOUNT
                            });
                        } 
                        //  We're not logged in, so we're creating a brand new user.
                        else {
                            // create the user
                            var newUser            = new User();

                            newUser.local.email    = email;
                            newUser.local.password = newUser.generateHash(password);

                            newUser.save(function(err) {
                                if (err)
                                    throw err;

                                return done(null, newUser);
                                //NEW USER CREATED
                            });
                        }
                    });
                });
            }
            else {
                return done('Password needs to be at least 6 characters');  
            }
        }
        else {
            return done('Please use a real email address');
        }


    }));

    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
                                user.facebook.email = profile.emails[0].value;
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
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.displayName;
                        if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
                            newUser.facebook.email = profile.emails[0].value; 
                        }
                        

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.displayName;
                if (profile.emails[0].value !== undefined || profile.emails[0].value !== null){
                    user.facebook.email = profile.emails[0].value;
                }

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
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
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
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
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
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

        consumerKey     : configAuth.meetupAuth.consumerKey,
        consumerSecret  : configAuth.meetupAuth.consumerSecret,
        callbackURL     : configAuth.meetupAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


      },
      function(req, token, tokenSecret, profile, done) {

        // User.findOrCreate({ meetupId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'meetup.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.meetup.token) {
                            user.meetup.token       = token;
                            user.meetup.displayName = profile.displayName;
                            //user.meetup.raw         = profile._raw;

                            user.save(function(err) {
                                if (err){
                                    throw err;
                                }
                                return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.meetup.id          = profile.id;
                        newUser.meetup.token       = token;
                        newUser.meetup.displayName = profile.displayName;
                        //newUser.meetup.raw         = profile._raw;

                        newUser.save(function(err) {
                            if (err){
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.meetup.id          = profile.id;
                user.meetup.token       = token;
                user.meetup.displayName = profile.displayName;
                //user.meetup.raw         = profile._raw;

                user.save(function(err) {
                    if (err){
                        throw err;
                    }
                    return done(null, user);
                });
            }

        });


    }));



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



//     function uniqueProfileID(input, callback){

//         var uniqueIDer = urlify(input);
//         urlify(uniqueIDer, function(){
//             User.findOne({ 'profileID' : uniqueIDer }, function(err, data){
//                 if (data){
//                     var uniqueNumber = 1;
//                     var newUnique;

//                     async.forever(function (next) {
//                       var uniqueNum_string = uniqueNumber.toString(); 
//                       newUnique = data.profileID + uniqueNum_string;

//                       User.findOne({ 'profileID' : uniqueIDer }, function(err, data){

//                         if (data){
//                           uniqueNumber++;
//                           next();
//                         }
//                         else {
//                           next('unique!'); // This is where the looping is stopped
//                         }
//                       });
//                     },
//                     function () {
//                       callback(newUnique);
//                     });
//                 }
//                 else {
//                     callback(uniqueIDer);
//                 }
//             });
//         });
//     }

// };
