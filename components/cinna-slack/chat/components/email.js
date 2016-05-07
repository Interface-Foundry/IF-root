/*
   ___  ___ ___   ____  ____  _
  /  _]|   |   | /    ||    || |
 /  [_ | _   _ ||  o  | |  | | |
|    _]|  \_/  ||     | |  | | |___
|   [_ |   |   ||  _  | |  | |     |
|     ||   |   ||  |  | |  | |     |
|_____||___|___||__|__||____||_____|

*/
// var key = process.env.NODE_ENV === 'production' ? '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' : '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';
// var sendgrid = require('sendgrid')(key);
var co = require('co');
require('promisify-global');
var db = require('db');
var iokip = require('./io');
var uuid = require('uuid');
var _ = require('lodash');
var linkify = require('linkifyjs');
var send = require('../../../IF_mail/IF_mail.js').send;
var juice = require('juice');
var fs = require('fs');
var parsereply = require('parse-reply');

//
// Email templates
//
var template_collect = fs.readFileSync(__dirname + '/email-collect.html', 'utf8');
var template_generic = fs.readFileSync(__dirname + '/email-generic.html', 'utf8');
var template_results = fs.readFileSync(__dirname + '/email-results.html', 'utf8');

var addr = {
  production: 'kip@kip.ai',
  development: 'inbound@pbrandt1.bymail.in'
}[process.env.NODE_ENV] || 'kip@kip.ai';

var plaintext_signature = `

Your Shopping Assistant,

Kip

kip@kip.ai

--

`;


//
// Process incoming email from sendgrid.  gets the relevant conversation from mongo and passes to io.js
// assumes everythig is connected to a slack team
//
var processEmail = module.exports.process = function(message) {
  return co(function*() {
    console.log(message);

    // parse the threadId from the email message
    message.text = message.text || '';
    var chainId = message.text.match(/email-chain-[a-z0-9\-]+/i);
    console.log(chainId);
    if (!chainId) {
      return;
    } else {
      chainId = chainId[0];
    }

    // make the message nice if it was a reply
    message.text = parsereply(message.text);

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
        channel: 'none',
        org: team.team_id,
        id: chainId,
        user: user.id
      },
      flags: {email: true},
      emailInfo: {
        to: user.profile.email,
        from: 'Kip Bot <kip@kip.ai>',
        subject: message.subject,
        text: '',
        original_message: message
      },
      thread: {
        id: chainId,
        sequence: last_message.sequence + 1
      }
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
var collect = module.exports.collect = function(address, team_name, team_id, team_link) {
    console.log('collect for', team_name, team_id);
    var threadId = 'email-chain-' + uuid.v4();

    var html = template_collect
      .replace(/\$ID/g, threadId)
      .replace(/\$SLACKBOT_NAME/g, team_name)
      .replace(/\$SLACKBOT_LINK/g, team_link);


    var text = `Hey there,

I'm just letting you know that they will be submitting the office purchase order for your slack team ${team_name} soon.

If you need to add anything to the shopping cart, you can either log on to https://${team_link}.slack.com/messages/@kip and talk to me there, or you can just send a reply to this message with the item you are looking for.

Your Shopping Assistant,

Kip

kip@kip.ai

--

${threadId}
`;

    var payload = {
        to: address,
        from: `Kip <${addr}>`,
        subject: 'Last Call for ' + team_name + ' Purchase Order',
        text: text,
        html: html
    };

    var email = new db.Email(_.merge({}, payload, {
      chain: threadId,
      sequence: 0,
      team: team_id
    }))

    return co(function*() {
        yield email.save();
        return send(payload);
    })
}

//
// Replies to whatever message was in the thread
//
var reply = module.exports.reply = function(payload, data) {
  console.log('replying to thread', data.source.id);
  if (!payload || !payload.to) {
    throw new Error('Cannot send email to nobody');
  }

  payload.from = `Kip <${addr}>`;
  payload.subject = data.emailInfo.subject,
  payload.html = template_generic
    .replace(/\$ID/g, data.source.id)
    .replace(/\$MESSAGE/, payload.text)
  payload.text = payload.text + plaintext_signature + data.source.id;

  var email = new db.Email(_.merge({}, payload, {
    chain: data.source.id,
    sequence: data.thread.sequence + 1,
    team: data.source.org
  }))

  return co(function*() {
    yield email.save();
    // var sgemail = new sendgrid.Email(payload);
    // payload.attachments.map((a) => {
    //   sgemail.addFile(a);
    // })
    // return sendgrid.send.promise(sgemail);
    return send(payload);
  })
}


//
// Replies with three choices, woooooooooooooooooooooooooooooooo
//
var results = module.exports.results = function(data) {
  return co(function*() {
    console.log('sending results to thread', data.source.id);

    var payload = {
      to: data.emailInfo.to,
      from: `Kip <${addr}>`,
      subject: data.emailInfo.subject
    };

    payload.html = template_results
      .replace(/\$ID/g, data.source.id)
      .replace(/\$FIRST_NAME/g, data.client_res[0].title.replace(/^1. /, ''))
      .replace(/\$FIRST_LINK/g, data.client_res[0].title_link)
      .replace(/\$FIRST_IMAGE/g, data.client_res[0].image_url)
      .replace(/\$SECOND_NAME/g, data.client_res[1].title.replace(/^2. /, ''))
      .replace(/\$SECOND_LINK/g, data.client_res[1].title_link)
      .replace(/\$SECOND_IMAGE/g, data.client_res[1].image_url)
      .replace(/\$THIRD_NAME/g, data.client_res[2].title.replace(/^3. /, ''))
      .replace(/\$THIRD_LINK/g, data.client_res[2].title_link)
      .replace(/\$THIRD_IMAGE/g, data.client_res[2].image_url)
      .replace(/\$SEARCH_TERM/g, data.tokens)

    var email = new db.Email(_.merge({}, payload, {
      chain: data.source.id,
      sequence: data.thread.sequence + 1,
      team: data.source.org
    }))

    yield email.save();
    return send(payload);
  })
}


if (!module.parent) {
  var template = fs.readFileSync('./email-results.html', 'utf8');

  var template2 = template
    .replace(/\$ID/g, 'email-chain-13f8jasf04fjakdf9320jk')
    .replace(/\$SLACKBOT_NAME/g, 'slytherin')

  // juice it
  var juiced = juice(template2);


  var addr = 'inbound@pbrandt1.bymail.in';
  var team_name = 'Slytherin';
  var payload = {
      to: 'peter.m.brandt@gmail.com',
      from: `Kip <${addr}>`,
      subject: 'Last Call for ' + team_name + ' Purchase Order',
      // text: 'email from kip this is a test plaintext jank',
      html: juiced
  };
  send(payload);
  // collect(['peter.m.brandt@gmail.com'], 'bae')
  //   .then(console.log.bind(console))
  //   .catch(function(err) {
  //     console.error(err.stack);
  //   });
}
