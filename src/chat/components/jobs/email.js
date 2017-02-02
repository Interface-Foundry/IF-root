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
          console.log('getting admins')
          if (!(_.get(obj,'admins') && _.get(obj,'admins').length > 0)) return callback();
          console.log('passed the getting admins thing')
          let carts = yield db.Carts.find({"slack_id": obj.team.team_id}).populate('items').exec();
          let cart = _.get(carts,'[0]');
          console.log('got the cart: ', cart)
          if (!cart || !(cart && _.get(cart,'aggregate_items') && _.get(cart,'aggregate_items').length > 0)) return callback()
          async.eachSeries(obj.admins, function(admin, callback2){
            co(function * () {

              //email consts
              const kip_blue = '#47a2fc'
              const ryan_grey = '#F5F5F5'

              //html for email
              let html = `<html>`

              //header
              html += `<img src="http://tidepools.co/kip/oregano/onboard_3.png">`
              html += `<h1 style="font-size:2em;">Team Cart</h1>`

              //table headings
              html += `Thank you for using Kip! Here is the list of items in your team cart:\n\n`
              html += `<table style="width:100%;border-spacing:5.5px;" border="0"><thead><tr><th>Item</th><th>Price</th><th>Quantity</th><th>Added By</th></tr></thead>`

              // items in the cart
              let userNames = [];
              yield cart.aggregate_items.map( function * (item) {
                let addedUser = yield db.Chatusers.find({'id': item.added_by[0]}).limit(1).exec();
                userNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].name')
              })
              let orders = cart.aggregate_items.map( function (item) {
                let names = item.added_by.map(function(id) { return userNames[id] })
                html += `<tr><td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}>${_.get(item,'title')}</td>`
                html += `<td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}>${_.get(item,'price')}</td>`
                html += `<td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}>${_.get(item,'quantity')}</td>`
                html += `<td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}>${names.join(' ')}</td></tr>`
              });
              html += `</table>`

              //footer
              html += `<br/><a href=${cart.link}>Check out now!</a></html>`

              let payload = {
                //please remember to change this back
                to: '"Hannah Lorane Katznelson" <hannah.katznelson@gmail.com>',//`"${_.get(admin,'name')}" <${_.get(admin,'profile.email')}>`,
                from: `Kip Café <hello@kipthis.com>`,
                subject: 'Your weekly team cart status email from Kip!',
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
