var mailer = require('../../../mail/IF_mail.js')
var fs = require('fs');
var kipcart = require('../cart');
var co = require('co');
var _ = require('lodash');

module.exports = function(agenda) {
  agenda.define('send cart status email', function (job, done) {
    db.Chatusers.find(job.attrs.data.userId, function(err, user) {
      if(err) return done(err);
      var html = `Thank you for using Kip! Here is the list of items in your team cart:\n\n<table border="1"><thead><tr><th>Item</th><th>Price</th><th>Quantity</th><th>Added By</th></tr></thead>`
      kipcart.getCart(job.attrs.data.cart_id).then(function(cart, err){

        co(function*(){
            if (!_.get(cart,'aggregate_items')) {
              kip.debug('/jobs/email.js:22: There are no items in cart. Aborting weekly cart status email.');
              return
            }
            var userNames = [];
            yield cart.aggregate_items.map( function * (item) {
              var addedUser = yield db.Chatusers.find({'id': item.added_by[0]}).limit(1).exec();
              userNames[_.get(addedUser,'[0].id')] = _.get(addedUser,'[0].name')
            })
                 
            var orders = cart.aggregate_items.map( function (item) {
              var names = item.added_by.map(function(id) { return userNames[id] })
              html += `<tr><td>${_.get(item,'title')}</td><td>${_.get(item,'price')}</td><td>${_.get(item,'quantity')}</td><td>${names.join(' ')}</td></tr>`
            });

            html += `<tr><a href=${cart.link}>Check out now!</a></tr>`
            var payload = {
              to: `"${_.get(user,'[0].name')}" <${job.attrs.data.to}>`,
              from: `Kip Café <hello@kipthis.com>`,
              subject: job.attrs.data.subject,
              html: html
            }
            mailer.sendMail(payload, function(err, info) {
              if (err) return kip.debug(' \n\n\n\n /jobs/email.js: error sending email: ', err, ' \n\n\n\n ');
              done();
            });
        })

      });
    });
  });



  // More email related jobs
}
