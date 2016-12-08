require('co-mocha')
var sleep = require('co-sleep')
var assert = require("assert")

describe('async stuff multiple tests in parralel', () => {
  it('should do one at a time hopefully?', function * ()  {
    console.log('A')
    yield sleep(1000)
    console.log('B')
    assert(true)
  })
  it('should hopefully not console.log this', function * () {
    console.log('IF YOU SEE THIS BEFORE B THEN WERE H*CKED')
    yield sleep(1000)
    console.log('boo yeah')
    assert(true)
  })
})
