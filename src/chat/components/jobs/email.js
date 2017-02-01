// jobs/email.js
var mailer = require('../../../mail/IF_mail.js')
var fs = require('fs');
var kipcart = require('../cart');
var co = require('co');
var _ = require('lodash');
var async = require('async');
var kipcart = require('../cart');
var utils = require('../slack/utils');


module.exports = function(agenda) {
  agenda.define('send cart status email', function (job, done) {
    co( function * () {
      logging.info('started job: send cart status email');
      let slackbots = yield db.Slackbots.find({'meta.weekly_status_enabled': true});
      let teams = yield slackbots.map( function * (team) {
        let admins = yield utils.findAdmins(team);
        return { team: team, admins: admins }
      });
      logging.info('\nfound teams in db: ', teams.length,'\n');
      async.eachSeries(teams, function(obj, callback) {
        co( function * () {
          if (!(_.get(obj,'admins') && _.get(obj,'admins').length > 0)) return callback();
          let carts = yield db.Carts.find({"slack_id": obj.team.team_id}).populate('items').exec();
          let cart = _.get(carts,'[0]');
          if (!cart || !(cart && _.get(cart,'aggregate_items') && _.get(cart,'aggregate_items').length > 0)) return callback()
          async.eachSeries(obj.admins, function(admin, callback2){
            co(function * () {
              let html = `Thank you for using Kip! Here is the list of items in your team cart:\n\n`
              html += `<table border="1"><thead><tr><th>Item</th><th>Price</th><th>Quantity</th><th>Added By</th></tr></thead>`
              let userNames = [];
              yield cart.aggregate_items.map( function * (item) {
                let addedUser = yield db.Chatusers.find({'id': item.added_by[0]}).limit(1).exec();
                userNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].name')
              })
              let orders = cart.aggregate_items.map( function (item) {
                let names = item.added_by.map(function(id) { return userNames[id] })
                html += `<tr><td>${_.get(item,'title')}</td><td>${_.get(item,'price')}</td><td>${_.get(item,'quantity')}</td><td>${names.join(' ')}</td></tr>`
              });
              html += `<tr><a href=${cart.link}>Check out now!</a></tr>`
              let payload = {
                //please remember to change this back
                to: 'hannah.katznelson@gmail.com',//`"${_.get(admin,'name')}" <${_.get(admin,'profile.email')}>`,
                from: `Kip Café <hello@kipthis.com>`,
                subject: 'This is your weekly team cart status email from Kip!',
                html: html
              }
              mailer.sendMail(payload, function(err, info) {
                if (err) return kip.debug(' \n\n\n\n /jobs/email.js: error sending email: ', err, ' \n\n\n\n ');
                logging.info('job: sent cart snapshot email to ', admin.name, ' for team ', obj.team.team_name, ' ',obj.team.team_id, ' info: ', info);
                return setTimeout(callback2, 2000);
              });
            })
          }, function(err){
            setTimeout(callback, 2000)
          })
       })
      }, function(err){
        if(err) logging.err('job: weekly cart snapshots err', err)
        logging.info('finished job: send cart status email');
        done()
      })
  })
 });
}
