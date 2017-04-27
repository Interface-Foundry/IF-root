var assert = require('assert')
var co = require('co')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; })

describe('waterline', () => {
  it('should not throw really annoying errors', () => co(function * () {
    yield dbReady
    var session = yield db.Sessions.create({})
    assert(session.createdAt)
  }))
})
