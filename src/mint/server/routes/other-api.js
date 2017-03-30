const co = require('co')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

module.exports = function (router) {
  /**
   * @api {get} /api/error Error
   * @apiDescription Trigger an error for testing
   * @apiGroup Other
   */
  router.get('/error', (req, res) => co(function * () {
    console.log('gonna throw an error now')
    throw new Error('omg error')
  }))

  /**
   * @api {get} /api/email/:email_id.png Email Tracker
   * @apiDescription Sends a 1x1 pixel image back to track when a user opens an email.
   * @apiGroup Other
   * @apiParam {string} :email_id the id of the user (remember to add .png to it)
   * @apiParamExample Request
   * get https://mint.kipthis.com/api/email/53b5e701-5282-4efd-953c-082bc29a329c.png
   *
   * @type {Image}
   */
  router.get('/email/:email_id', (req, res) => co(function * () {
    res.sendfile(__dirname + '/one-pixel.png')

    const email_id = req.params.email_id.replace(/.png$/, '')
    var open = db.EmailOpens.create({
      email: email_id
    })

    yield open.save()
  }))
}
