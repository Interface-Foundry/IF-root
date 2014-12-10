module.exports = function(app, passport, landmarkSchema) {

// normal routes ===============================================================

	// // show the home page (will also have our login links)
	// app.get('/signup2', function(req, res) {
	// 	res.render('index.ejs');
	// });



	// LOGOUT ==============================
	app.get('/api/user/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});


	//app.get('/users', auth, user.list); // BY ADDING THE "auth" function, will return 401 if not auth

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form

		// route to test if the user is logged in or not 
		app.get('/api/user/loggedin', function(req, res) { 

			res.send(req.isAuthenticated() ? req.user : 500); 
		}); 

		// process the login form
		app.post('/api/user/login', passport.authenticate('local-login', {
			successRedirect: '/',
			failureRedirect: '/'}),
		function(req,res){
			
		});


		// app.post('/api/user/login', function(req, res, next) {
		//  passport.authenticate('local-login', function(err, user, info) {
		//    if (err) { return next(err); }
		//    else {
		//    	res.send(req.user);
		//    }
		   
		//  })(req, res, next);
		// });


		// process the signup form
		app.post('/api/user/signup', passport.authenticate('local-signup', {

		}), function(req,res){
			res.send(req.user);
		});

	// facebook -------------------------------

		app.get('/auth/facebook', function(req, res, next) {
		  req.session.redirect = req.query.redirect;
		  next();
		}, passport.authenticate('facebook', { scope : 'email' }));


		app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		  failureRedirect: '/login'
		}), function (req, res) {
		  res.redirect(req.session.redirect || '/profile');
		  delete req.session.redirect;
		});

	// twitter --------------------------------

		app.get('/auth/twitter', function(req, res, next) {
		  req.session.redirect = req.query.redirect;
		  next();
		}, passport.authenticate('twitter', { scope : 'email' }));


		app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		  failureRedirect: '/login'
		}), function (req, res) {
		  res.redirect(req.session.redirect || '/profile');
		  delete req.session.redirect;
		});


	// meetup --------------------------------

		// send to meetup to do the authentication
		//app.get('/auth/meetup', passport.authenticate('meetup', { scope : 'email' }));


		app.get('/auth/meetup', function(req, res, next) {
		  req.session.redirect = req.query.redirect;
		  next();
		}, passport.authenticate('meetup', { scope : 'email' }));


		app.get('/auth/meetup/callback', passport.authenticate('meetup', {
		  failureRedirect: '/login'
		}), function (req, res) {
		  res.redirect(req.session.redirect || '/profile/worlds/meetup');
		  delete req.session.redirect;
		});

	
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			//res.render('connect-local.ejs', { message: req.flash('loginMessage') });
			res.send(200,'authing');
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------


		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


	// meetup --------------------------------

		// send to meetup to do the authentication
		app.get('/connect/meetup', passport.authorize('meetup', { scope : 'email' }));

		// handle the callback after meetup has authorized the user
		app.get('/connect/meetup/callback',
			passport.authorize('meetup', {
				successRedirect : '/profile/',
				failureRedirect : '/'
			}));



// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});


};




// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {

	console.log(req.cookies);
	console.log(req.user);
	if (!req.isAuthenticated()){
		res.send(401);  //send unauthorized
	}
		 
	else{
		return next();
	}
		
}


// ensureAuthenticated = function (req, res, next) {
//   if (req.isAuthenticated()) { return next(); }

//   // If the user is not authenticated, then we will start the authentication
//   // process.  Before we do, let's store this originally requested URL in the
//   // session so we know where to return the user later.
//   console.log('-------- THING');
//   req.session.redirectUrl = req.url;

//   // Resume normal authentication...

//   logger.info('User is not authenticated.');
//   req.flash("warn", "You must be logged-in to do that.");
//   res.redirect('/');
// }