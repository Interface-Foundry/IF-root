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
              const checkout = `<a href="${cart.link}"><div style="display:inline-block;background-color:white;border-radius:8px;border-color:${kip_blue};border-style:solid;border-width:2px;">` +
              `<p style="margin:0.575em 0 0.575em 0;font-weight:bold;color:${kip_blue}">&nbsp;&nbsp;&nbsp;Check out now!&nbsp;&nbsp;&nbsp;</p></div></a>`

              //html for email
              let html = `<html>`

              //header
              html += `<img src="http://tidepools.co/kip/oregano/onboard_3.png">`
              html += `<h1 style="font-size:2em;">Team Cart</h1><br/>`
              // html += `<br/><a href=${cart.link}>Check out now!</a><br/>`
              html += checkout + `<br/><br/>`

              //table headings
              html += `Thank you for using Kip! Here is the list of items in your team cart:\n\n<br/>`
              html += `<table style="width:100%;border-spacing:5.5px;" border="0">`
              html += `<thead style="padding:5px 0 5px 0;color:white;background-color:${kip_blue}"><tr><th>Item</th>`
              html += `<th>Quantity</th>`
              html += `<th>Item Price</th>`
              html += `<th>Total Price</th>`
              html += `<th>Added By</th></tr></thead>`

              // items in the cart
              let userNames = [];
              let firstNames = [];
              let lastNames = [];
              var cart_total = 0;

              yield cart.aggregate_items.map( function * (item) {
                let addedUser = yield db.Chatusers.find({'id': item.added_by[0]}).limit(1).exec();
                userNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].name')
                firstNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].first_name')
                lastNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].last_name')
              })

              var formatDate = function (date) {
                var month = date.getMonth() + 1
                var day = date.getDate()
                var year = date.getFullYear()
                return (month > 9 ? '' + month : '0' + month) + '/' + (day > 9 ? '' + day: '0' + day) + '/' + year
              }
              var date = formatDate(new Date())

              yield cart.aggregate_items.map( function (item) {
                console.log('item', item)
                let names = item.added_by.map(function(id) { return userNames[id] })
                let full_name = item.added_by.map(function (id) {
                  if (firstNames[id] && lastNames[id]) {
                    return firstNames[id] + ' ' + lastNames[id]
                  }
                  else return ''
                })
                let price = _.get(item,'price')
                let qty = _.get(item, 'quantity')
                let total_price = '$' + (Number(price.slice(1, price.length)) * Number(qty)).toFixed(2)
                console.log('date', date)
                // console.log('CART', Object.keys(cart))
                cart_total += Number(total_price.slice(1, total_price.length))

                html += `<tr><td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}><a style="text-decoration:none;color:${kip_blue};" href="${item.link}">${_.get(item,'title')}</a></td>`
                html += `<td style="padding:10px;position:absolute;text-align:center;" bgcolor=${ryan_grey}>${qty}</td>`
                html += `<td style="padding:10px;position:absolute;text-align:center;" bgcolor=${ryan_grey}>${price}</td>`
                html += `<td style="padding:10px;position:absolute;text-align:center;" bgcolor=${ryan_grey}>${total_price}</td>`
                html += `<td style="padding:10px;position:absolute;" bgcolor=${ryan_grey}><p>${full_name}</p><p>@${names.join(' ')}</p></td></tr>`
              })
              html += `</table>`

              // console.log('OBJ', obj)
              console.log('names???', firstNames, lastNames)
              console.log('built table')

              //footer
              html += `<br/><p style="font-weight:bold;">Cart Total: $${cart_total.toFixed(2)}</p>`
              // html += `<br/><a href=${cart.link}>Check out now!</a><br/>`
              html += checkout + `<br/><br/>`

              html += `<br/><table border="0" style="padding:10px;width:100%;background-color:${kip_blue};"><tr style="width:100%;"><td style="width:100%;"><table style="border-spacing:0 20px;border-radius:4px;width:100%">`
              html += `<tr style="width:100%"><td><div style="position:absolute;width:100%;height:100%;text-align:center;"><img height="16" width="16" src="http://tidepools.co/kip/oregano/Slack_Icon.png">`
              html += `<a style="text-decoration:none;" href="${cart.link}"><b style="color:white;text-decoration:none;font-weight:normal;font-size:160%;text-align:center;">&nbsp; View Cart on Slack</b></a></div></td></tr></table>`
              // html += `<a href="https://${team_url}.slack.com/messages/${order_users}/" style="color:white;text-decoration:none;font-size:140%;text-align:center;">&nbsp;Click to chat with your food crew!</a></td></tr></table>`
              html += `<table style="width:100%;"><tr><td style="width:300px;"><p style="padding:0 20px 0 20px;font-size:85%;color:white;text-align:right;">Kip © 2017</p></td>`
              html += `<td style="width:300px;"><a style="padding:0 20px 0 20px;color:white;text-decoration:none;font-size:85%" href="https://kipthis.com/legal.html">Terms of Use</a></td></tr>`
              html += `</table></td></tr></table><br></html>`

              console.log('built html')

              let payload = {
                //please remember to change this back
                to: '"Hannah Lorane Katznelson" <hannah.katznelson@gmail.com>',//`"${_.get(admin,'name')}" <${_.get(admin,'profile.email')}>`,
                from: `Kip Store <hello@kipthis.com>`,
                subject: `Kip ` + obj.team.team_name + ` updates for the week of ` + date,
                html: html
              }

              console.log('built payload')
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
