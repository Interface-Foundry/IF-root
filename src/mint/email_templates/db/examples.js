/**
 *  * Models loaded from the waterline ORM
 *   */
var db;
const dbReady = require('../db');

var co = require('co')

co(function * () {
  db = yield dbReady

  //
  // create a session

  var sesh = yield db.Sessions.create({
    session_id: Math.random().toString(36).slice(2)
  })

  console.log('created session', sesh)

  //
  // create a user

  var email = 'functor_x'+ (Math.random()*1e7|0) + '@isomorph.ism'
  var user = yield db.UserAccounts.create({
    email_address: email,
    sessions: [sesh]
  })

  console.log('created user', user) // notice user.sessions is not written to screen here

  //
  // probably best practice is to refresh the object with .populate if you plan on using embedded documents

  user = yield db.UserAccounts.findOne({user_id: user.user_id}).populate('sessions')

  console.log('created user, populated', user) // fetch it again with .popuote, and now you see sessions

  //
  //
  //
  // WHOA MORE COOL STUFF (pretend the same user is logging in on a mobile device)

  var mobileSesh = yield db.Sessions.create({
    session_id: 'mobile+' + Math.random().toString(36).slice(2)
  })

  var user = yield db.UserAccounts.findOne({
    email_address: email
  })

  user.sessions.add(mobileSesh)

  // remember to save

  yield user.save()


  // remember to reload it with populate to get all the embedded docs

  user = yield db.UserAccounts.findOne({user_id: user.user_id}).populate('sessions')

  console.log('user with mobile session', user)
  

  console.log('done')
}).catch(e => {
  console.error(e)
  console.error(e.stack)
})
