var Q        = require('q')
var db       = require('../../db')
// var mongoose = require('mongoose');
// var Schema   = mongoose.Schema;

// var chatuserSchema = mongoose.Schema({
//     id: String,
//     type: { type: String }, // slack, telegram, skype, etc.
//     dm: String, // direct message channel id
//     team_id: String,
//     name: String,
//     deleted: Boolean,
//     color: String,
//     real_name: String,
//     tz: String,
//     tz_label: String,
//     tz_offset: Number,
//     profile: {
//         avatar_hash: String,
//         real_name: String,
//         real_name_normalized: String,
//         email: String,
//         image_24: String,
//         image_32: String,
//         image_48: String,
//         image_72: String,
//         image_192: String,
//         image_512: String,
//     },
//     is_admin: Boolean,
//     is_owner: Boolean,
//     is_primary_owner: Boolean,
//     is_restricted: Boolean,
//     is_ultra_restricted: Boolean,
//     is_bot: Boolean,
//     has_2fa: Boolean,
//     settings: {
//       last_call_alerts: {
//         type: Boolean,
//         default: true
//       },
//       emailNotification: {
//         type: Boolean,
//         default: false
//       },
//       awaiting_email_response: {
//         type: Boolean,
//         default: false
//       }
//     }
// });



var COUNTRY = {
  DEFAULT: ['.com'],
  US: ['.com'],
  CANADA: ['.ca'],
  UK: ['.co.uk'],
  AUSTRALIA: ['.com.au'],
  INDIA: ['.in'],
  JAPAN: ['co.jp'],
  FRANCE: ['.fr'],
  GERMANY: ['.de'],
  ITALY: ['.it'],
  NETHERLANDS: ['.nl'],
  SPAIN: ['.es'],
  IRELAND: ['.ie'],
  MEXICO: ['.com.mx'],
  BRAZIL: ['.com.br']
}

// var Chatusers = mongoose.model('Chatuser', chatuserSchema);


// mongoose.connect('mongodb://localhost/foundry');

function getCountry(user_id) {
  var foundUser;
  return Q(db.Chatusers.findOne({ id : user_id }).exec())
  .then(function(user) {
    foundUser = user;
    return foundUser
  })
}

var uid = 'U1D5B9TQR'
var url = 'https://www.amazon.com/gp/product/B01D9XC2LY/ref=s9_simh_gw_g21_i2_r?ie=UTF8&fpl=fresh&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=&pf_rd_r=H7D4EQEEFPDBBDE6ZSR0&pf_rd_t=36701&pf_rd_p=6aad23bd-3035-4a40-b691-0eefb1a18396&pf_rd_i=desktop'

var url2 = getCountry(uid).then(function(user) {
    var user_country = JSON.parse(JSON.stringify(user)).country
    if (COUNTRY.hasOwnProperty(user_country)) {
      console.log('in country list')
      var url2 = url.split('.com').join(COUNTRY[user_country])
      return url2
    }
  }).catch(function(err) {
    console.error('Something went wrong: ' + err);
  }).done()


Q.

// console.log(url2)