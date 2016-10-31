var _ = require('lodash')
var request = require('request-promise')

class UserChannel {

  constructor (queue) {
    this.queue = queue
    this.send = function (session, nextHandlerID, data, replace) {
      // make sure all attachments have a callback_id
      if (_.get(data, 'attachments', []).length > 0) {
        data.attachments.map(a => {
          a.callback_id = a.callback_id || 'default'
        })
      } 

      // kip.debug('\n\n\n\n UserChannel: ', data,'\n\n\n\n');

      // because javascript is not statically typed
      if (_.get(data, 'data.attachments', []).length > 0) {
        data.data.attachments.map(a => {
          a.callback_id = a.callback_id || 'default'
        })
      }

      var newSession = new db.Message({
        incoming: false,
        thread_id: session.thread_id,
        resolved: true,
        user_id: 'kip',
        origin: session.origin,
        source: session.source,
        mode: session.mode,
        action: session.action,
        state: session.state,
        user: session.source.user
      })
      newSession['reply'] = data;
      newSession.mode = nextHandlerID.split('.')[0];
      newSession.action = nextHandlerID.split('.').slice(1).join('.');
      kip.debug('inside channel.send(). Session mode is ' + newSession.mode);
      kip.debug('inside channel.send(). Session action is ' + newSession.action);
      var self = this
      newSession.save(function (err, saved) {
        if (err) {
          kip.debug('mongo save err: ', err)
          throw Error(err)
        }
        if (replace && _.get(session, 'source.response_url')) {
          request({
            method: 'POST',
            uri: session.source.response_url,
            body: JSON.stringify(data.data)
          })
        } else {
          self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
        }
      })
    }

    this.sendReplace = function (session, nextHandlerID, data) {
      if (process.env.NODE_ENV === 'test') {
        logging.error('sendReplace not working correctly in testing, sending as default message')
        this.send(session, nextHandlerID, data, false)
      } else {
        this.send(session, nextHandlerID, data, true)
      }
    }
    return this
  }
}

module.exports = UserChannel
