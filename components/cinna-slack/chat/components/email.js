/*
   ___  ___ ___   ____  ____  _
  /  _]|   |   | /    ||    || |
 /  [_ | _   _ ||  o  | |  | | |
|    _]|  \_/  ||     | |  | | |___
|   [_ |   |   ||  _  | |  | |     |
|     ||   |   ||  |  | |  | |     |
|_____||___|___||__|__||____||_____|

*/
var key = process.env.NODE_ENV === 'production' ? 'LOL-TO-DO' : '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';
var sendgrid = require('sendgrid')(key);
var co = require('co');
require('promisify-global');
var db = require('db');
var iokip = require('./io');
var uuid = require('uuid');
var _ = require('lodash');
var linkify = require('linkifyjs');

//
// Process incoming email from sendgrid.  gets the relevant conversation from mongo and passes to io.js
// assumes everythig is connected to a slack team
//
var processEmail = module.exports.process = function(message) {
  return co(function*() {
    console.log(message);

    // make the message nice if it was a reply


    // parse the threadId from the email message
    message.text = message.text || '';
    var chainId = message.text.match(/email-chain-[a-z0-9\-]+/i);
    console.log(chainId);
    if (!chainId) {
      return;
    } else {
      chainId = chainId[0];
    }

    // get all the stuff from the db for this email
    var last_message = yield db.Emails.findOne({
      chain: chainId
    }).sort('-sequence').exec();

    if (!last_message) {
      throw new Error('No last message found, so no team sorry cannot do this it\'s just over.')
      last_message = {
        chain: 'email-chain-' + uuid.v4(),
        sequence: 0
      }
    }

    console.log(last_message);

    var team = yield db.Slackbots.findOne({
      team_id: last_message.team
    }).exec();

    var user_email = _.get(linkify.find(message.from).filter((a) => {
      return a.type === 'email'
    }), '[0].value');
    var user = yield db.Chatusers.findOne({
      team_id: last_message.team,
      'profile.email': user_email
    }).exec();

    // save this message to the db for the conversation
    var m = new db.Email(_.merge({}, message, {
      chain: chainId,
      team: last_message.team,
      sequence: last_message.sequence + 1
    }))
    m.save();

    // iokip.preProcess({
    //   msg: message.text.split(/On (.*) wrote/)[0].trim(),
    //   source: {
    //     origin: 'email',
    //     channel: 'email',
    //     org: team.team_id,
    //     id: chainId,
    //     user: user.id
    //   },
    //   // thread: {
    //   //   id: chainId,
    //   //   sequence: last_message.sequence + 1
    //   // }
    // });

    iokip.preProcess({
      msg: message.text.split(/On (.*) wrote/)[0].trim(),
      source: {
        origin: 'slack',
        channel: 'fasl;kf rw;h[uhjka]',
        org: team.team_id,
        id: chainId,
        user: user.id
      },
      flags: {email: true},
      emailInfo: {
        to: user.profile.email,
        from: 'Kip Bot <kip@kip.ai>',
        subject: message.subject,
        text: ''
      }
      // thread: {
      //   id: chainId,
      //   sequence: last_message.sequence + 1
      // }
    });

  })
}


/*
D.H., 1991           __gggrgM**M#mggg__
                __wgNN@"B*P""mp""@d#"@N#Nw__
              _g#@0F_a*F#  _*F9m_ ,F9*__9NG#g_
           _mN#F  aM"    #p"    !q@    9NL "9#Qu_
          g#MF _pP"L  _g@"9L_  _g""#__  g"9w_ 0N#p
        _0F jL*"   7_wF     #_gF     9gjF   "bJ  9h_
       j#  gAF    _@NL     _g@#_      J@u_    2#_  #_
      ,FF_#" 9_ _#"  "b_  g@   "hg  _#"  !q_ jF "*_09_
      F N"    #p"      Ng@       `#g"      "w@    "# t
     j p#    g"9_     g@"9_      gP"#_     gF"q    Pb L
     0J  k _@   9g_ j#"   "b_  j#"   "b_ _d"   q_ g  ##
     #F  `NF     "#g"       "Md"       5N#      9W"  j#
     #k  jFb_    g@"q_     _*"9m_     _*"R_    _#Np  J#
     tApjF  9g  J"   9M_ _m"    9%_ _*"   "#  gF  9_jNF
      k`N    "q#       9g@        #gF       ##"    #"j
      `_0q_   #"q_    _&"9p_    _g"`L_    _*"#   jAF,'
       9# "b_j   "b_ g"    *g _gF    9_ g#"  "L_*"qNF
        "b_ "#_    "NL      _B#      _I@     j#" _#"
          NM_0"*g_ j""9u_  gP  q_  _w@ ]_ _g*"F_g@
           "NNh_ !w#_   9#g"    "m*"   _#*" _dN@"
              9##g_0@q__ #"4_  j*"k __*NF_g#@P"
                "9NN#gIPNL_ "b@" _2M"Lg#N@F"
                    ""P@*NN#gEZgNN@#@P""
*/

//
// 1-800-EMAILBAE  😘
//
var collect = module.exports.collect = function(addresses, id) {
    var threadId = 'email-chain-' + uuid.v4();
    var text = `Hey bae,
just lettin u know that i care about u, so i wanted to say that the last call for office stuff is soon. whisper your dreams in my ear and i will make it so.

😘

Your Shopping Assistant,

Kip

kip@kip.ai

--

${threadId}
`

    var addr = {
      production: 'kip@kip.ai',
      development: 'inbound@pbrandt1.bymail.in'
    }[process.env.NODE_ENV] || 'kip@kip.ai';

    var payload = {
        to: addresses,
        from: `Kip Shopping Assistant <${addr}>`,
        subject: 'Last Call for Office Purchase Order',
        text: text
    };

    var email = new db.Email(_.merge({}, payload, {
      chain: threadId,
      sequence: 0,
      team: id
    }))

    return co(function*() {
        yield email.save();
        return sendgrid.send.promise(payload);
    })
}


if (!module.parent) {
  collect(['peter.m.brandt@gmail.com'], 'bae')
    .then(console.log.bind(console))
    .catch(function(err) {
      console.error(err.stack);
    });
}
