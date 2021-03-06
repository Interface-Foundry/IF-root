var _ = require('lodash')
var request = require('request-promise')

function cleanAttachment (a) {
  // every attachmnet needs a callback id
  a.callback_id = _.get(a, 'callback_id') || 'default'

  // also should json stringify action.value
  _.get(a, 'actions', []).map(action => {
    if (typeof action.value === 'object') {
      action.value = JSON.stringify(action.value)
    }
  })
}

class UserChannel {

  constructor (queue) {
    this.queue = queue
    this.send = function (session, nextHandlerID, data, replace) {

      // make sure all attachments have a callback_id
      if (_.get(data, 'attachments', []).length > 0) {
        data.attachments.map(cleanAttachment)
      }

      // do the same thing again, because javascript is not statically typed
      if (_.get(data, 'data.attachments', []).length > 0) {
        data.data.attachments.map(cleanAttachment)
      }

      // have seen a few times session.origin/mode/etc dont exist.
      // should probably find a better solution or why that is happening but idc rn
      if (session.origin === undefined) session.origin = 'slack'
      if (session.mode === undefined) session.mode = 'food'

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
      if (replace && session.slack_ts) {
        newSession.replace_ts = session.slack_ts
      }
      newSession['reply'] = data
      newSession.mode = nextHandlerID.split('.')[0]
      newSession.action = nextHandlerID.split('.').slice(1).join('.')
      kip.debug('inside channel.send(). Session mode is ' + newSession.mode)
      kip.debug('inside channel.send(). Session action is ' + newSession.action)
      var self = this
      return new Promise((resolve, reject) => {
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
          } else if (replace && newSession.replace_ts) {
            self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
          } else if (replace && session.slack_ts) {
            newSession.replace_ts = session.slack_ts
            self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
          } else {
            self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
          }
          resolve(newSession)
        })
      })
    }

    this.sendReplace = function (session, nextHandlerID, data) {
      if (process.env.NODE_ENV === 'test') {
        logging.error('sendReplace not working correctly in testing, sending as default message')
        return this.send(session, nextHandlerID, data, false)
      } else {
        return this.send(session, nextHandlerID, data, true)
      }
    }
    return this
  }
}

module.exports = UserChannel
