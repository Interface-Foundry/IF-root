require('../../../kip')
var co = require('co')
var sleep = require('co-sleep')
var slack = require('@slack/client')
const fs = require('fs')
var forEach = require('co-foreach');

/**
 * File which was used to send marketing messages
 * See also gen_users.js for the code which was used to generate the lists of users
 * @module slack/feature_rollout
 */


//
// Grab the batch's file of admin id's to spam
//
// const filename = fs.readdirSync(__dirname)
//   .filter(f => f.match(/^user.*.json$/))[0]
// console.log(filename)
// const batch = parseInt(filename.match(/[0-9]+/)[0])
// const users = require('./' + filename)
// fs.renameSync(filename, filename + '.done')

//
// We'll send this message to ppl as a marketing campaign
//
const message = {
  "text":"",
  "attachments": [{
    "text": "",
    "pretext":"Tomorrow is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉",
    "image_url": "https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_1.png",
    "mrkdwn_in": ["text,pretext"],
    "fallback": "Tomorrow is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉",
    "callback_id": "none",
    "color":"#52A2F0",
    "author_name": "BloomThat",
    "author_link": "https://www.bloomthat.com",
    "author_icon": "https://storage.googleapis.com/kip-random/bloomthat_quiz/bloomthat_social_media.png",
    "actions": [{
      "name": "quiz_bloomthat",
      "value": "quiz_bloomthat",
      "text": "Find Out Now 🙌🏽",
      "style": "primary",
      "type": "button"
    }, {
      "name": "quiz_bloomthat_help",
      "value": "quiz_bloomthat_help",
      "text": "What's Admin Day?",
      "style": "default",
      "type": "button"
    }]
  }]
}


//FIND USERS//
//--- is_bot=false, deleted=false

// America/Indiana/Indianapolis

//
// Sends a message to a specific user
//
function sendToUser (userId,teamId) {
  console.log('running for user', userId)
  
  return co(function * () {
    
    
    // get the full user obj
    var user = yield db.Chatusers.findOne({id: userId, team_id: teamId}).exec()

    if (!user) {
      console.log('could not find user in db', userId)
      return
    }

    //console.log('🌵🌵 !user! ',user)

    // Don't re-send to someone who we have already sent this marketing message
    var sentCount = yield db.Metrics.count({
      'data.user': user.id,
      'data.feature': 'bloomthat'
    }).exec()

    //console.log('🌵🌵 ! ',sentCount)

    if (sentCount > 0) {
      console.log('already sent to user', userId)
      return
    }

    // CHECK HERE WHICH TIMEZONE THEY'RE IN, so it's 10am their time. so run it at 10am , 11am, 12pm 

    //ACTUALLY GET THREE DIFFERENT LISTS OF USERS, by timezone (when it's 10am their time)


    // Send a message to this user 
    let slackbot = yield db.Slackbots.findOne({team_id: teamId}).exec()

    try {
      let bot = new slack.WebClient(slackbot.bot.bot_access_token)
      //console.log(bot)

      
      yield bot.chat.postMessage(user.dm, '', message)

      db.Metrics.log('feature.rollout.sent', {
        team: teamId,
        user: user.id,
        feature: 'bloomthat'
      })  

    } catch (err) {
      console.log('SLACK ERROR HERE ')
    }


  })
}

 //db.chatusers.find({'is_bot':false,'deleted':false}).count()


var teamsTestAll = [
{
  'team_name':'kip'
}
]

var teamsAll = [
   {
      "team_name":"Reload360"
   },
   {
      "team_name":"RP3"
   },
   {
      "team_name":"phantlab"
   },
   {
      "team_name":"SDG Customer Intelligence"
   },
   {
      "team_name":"adatia"
   },
   {
      "team_name":"sookoh"
   },
   {
      "team_name":"startfast"
   },
   {
      "team_name":"Nasstar"
   },
   {
      "team_name":"LeanPath"
   },
   {
      "team_name":"Dagon"
   },
   {
      "team_name":"supertext"
   },
   {
      "team_name":"ack sf"
   },
   {
      "team_name":"Trimfit"
   },
   {
      "team_name":"BIMZ"
   },
   {
      "team_name":"PQ Penang"
   },
   {
      "team_name":"AgentCindy"
   },
   {
      "team_name":"Try The World"
   },
   {
      "team_name":"Finalsite Support"
   },
   {
      "team_name":"project-alta"
   },
   {
      "team_name":"Alien Labs Inc."
   },
   {
      "team_name":"Bitask"
   },
   {
      "team_name":"Pradeep"
   },
   {
      "team_name":"D3"
   },
   {
      "team_name":"Starling"
   },
   {
      "team_name":"blur UX"
   },
   {
      "team_name":"atglabs"
   },
   {
      "team_name":"CommerceVC"
   },
   {
      "team_name":"Corigin Ventures"
   },
   {
      "team_name":"CERFCORP"
   },
   {
      "team_name":"Foxtail Marketing"
   },
   {
      "team_name":"Yarn"
   },
   {
      "team_name":"InnovateMap"
   },
   {
      "team_name":"centercloud"
   },
   {
      "team_name":"Walmart Labs"
   },
   {
      "team_name":"ProjectRock2.0"
   },
   {
      "team_name":"DecksDirect"
   },
   {
      "team_name":"GoPato"
   },
   {
      "team_name":"zHome"
   },
   {
      "team_name":"Awoo"
   },
   {
      "team_name":"ZenMarket"
   },
   {
      "team_name":"Appsama"
   },
   {
      "team_name":"Essential"
   },
   {
      "team_name":"Slacapella"
   },
   {
      "team_name":"Vivaara"
   },
   {
      "team_name":"Rytass"
   },
   {
      "team_name":"geministrategy"
   },
   {
      "team_name":"DPSGinteractive"
   },
   {
      "team_name":"Britalia Optical"
   },
   {
      "team_name":"19th Street Salon & Spa"
   },
   {
      "team_name":"deMello Group"
   },
   {
      "team_name":"ABC Dental"
   },
   {
      "team_name":"J.O.O.M"
   },
   {
      "team_name":"VaynerMedia"
   },
   {
      "team_name":"emobilie"
   },
   {
      "team_name":"NVP consumer"
   },
   {
      "team_name":"BingforPartnerTeam"
   },
   {
      "team_name":"Koa Studio"
   },
   {
      "team_name":"Flow XO Services"
   },
   {
      "team_name":"ShopatHome-Discovery"
   },
   {
      "team_name":"Cuebiq"
   },
   {
      "team_name":"tradeshift"
   },
   {
      "team_name":"UT International Programs"
   },
   {
      "team_name":"Altira Inc."
   },
   {
      "team_name":"Drippler"
   },
   {
      "team_name":"Basket"
   },
   {
      "team_name":"GizmoDr"
   },
   {
      "team_name":"SCRLL"
   },
   {
      "team_name":"Velocity Growth Partners"
   },
   {
      "team_name":"Beacon Ventures"
   },
   {
      "team_name":"LLTA"
   },
   {
      "team_name":"Layer"
   },
   {
      "team_name":"VenturesOne"
   },
   {
      "team_name":"betaworks"
   },
   {
      "team_name":"The Participation Agency"
   },
   {
      "team_name":"TADA"
   },
   {
      "team_name":"Style Wingman"
   },
   {
      "team_name":"K+ Online"
   },
   {
      "team_name":"Hecorat"
   },
   {
      "team_name":"JANDY"
   },
   {
      "team_name":"mirai"
   },
   {
      "team_name":"RBMH"
   },
   {
      "team_name":"Sanwo"
   },
   {
      "team_name":"Shooq"
   },
   {
      "team_name":"GSD Audio Visual"
   },
   {
      "team_name":"Label Insight"
   },
   {
      "team_name":"Dropbox"
   },
   {
      "team_name":"Fuel Ventures"
   },
   {
      "team_name":"BloomThat"
   },
   {
      "team_name":"Sears IL"
   },
   {
      "team_name":"Oak Tree Investments"
   },
   {
      "team_name":"Staples Applied Innovation"
   },
   {
      "team_name":"Best Buy Strategy"
   },
   {
      "team_name":"Nike End User Enablement POC"
   },
   {
      "team_name":"R/GA"
   },
   {
      "team_name":"eBay N"
   },
   {
      "team_name":"Morningside VC"
   },
   {
      "team_name":"admart"
   },
   {
      "team_name":"TOPBOTS"
   },
   {
      "team_name":"Muji"
   },
   {
      "team_name":"B Capital Group"
   }
]
var teamsAdminOnly = [
   {
      "team_name":"PI"
   },
   {
      "team_name":"Firma Dorsch"
   },
   {
      "team_name":"hihishopping"
   },
   {
      "team_name":"automat"
   },
   {
      "team_name":"GoButler"
   },
   {
      "team_name":"Init"
   },
   {
      "team_name":"Intermedia"
   },
   {
      "team_name":"RushTera"
   },
   {
      "team_name":"IxDA Miami"
   },
   {
      "team_name":"VatosLocos"
   },
   {
      "team_name":"Tech and Talk"
   },
   {
      "team_name":"The77TCollective"
   },
   {
      "team_name":"NandoTech"
   },
   {
      "team_name":"Singlebrook"
   },
   {
      "team_name":"JWJMO"
   },
   {
      "team_name":"T2"
   },
   {
      "team_name":"Platform at Slack"
   },
   {
      "team_name":"Fred & Farid"
   },
   {
      "team_name":"Democratic Alliance"
   },
   {
      "team_name":"Bhaku"
   },
   {
      "team_name":"booboo"
   },
   {
      "team_name":"grandpryze"
   },
   {
      "team_name":"Creative Woods"
   },
   {
      "team_name":"What's The Plan Fam?"
   },
   {
      "team_name":"midwestfurries"
   },
   {
      "team_name":"family"
   },
   {
      "team_name":"Hudson Valley Tech Meetup"
   },
   {
      "team_name":"HeyLuc"
   },
   {
      "team_name":"BAMSAS"
   },
   {
      "team_name":"out-for-delivery"
   },
   {
      "team_name":"Warners"
   },
   {
      "team_name":"MUX4"
   },
   {
      "team_name":"City to City"
   },
   {
      "team_name":"Chaput Family"
   },
   {
      "team_name":"ReimboldEye"
   },
   {
      "team_name":"ITS"
   },
   {
      "team_name":"Rutgers Coding Bootcamp"
   },
   {
      "team_name":"Vermonster"
   },
   {
      "team_name":"sfbot-dev"
   },
   {
      "team_name":"ϛιιξα"
   },
   {
      "team_name":"besiktas"
   },
   {
      "team_name":"trifekta"
   },
   {
      "team_name":"workbus"
   },
   {
      "team_name":"Ben Sutton"
   },
   {
      "team_name":"Coases"
   },
   {
      "team_name":"rocket"
   },
   {
      "team_name":"SupeRanky"
   },
   {
      "team_name":"Pitchoune & Jérôminette"
   },
   {
      "team_name":"xiaoxin"
   },
   {
      "team_name":"Outspoken Media"
   },
   {
      "team_name":"yangko"
   },
   {
      "team_name":"research - chat bots"
   },
   {
      "team_name":"SD Fin Control"
   },
   {
      "team_name":"Done Deal"
   },
   {
      "team_name":"NTG"
   },
   {
      "team_name":"The Addams Family"
   },
   {
      "team_name":"Bot User Research"
   },
   {
      "team_name":"botuserresearch2"
   },
   {
      "team_name":"Special Projects"
   },
   {
      "team_name":"Pierce Washington"
   },
   {
      "team_name":"ABT Solutions"
   },
   {
      "team_name":"Furious 8"
   },
   {
      "team_name":"Mario"
   },
   {
      "team_name":"codechemistry"
   },
   {
      "team_name":"Dynamo PR"
   },
   {
      "team_name":"Squarehead Technology"
   },
   {
      "team_name":"Slackers at 476"
   },
   {
      "team_name":"Peninsula Temple Sholom"
   },
   {
      "team_name":"UMD SUAS"
   },
   {
      "team_name":"photobooth"
   },
   {
      "team_name":"Summit"
   },
   {
      "team_name":"Freetime Hospitality B.V."
   },
   {
      "team_name":"BC"
   },
   {
      "team_name":"Yala"
   },
   {
      "team_name":"Dinamo"
   },
   {
      "team_name":"Spec Brand"
   },
   {
      "team_name":"exceptional-code"
   },
   {
      "team_name":"Colorado Product Services"
   },
   {
      "team_name":"LKKHPG DI - Innovation Lab"
   },
   {
      "team_name":"Djenee"
   },
   {
      "team_name":"Cre8ive Business"
   },
   {
      "team_name":"bottokyo"
   },
   {
      "team_name":"ZuPi Düsseldorf"
   },
   {
      "team_name":"Loot Crate"
   },
   {
      "team_name":"NYDN"
   },
   {
      "team_name":"Jamly"
   },
   {
      "team_name":"Consequence"
   },
   {
      "team_name":"SyncUpLabs"
   },
   {
      "team_name":"Baycall"
   },
   {
      "team_name":"tomozo"
   },
   {
      "team_name":"Product"
   },
   {
      "team_name":"chloekwon"
   },
   {
      "team_name":"Bera-Tek Slack"
   },
   {
      "team_name":"398438942934"
   },
   {
      "team_name":"bauerhour"
   },
   {
      "team_name":"EXO-ARM"
   },
   {
      "team_name":"35cm"
   },
   {
      "team_name":"huit-iam"
   },
   {
      "team_name":"PKO"
   },
   {
      "team_name":"source{d}"
   },
   {
      "team_name":"InPos Soft"
   },
   {
      "team_name":"Early Days"
   },
   {
      "team_name":"Cobb Superior Court"
   },
   {
      "team_name":"ITINERIS"
   },
   {
      "team_name":"KindHealth"
   },
   {
      "team_name":"TouchPoint Travel"
   },
   {
      "team_name":"MakerBot"
   },
   {
      "team_name":"Network Nerds"
   },
   {
      "team_name":"Beachfront Only"
   },
   {
      "team_name":"technologiclee"
   },
   {
      "team_name":"hahahahahaha"
   },
   {
      "team_name":"Luke Bots"
   },
   {
      "team_name":"Metodo"
   },
   {
      "team_name":"brograms"
   },
   {
      "team_name":"Leo Burnett London"
   },
   {
      "team_name":"IttyBot"
   },
   {
      "team_name":"Jam"
   },
   {
      "team_name":"IdeaHackers.nl"
   },
   {
      "team_name":"asdfasdfsdfdf"
   },
   {
      "team_name":"Myntra"
   },
   {
      "team_name":"oknewthing"
   },
   {
      "team_name":"me"
   },
   {
      "team_name":"Acumen Creative"
   },
   {
      "team_name":"newfutile"
   },
   {
      "team_name":"Skelter and all"
   },
   {
      "team_name":"Nossa Growth"
   },
   {
      "team_name":"Bot Bureau"
   },
   {
      "team_name":"Stup Sistemas"
   },
   {
      "team_name":"bci-slack"
   },
   {
      "team_name":"TGT Labs"
   },
   {
      "team_name":"timebot"
   },
   {
      "team_name":"Andynebs"
   },
   {
      "team_name":"nlnl"
   },
   {
      "team_name":"sandbox"
   },
   {
      "team_name":"Infinitum Deo"
   },
   {
      "team_name":"Tesco Labs Bengaluru"
   },
   {
      "team_name":"tester111"
   },
   {
      "team_name":"TeamHaribo"
   },
   {
      "team_name":"ProudFolio"
   },
   {
      "team_name":"Crossbeat"
   },
   {
      "team_name":"hanaber"
   },
   {
      "team_name":"Tether"
   },
   {
      "team_name":"CZ Art Department"
   },
   {
      "team_name":"MontanaPBS Producers"
   },
   {
      "team_name":"JBi Digital"
   },
   {
      "team_name":"Bapply"
   },
   {
      "team_name":"Little Letter"
   },
   {
      "team_name":"teuscher"
   },
   {
      "team_name":"Mnpco"
   },
   {
      "team_name":"Bonanza"
   },
   {
      "team_name":"Scratch"
   },
   {
      "team_name":"Larvol"
   },
   {
      "team_name":"TWSitecheckQA"
   },
   {
      "team_name":"rally.ai"
   },
   {
      "team_name":"Nerd Fort"
   },
   {
      "team_name":"NotYetFound"
   },
   {
      "team_name":"SATOS"
   },
   {
      "team_name":"asdfaddddd"
   },
   {
      "team_name":"Gary Thompson Consulting"
   },
   {
      "team_name":"kato.ai"
   },
   {
      "team_name":"PazziPatri"
   },
   {
      "team_name":"Matias"
   },
   {
      "team_name":"Rocket Ship"
   },
   {
      "team_name":"Matz Radloff"
   },
   {
      "team_name":"asdf"
   },
   {
      "team_name":"Plankton Apps"
   },
   {
      "team_name":"GUXOptimization"
   },
   {
      "team_name":"Disruption"
   },
   {
      "team_name":"leachandfriends"
   },
   {
      "team_name":"asdfsadfd"
   },
   {
      "team_name":"Family"
   },
   {
      "team_name":"Astrsk"
   },
   {
      "team_name":"Beard_and_Legs"
   },
   {
      "team_name":".:. wo wuensche wahr werden .:."
   },
   {
      "team_name":"NoiseContents"
   },
   {
      "team_name":"botusertest4"
   },
   {
      "team_name":"Secretgarden"
   },
   {
      "team_name":"Bobby Jo Industries"
   },
   {
      "team_name":"Tiket.com"
   },
   {
      "team_name":"Little Rocket"
   },
   {
      "team_name":"Promact"
   },
   {
      "team_name":"Inkstone"
   },
   {
      "team_name":"Breadcrumb Studios"
   },
   {
      "team_name":"Sense.ly"
   },
   {
      "team_name":"CDP North America"
   },
   {
      "team_name":"TroysTestSlackRoom"
   },
   {
      "team_name":"T4MEDIA."
   },
   {
      "team_name":"myeongseong.kim"
   },
   {
      "team_name":"Bomzy Apps"
   },
   {
      "team_name":"TEAM APRIL"
   },
   {
      "team_name":"ClikHome"
   },
   {
      "team_name":"AMS"
   },
   {
      "team_name":"Choice"
   },
   {
      "team_name":"Semaev"
   },
   {
      "team_name":"tvfm"
   },
   {
      "team_name":"YOUMADEMEBETTER"
   },
   {
      "team_name":"wildworld"
   },
   {
      "team_name":"VBProOpus"
   },
   {
      "team_name":"FinBot"
   },
   {
      "team_name":"Antoine OpenData"
   },
   {
      "team_name":"K+A | Wedding"
   },
   {
      "team_name":"CoworkBuffalo"
   },
   {
      "team_name":"Copernicus Digital"
   },
   {
      "team_name":"CSA"
   },
   {
      "team_name":"Kentix Development"
   },
   {
      "team_name":"Thomas Kok"
   },
   {
      "team_name":"3months"
   },
   {
      "team_name":"The Bunnies"
   },
   {
      "team_name":"Techs In Lex"
   },
   {
      "team_name":"ITsyndicate"
   },
   {
      "team_name":"The Tunstall Organization, Inc."
   },
   {
      "team_name":"Pressly"
   },
   {
      "team_name":"CareerLarkDemo"
   },
   {
      "team_name":"TECKpert"
   },
   {
      "team_name":"foxsofter"
   },
   {
      "team_name":"nyala"
   },
   {
      "team_name":"ttr"
   },
   {
      "team_name":"Actility"
   },
   {
      "team_name":"Build Hyperloop UC"
   },
   {
      "team_name":"Massvector"
   },
   {
      "team_name":"Action Item Sales"
   },
   {
      "team_name":"Laughlin Constable"
   },
   {
      "team_name":"RIKAI"
   },
   {
      "team_name":"Mastodons"
   },
   {
      "team_name":"Charlie"
   },
   {
      "team_name":"Scarab Research"
   },
   {
      "team_name":"Zakir"
   },
   {
      "team_name":"eivind"
   },
   {
      "team_name":"internationalhardware"
   },
   {
      "team_name":"Test"
   },
   {
      "team_name":"Pinnaka"
   },
   {
      "team_name":"SendX"
   },
   {
      "team_name":"CodeClanAlumni"
   },
   {
      "team_name":"Fluxx"
   },
   {
      "team_name":"Roxane"
   },
   {
      "team_name":"Founding Team"
   },
   {
      "team_name":"MailTime"
   },
   {
      "team_name":"vp-assistant"
   },
   {
      "team_name":"imperson"
   },
   {
      "team_name":"Swig Labs"
   },
   {
      "team_name":"Upnext"
   },
   {
      "team_name":"Bibbi"
   },
   {
      "team_name":"Actionably"
   },
   {
      "team_name":"Bamboo Creative"
   },
   {
      "team_name":"robomedia inc"
   },
   {
      "team_name":"Andela"
   },
   {
      "team_name":"Personal"
   },
   {
      "team_name":"Brand Ambassador"
   },
   {
      "team_name":"dolinin"
   },
   {
      "team_name":"Bat Inc"
   },
   {
      "team_name":"InMobi"
   },
   {
      "team_name":"interactivecats.com"
   },
   {
      "team_name":"Team Awesome"
   },
   {
      "team_name":"Autonet Mobile, Inc."
   },
   {
      "team_name":"Precursor Labs"
   },
   {
      "team_name":"myMave"
   },
   {
      "team_name":"MediaTrendz"
   },
   {
      "team_name":"Witty Mitty"
   },
   {
      "team_name":"Northstar Recycling"
   },
   {
      "team_name":"Mothership"
   },
   {
      "team_name":"Element Analytics"
   },
   {
      "team_name":"Kre8Now"
   },
   {
      "team_name":"LW"
   },
   {
      "team_name":"Clinical Directorate"
   },
   {
      "team_name":"Dreams Enterprise Holdings"
   },
   {
      "team_name":"Berrymetrics"
   },
   {
      "team_name":"Webcom Networks"
   },
   {
      "team_name":"bw-assistant"
   },
   {
      "team_name":"OASIS 2016-2017"
   },
   {
      "team_name":"Pita Bread"
   },
   {
      "team_name":"cwtaiwan"
   },
   {
      "team_name":"Mobile Bridge"
   },
   {
      "team_name":"USVNetwork"
   },
   {
      "team_name":"Savil.Me Team"
   },
   {
      "team_name":"Lyconet Team 8.8"
   },
   {
      "team_name":"Kingdon"
   },
   {
      "team_name":"Team WIWO"
   },
   {
      "team_name":"Sprink"
   },
   {
      "team_name":"JOB TODAY"
   },
   {
      "team_name":"Comal County Habitat for Humanity"
   },
   {
      "team_name":"christopherhamm"
   },
   {
      "team_name":"Igloo"
   },
   {
      "team_name":"Quakk Studios"
   },
   {
      "team_name":"Application.ai"
   },
   {
      "team_name":"Manasianandco Dev"
   },
   {
      "team_name":"The Daily Dot"
   },
   {
      "team_name":"NPJK"
   },
   {
      "team_name":"Brighty"
   },
   {
      "team_name":"Marshlands"
   },
   {
      "team_name":"design"
   },
   {
      "team_name":"perkure"
   },
   {
      "team_name":"sweethome"
   },
   {
      "team_name":"end"
   },
   {
      "team_name":"Putler Family"
   },
   {
      "team_name":"HLS Communications"
   },
   {
      "team_name":"Overmorrow"
   },
   {
      "team_name":"Vivax"
   },
   {
      "team_name":"Decent Sized Mini Fridge"
   },
   {
      "team_name":"jerky"
   },
   {
      "team_name":"The Christies"
   },
   {
      "team_name":"Admins Rule the World"
   },
   {
      "team_name":"Mentor"
   },
   {
      "team_name":"WIRED"
   },
   {
      "team_name":"Healthful Communication"
   },
   {
      "team_name":"testing"
   },
   {
      "team_name":"sensity"
   },
   {
      "team_name":"AR Suite"
   },
   {
      "team_name":"10x10"
   },
   {
      "team_name":"Awesome Team"
   },
   {
      "team_name":"Caliber"
   },
   {
      "team_name":"8tracks"
   },
   {
      "team_name":"kip"
   },
   {
      "team_name":"AlphaBot"
   },
   {
      "team_name":"mobilized"
   },
   {
      "team_name":"Black Ops"
   },
   {
      "team_name":"VincentCecelia"
   },
   {
      "team_name":"MrK Team"
   },
   {
      "team_name":"rewardz"
   },
   {
      "team_name":"Salads UP"
   },
   {
      "team_name":"MIINIEME"
   },
   {
      "team_name":"DangerSlack"
   },
   {
      "team_name":"Optinity"
   },
   {
      "team_name":"ixd ncad"
   },
   {
      "team_name":"Negelmann"
   },
   {
      "team_name":"SING"
   },
   {
      "team_name":"Contobox"
   },
   {
      "team_name":"Catseye USA"
   },
   {
      "team_name":"Mineral"
   },
   {
      "team_name":"Encompass Accounting, Inc."
   },
   {
      "team_name":"DoradoFinancial"
   },
   {
      "team_name":"Fit To Tweet"
   },
   {
      "team_name":"WK UX"
   },
   {
      "team_name":"hr_bottest"
   },
   {
      "team_name":"Miami College of Design"
   },
   {
      "team_name":"Create, Inc"
   },
   {
      "team_name":"Workflow"
   },
   {
      "team_name":"pia501"
   },
   {
      "team_name":"Assist"
   },
   {
      "team_name":"Nyaa-Nyaa"
   },
   {
      "team_name":"Camp Sequoia Lake"
   },
   {
      "team_name":"Wade & Wendy"
   },
   {
      "team_name":"Drunkfish"
   },
   {
      "team_name":"Insight"
   },
   {
      "team_name":"Frienket"
   },
   {
      "team_name":"not marie"
   },
   {
      "team_name":"Overscore"
   },
   {
      "team_name":"Geofox.org"
   },
   {
      "team_name":"cinnatest"
   },
   {
      "team_name":"sortedinc"
   },
   {
      "team_name":"Jason"
   },
   {
      "team_name":"The Tech Team"
   },
   {
      "team_name":"School on Wheels"
   },
   {
      "team_name":"Bot Testing Area"
   },
   {
      "team_name":"BOOM"
   },
   {
      "team_name":"Ekodaily"
   },
   {
      "team_name":"Apptension"
   },
   {
      "team_name":"FOE 4385"
   },
   {
      "team_name":"DevConsultores"
   },
   {
      "team_name":"uwsl"
   },
   {
      "team_name":"INK"
   },
   {
      "team_name":"High Prairie Produce"
   },
   {
      "team_name":"Viewstream"
   },
   {
      "team_name":"S-LAB"
   },
   {
      "team_name":"Clickky Family"
   },
   {
      "team_name":"TinkerMill"
   },
   {
      "team_name":"Butter"
   },
   {
      "team_name":"usmaks-test"
   },
   {
      "team_name":"themeskingdom"
   },
   {
      "team_name":"Soccer"
   },
   {
      "team_name":"HiringCatalyst"
   },
   {
      "team_name":"MayaHouse"
   },
   {
      "team_name":"spaCy"
   },
   {
      "team_name":"Conversable"
   },
   {
      "team_name":"lynda"
   },
   {
      "team_name":"WebFap"
   },
   {
      "team_name":"Danny's Bot Tester"
   },
   {
      "team_name":"HipHopHeads"
   },
   {
      "team_name":"PO"
   },
   {
      "team_name":"きびだんご"
   },
   {
      "team_name":"Sardo.io"
   },
   {
      "team_name":"Pikazo"
   },
   {
      "team_name":"2vive"
   },
   {
      "team_name":"Stitch Fix"
   },
   {
      "team_name":"Yann Schmidt - Artist"
   },
   {
      "team_name":"Vidzy.io"
   },
   {
      "team_name":"LiveSport Programme Team"
   },
   {
      "team_name":"Bond Street"
   },
   {
      "team_name":"larpersunited"
   },
   {
      "team_name":"aptotec"
   },
   {
      "team_name":"RedWork"
   },
   {
      "team_name":"Aldertrack"
   },
   {
      "team_name":"Madhouse"
   },
   {
      "team_name":"SLIC"
   },
   {
      "team_name":"Aoi clinic"
   },
   {
      "team_name":"SUAS Practice"
   },
   {
      "team_name":"The Doosans"
   },
   {
      "team_name":"USC Provost Development"
   },
   {
      "team_name":"El Centro"
   },
   {
      "team_name":"ren"
   },
   {
      "team_name":"2Shopper"
   },
   {
      "team_name":"MeMilee"
   },
   {
      "team_name":"Team Reni"
   },
   {
      "team_name":"GSOC2016 Emory BMI"
   },
   {
      "team_name":"Smackback"
   },
   {
      "team_name":"The Wagnons"
   },
   {
      "team_name":"Operator"
   },
   {
      "team_name":"Zzxzz"
   },
   {
      "team_name":"Protorisk"
   },
   {
      "team_name":"Shoppe AI"
   },
   {
      "team_name":"ElectionLab"
   },
   {
      "team_name":"MTE"
   },
   {
      "team_name":"Lutrovnik"
   },
   {
      "team_name":"Beans 2 Brew"
   },
   {
      "team_name":"TheInnerRevolution.Org"
   },
   {
      "team_name":"b8ta"
   },
   {
      "team_name":"Dando Team"
   },
   {
      "team_name":"abu"
   },
   {
      "team_name":"AGi3"
   },
   {
      "team_name":"intellibot"
   },
   {
      "team_name":"nowlabs"
   },
   {
      "team_name":"asdfasdfasdfasdf"
   },
   {
      "team_name":"algolab"
   },
   {
      "team_name":"botusertest3"
   },
   {
      "team_name":"genie"
   },
   {
      "team_name":"ACE"
   },
   {
      "team_name":"Nikhil's Solr"
   },
   {
      "team_name":"Rooftop Films"
   },
   {
      "team_name":"KSNY Tech"
   },
   {
      "team_name":"Nurture Learn"
   },
   {
      "team_name":"Design 4 Sports"
   },
   {
      "team_name":"Dwarves Foundation"
   },
   {
      "team_name":"launchagency"
   },
   {
      "team_name":"L&C"
   },
   {
      "team_name":"Spectiv"
   },
   {
      "team_name":"All Make Believe LLC"
   },
   {
      "team_name":"Tito's Playroom"
   },
   {
      "team_name":"Movement Strategy Center - Innovation Hub"
   },
   {
      "team_name":"Intré"
   },
   {
      "team_name":"Namlik"
   },
   {
      "team_name":"bsh"
   },
   {
      "team_name":"Huddle Creative"
   },
   {
      "team_name":"Simply Fcc"
   },
   {
      "team_name":"Roostlings"
   },
   {
      "team_name":"CouponFollow"
   },
   {
      "team_name":"matchwerk"
   },
   {
      "team_name":"cool-people"
   },
   {
      "team_name":"Schlesi"
   },
   {
      "team_name":"bm"
   },
   {
      "team_name":"csdu innodev"
   },
   {
      "team_name":"alper"
   },
   {
      "team_name":"Odeh Engineers"
   },
   {
      "team_name":"elmenyakademia"
   },
   {
      "team_name":"BEZIB"
   },
   {
      "team_name":"Weiapp"
   },
   {
      "team_name":"BevyUp"
   },
   {
      "team_name":"Simply Color"
   },
   {
      "team_name":"labs community"
   },
   {
      "team_name":"Larvol Personal"
   },
   {
      "team_name":"Rocky Run After School Staff"
   },
   {
      "team_name":"Alza Mobile"
   },
   {
      "team_name":"AuthX"
   },
   {
      "team_name":"Atul-team"
   },
   {
      "team_name":"Altocloud"
   },
   {
      "team_name":"Fun 2.0"
   },
   {
      "team_name":"Odin"
   },
   {
      "team_name":"Clown Room"
   },
   {
      "team_name":"Western States Widget Distribution"
   },
   {
      "team_name":"Any.do"
   },
   {
      "team_name":"lieber inc"
   },
   {
      "team_name":"AskVoila"
   },
   {
      "team_name":"Math Apollo"
   },
   {
      "team_name":"PMO Research"
   },
   {
      "team_name":"ix-showcase"
   },
   {
      "team_name":"4ip"
   },
   {
      "team_name":"botlytics"
   },
   {
      "team_name":"fritealors"
   },
   {
      "team_name":"xpressbuy"
   },
   {
      "team_name":"sumiryo"
   },
   {
      "team_name":"Corporate Orphans"
   },
   {
      "team_name":"Jifiti"
   },
   {
      "team_name":"TriTechathon"
   },
   {
      "team_name":"iwtest"
   },
   {
      "team_name":"wrong"
   },
   {
      "team_name":"Gung Ho"
   },
   {
      "team_name":"Student Life"
   },
   {
      "team_name":"Heitek"
   },
   {
      "team_name":"puisi"
   },
   {
      "team_name":"tulisan"
   },
   {
      "team_name":"theapp"
   },
   {
      "team_name":"Athlete 2.0"
   },
   {
      "team_name":"JamongLab"
   },
   {
      "team_name":"opentask"
   },
   {
      "team_name":"selapis"
   },
   {
      "team_name":"Savoir-Faire"
   },
   {
      "team_name":"Hoodrat Thaangs"
   },
   {
      "team_name":"finco"
   },
   {
      "team_name":"Broadened Horizons"
   },
   {
      "team_name":"kiamat"
   },
   {
      "team_name":"kicap"
   },
   {
      "team_name":"Axon System Development"
   },
   {
      "team_name":"Areté, Inc."
   },
   {
      "team_name":"asdasdfasdfdsf"
   },
   {
      "team_name":"Biola Financial Aid"
   },
   {
      "team_name":"Gromar"
   },
   {
      "team_name":"SimplexIT"
   },
   {
      "team_name":"HeartBank®"
   },
   {
      "team_name":"crystalline"
   },
   {
      "team_name":"TSNYC Summer 2016"
   },
   {
      "team_name":"Epicbloke Corp."
   },
   {
      "team_name":"Become JP"
   },
   {
      "team_name":"gelap"
   },
   {
      "team_name":"Buffered VPN"
   },
   {
      "team_name":"Sirkil"
   },
   {
      "team_name":"Treelane"
   },
   {
      "team_name":"geekpub"
   },
   {
      "team_name":"Behavior Analyst Certification Board"
   },
   {
      "team_name":"Damascus-HQ"
   },
   {
      "team_name":"BadgerLoop"
   },
   {
      "team_name":"privat"
   },
   {
      "team_name":"Welker Mojsej & DelVecchio CPAs, LLC"
   },
   {
      "team_name":"Ice Cream Dreams FBA"
   },
   {
      "team_name":"semalam"
   },
   {
      "team_name":"Xignite"
   },
   {
      "team_name":"tonidy"
   },
   {
      "team_name":"moneyinmotion"
   },
   {
      "team_name":"GoodHouse"
   },
   {
      "team_name":"biadab"
   },
   {
      "team_name":"Distorted-Dimensions"
   },
   {
      "team_name":"Popular Pays"
   },
   {
      "team_name":"Oyez"
   },
   {
      "team_name":"Optoro"
   },
   {
      "team_name":"ChinFamily"
   },
   {
      "team_name":"rouen-ai-lab"
   },
   {
      "team_name":"KnowledgeTree"
   },
   {
      "team_name":"asas"
   },
   {
      "team_name":"kuehlapis"
   },
   {
      "team_name":"island"
   },
   {
      "team_name":"Team Tribeca"
   },
   {
      "team_name":"IPS.SI"
   },
   {
      "team_name":"Explorate"
   },
   {
      "team_name":"beacon89"
   },
   {
      "team_name":"Guru"
   },
   {
      "team_name":"membuat"
   },
   {
      "team_name":"eContext"
   },
   {
      "team_name":"Photosinmanila"
   },
   {
      "team_name":"UserVoice"
   },
   {
      "team_name":"Ava"
   },
   {
      "team_name":"Connatix"
   },
   {
      "team_name":"NCSS"
   },
   {
      "team_name":"brycen-bs"
   },
   {
      "team_name":"sengsara"
   },
   {
      "team_name":"Cymbio"
   },
   {
      "team_name":"skilltrade"
   },
   {
      "team_name":"Mahale Labs"
   },
   {
      "team_name":"ejaan"
   },
   {
      "team_name":"CenterPoint Media"
   },
   {
      "team_name":"O'Reilly Bots"
   },
   {
      "team_name":"theasylum"
   },
   {
      "team_name":"omnimosouq"
   },
   {
      "team_name":"Estoppel"
   },
   {
      "team_name":"bebas"
   },
   {
      "team_name":"SvenTinyTeam"
   },
   {
      "team_name":"BluTonk Ambassadors"
   },
   {
      "team_name":"Kip"
   },
   {
      "team_name":"sejarah"
   },
   {
      "team_name":"Olymptrade.com"
   },
   {
      "team_name":"Venmetro"
   },
   {
      "team_name":"optimisma"
   },
   {
      "team_name":"Dollarbuddy"
   },
   {
      "team_name":"Kulkarni"
   },
   {
      "team_name":"antisugar"
   },
   {
      "team_name":"ducray"
   },
   {
      "team_name":"Jinx"
   },
   {
      "team_name":"iaCONSULTING"
   },
   {
      "team_name":"snap40"
   },
   {
      "team_name":"Yuki"
   },
   {
      "team_name":"Haber Group"
   },
   {
      "team_name":"empat"
   },
   {
      "team_name":"Double Chocolate Muffin"
   },
   {
      "team_name":"Chiruvolu"
   },
   {
      "team_name":"GSC Leadership team"
   },
   {
      "team_name":"JainFamily"
   },
   {
      "team_name":"Pluto VR"
   },
   {
      "team_name":"Progress Informática"
   },
   {
      "team_name":"malam"
   },
   {
      "team_name":"budiman"
   },
   {
      "team_name":"zu Mobile Marketing"
   },
   {
      "team_name":"Methodics"
   },
   {
      "team_name":"1000leads"
   },
   {
      "team_name":"Mercury 7"
   },
   {
      "team_name":"SveaXWing"
   },
   {
      "team_name":"hidup"
   },
   {
      "team_name":"dukece"
   },
   {
      "team_name":"membuatjalan"
   },
   {
      "team_name":"donedone"
   },
   {
      "team_name":"gckip"
   },
   {
      "team_name":"Otto"
   },
   {
      "team_name":"BOSS News Network"
   },
   {
      "team_name":"IndieFit"
   },
   {
      "team_name":"Silicon Pauli"
   },
   {
      "team_name":"nvshakenbake"
   },
   {
      "team_name":"membaca"
   },
   {
      "team_name":"IT Service Desk"
   },
   {
      "team_name":"Schultz Financial Services"
   },
   {
      "team_name":"Leaf Space"
   },
   {
      "team_name":"Thinreed.com"
   },
   {
      "team_name":"tryout"
   },
   {
      "team_name":"HaggleCity"
   },
   {
      "team_name":"Menninger"
   },
   {
      "team_name":"menulis"
   },
   {
      "team_name":"Utopia Planitia Ltd."
   },
   {
      "team_name":"Radiance Labs"
   },
   {
      "team_name":"ACE"
   },
   {
      "team_name":"G-8 Fontánez-Rod House Tasks"
   },
   {
      "team_name":"bigcom"
   },
   {
      "team_name":"Cross Cultural Solutions"
   },
   {
      "team_name":"SMC Engineering"
   },
   {
      "team_name":"MeMyself&I"
   },
   {
      "team_name":"Hiremath"
   },
   {
      "team_name":"Gartner Innovation Center"
   },
   {
      "team_name":"Fishkin"
   },
   {
      "team_name":"simplecrmsystem"
   },
   {
      "team_name":"inamoto"
   },
   {
      "team_name":"Hedgehog Collective"
   },
   {
      "team_name":"Jay Ammon's Slack"
   },
   {
      "team_name":"spotzls"
   },
   {
      "team_name":"Message.io"
   },
   {
      "team_name":"lesson tube"
   },
   {
      "team_name":"Mustache Cloud"
   },
   {
      "team_name":"Owens Goat Farm"
   },
   {
      "team_name":"Stock Realingment"
   },
   {
      "team_name":"Toronto Apache Spark"
   },
   {
      "team_name":"Zemobile"
   },
   {
      "team_name":"Zivver"
   },
   {
      "team_name":"Chioh"
   },
   {
      "team_name":"BrandsnBots"
   },
   {
      "team_name":"membuka"
   },
   {
      "team_name":"ikan"
   },
   {
      "team_name":"3S GmbH & Co. KG"
   },
   {
      "team_name":"myki"
   },
   {
      "team_name":"MedMyne"
   },
   {
      "team_name":"westrings"
   },
   {
      "team_name":"HelloTech"
   },
   {
      "team_name":"IBO"
   },
   {
      "team_name":"T3 Advisors SF"
   },
   {
      "team_name":"Tsu4tsu"
   },
   {
      "team_name":"Crossroads"
   },
   {
      "team_name":"247-inc"
   },
   {
      "team_name":"lampu"
   },
   {
      "team_name":"cubyn"
   },
   {
      "team_name":"planetcantabile"
   },
   {
      "team_name":"masakmasak"
   },
   {
      "team_name":"KokonakSlack"
   },
   {
      "team_name":"inventstack"
   },
   {
      "team_name":"Wise Mobile"
   },
   {
      "team_name":"glass"
   },
   {
      "team_name":"Global Sporting Safaris"
   },
   {
      "team_name":"Billers"
   },
   {
      "team_name":"BSTY - STL"
   },
   {
      "team_name":"FRC 5254: Robot Raiders"
   },
   {
      "team_name":"The Strategy Group"
   },
   {
      "team_name":"placeholder4"
   },
   {
      "team_name":"sous-vide-fans"
   },
   {
      "team_name":"berjalan"
   },
   {
      "team_name":"ETM"
   },
   {
      "team_name":"minimalism"
   },
   {
      "team_name":"TKJAE"
   },
   {
      "team_name":"Nimblestack"
   },
   {
      "team_name":"rumakerspace"
   },
   {
      "team_name":"thesadlers"
   },
   {
      "team_name":"Second Story Auctions"
   },
   {
      "team_name":"SAMPLR"
   },
   {
      "team_name":"BrewIT"
   },
   {
      "team_name":"edu.ai"
   },
   {
      "team_name":"Aficionado"
   },
   {
      "team_name":"Mixcel"
   },
   {
      "team_name":"berbudi"
   },
   {
      "team_name":"Founders"
   },
   {
      "team_name":"GMD Innovacion"
   },
   {
      "team_name":"Devops"
   },
   {
      "team_name":"penjara"
   },
   {
      "team_name":"paperworkStudio"
   },
   {
      "team_name":"team_b"
   },
   {
      "team_name":"Avans"
   },
   {
      "team_name":"dsz.io"
   },
   {
      "team_name":"liateR"
   },
   {
      "team_name":"Foot Cardigan"
   },
   {
      "team_name":"Minecraft Meetup"
   },
   {
      "team_name":"TunnelAiDemo"
   },
   {
      "team_name":"outift"
   },
   {
      "team_name":"Steiner541"
   },
   {
      "team_name":"Pentaho Waltham"
   },
   {
      "team_name":"firecracker"
   },
   {
      "team_name":"sosej"
   },
   {
      "team_name":"Vely"
   },
   {
      "team_name":"joget"
   },
   {
      "team_name":"Pythias"
   },
   {
      "team_name":"Black Ink Business Services"
   },
   {
      "team_name":"Omar Inc."
   },
   {
      "team_name":"Omega Digital Press"
   },
   {
      "team_name":"gogolith"
   },
   {
      "team_name":"club capybara"
   },
   {
      "team_name":"Olivier Spiczak"
   },
   {
      "team_name":"ntbh"
   },
   {
      "team_name":"solongo"
   },
   {
      "team_name":"CCBC-Internal"
   },
   {
      "team_name":"buku"
   },
   {
      "team_name":"Our secret collabotation"
   },
   {
      "team_name":"Invento"
   },
   {
      "team_name":"skp_techhr"
   },
   {
      "team_name":"CF Superheroes"
   },
   {
      "team_name":"Avengers"
   },
   {
      "team_name":"Coconut Palms Resort"
   },
   {
      "team_name":"WECoffeeCo"
   },
   {
      "team_name":"MI Playground"
   },
   {
      "team_name":"B-Open"
   },
   {
      "team_name":"Gwave.acme"
   },
   {
      "team_name":"Farset Labs"
   },
   {
      "team_name":"Guayaquil Brewing Co."
   },
   {
      "team_name":"chaosfam"
   },
   {
      "team_name":"Korralie"
   },
   {
      "team_name":"kupukupu"
   },
   {
      "team_name":"Auro R&D"
   },
   {
      "team_name":"Botler"
   },
   {
      "team_name":"TeamName"
   },
   {
      "team_name":"DB mojo!"
   },
   {
      "team_name":"ASTRA"
   },
   {
      "team_name":"Madison Marketing Group"
   },
   {
      "team_name":"Rent Jungle"
   },
   {
      "team_name":"Logicdrop"
   },
   {
      "team_name":"Odisseias"
   },
   {
      "team_name":"hellogrip"
   },
   {
      "team_name":"berkongsi"
   },
   {
      "team_name":"Portal"
   },
   {
      "team_name":"Elastique"
   },
   {
      "team_name":"arular"
   },
   {
      "team_name":"R/A for Newell"
   },
   {
      "team_name":"Snack comes around, goes around"
   },
   {
      "team_name":"QMO Johnson"
   },
   {
      "team_name":"Billy"
   },
   {
      "team_name":"bby-comm"
   },
   {
      "team_name":"snowflake"
   },
   {
      "team_name":"DEAN"
   },
   {
      "team_name":"azurebunnies"
   },
   {
      "team_name":"NutsAreOk"
   },
   {
      "team_name":"FleekElite"
   },
   {
      "team_name":"New City Kids"
   },
   {
      "team_name":"Primisys Team"
   },
   {
      "team_name":"LMS Inc."
   },
   {
      "team_name":"Autobots"
   },
   {
      "team_name":"Test Team"
   },
   {
      "team_name":"Nomadic Foundry"
   },
   {
      "team_name":"Real Digital Solutions Corporation"
   },
   {
      "team_name":"Home"
   },
   {
      "team_name":"balasan"
   },
   {
      "team_name":"TELL"
   },
   {
      "team_name":"cbae staff 16-17"
   },
   {
      "team_name":"hjkook"
   },
   {
      "team_name":"pasar"
   },
   {
      "team_name":"Char+Yao"
   },
   {
      "team_name":"kaalchakra"
   },
   {
      "team_name":"marcos"
   },
   {
      "team_name":"SetListRu"
   },
   {
      "team_name":"PlusPlus"
   },
   {
      "team_name":"apeshart"
   },
   {
      "team_name":"ceechange"
   },
   {
      "team_name":"Safe Network Solutions"
   },
   {
      "team_name":"devhub"
   },
   {
      "team_name":"Ladenseite"
   },
   {
      "team_name":"Strikepoint Media"
   },
   {
      "team_name":"Myra Labs"
   },
   {
      "team_name":"SlugBay Community"
   },
   {
      "team_name":"AddStructure"
   },
   {
      "team_name":"RIT ESPORTS"
   },
   {
      "team_name":"Voxable"
   },
   {
      "team_name":"Ontology"
   },
   {
      "team_name":"Kova Digital"
   },
   {
      "team_name":"ABEAI"
   },
   {
      "team_name":"Mio"
   },
   {
      "team_name":"ZBT"
   },
   {
      "team_name":"honestbee"
   },
   {
      "team_name":"Purdue SIGBots"
   },
   {
      "team_name":"Writer Shack"
   },
   {
      "team_name":"Pro Digitizing"
   },
   {
      "team_name":"Atha"
   },
   {
      "team_name":"Eco Ventures"
   },
   {
      "team_name":"Lighthouse Staff"
   },
   {
      "team_name":"R&D海賊団"
   },
   {
      "team_name":"Brand Desk"
   },
   {
      "team_name":"MALVI"
   },
   {
      "team_name":"Haganellas"
   },
   {
      "team_name":"Gao's academy"
   },
   {
      "team_name":"Tim"
   },
   {
      "team_name":"me"
   },
   {
      "team_name":"Up and Away"
   },
   {
      "team_name":"retailwhizz"
   },
   {
      "team_name":"adolfsson"
   },
   {
      "team_name":"Team Cognitive"
   },
   {
      "team_name":"Khirod"
   },
   {
      "team_name":"Saben"
   },
   {
      "team_name":"Foxglovebeauty"
   },
   {
      "team_name":"Operation OutsideTheBox"
   },
   {
      "team_name":"Kidzplay"
   },
   {
      "team_name":"SIPI Corporate"
   },
   {
      "team_name":"Custos"
   },
   {
      "team_name":"Keyman Charlestown"
   },
   {
      "team_name":"BunchofSlackers"
   },
   {
      "team_name":"Kinwie"
   },
   {
      "team_name":"Sure"
   },
   {
      "team_name":"RPG"
   },
   {
      "team_name":"Social TuSI"
   },
   {
      "team_name":"ebay-eng"
   },
   {
      "team_name":"bremer"
   },
   {
      "team_name":"CDIT"
   },
   {
      "team_name":"Scibler"
   },
   {
      "team_name":"tutk_study"
   },
   {
      "team_name":"CynergisTek"
   },
   {
      "team_name":"storets"
   },
   {
      "team_name":"Twnel Team"
   },
   {
      "team_name":"viajes360"
   },
   {
      "team_name":"The homies"
   },
   {
      "team_name":"Gauge Interactive"
   },
   {
      "team_name":"RoadM8"
   },
   {
      "team_name":"Cently"
   },
   {
      "team_name":"The Squad"
   },
   {
      "team_name":"G5"
   },
   {
      "team_name":"VidaCare"
   },
   {
      "team_name":"The Nest on 37th"
   },
   {
      "team_name":"Multimedia Interactive"
   },
   {
      "team_name":"Bob's Team"
   },
   {
      "team_name":"SwolePatrol"
   },
   {
      "team_name":"Yowgii"
   },
   {
      "team_name":"GDA Speakers"
   },
   {
      "team_name":"Junk"
   },
   {
      "team_name":"superawesomeee"
   },
   {
      "team_name":"DOSE"
   },
   {
      "team_name":"springfield hockey"
   },
   {
      "team_name":"Draman"
   },
   {
      "team_name":"NachoFry's"
   },
   {
      "team_name":"PordivaTeam"
   },
   {
      "team_name":"homehaus"
   },
   {
      "team_name":"Interactive Labs"
   },
   {
      "team_name":"The Autonomous Project"
   },
   {
      "team_name":"TeamLogic IT of NE Portland"
   },
   {
      "team_name":"ThePellows"
   },
   {
      "team_name":"InnoSquard"
   },
   {
      "team_name":"BadJupiter"
   },
   {
      "team_name":"Julian"
   },
   {
      "team_name":"DockyardTest"
   },
   {
      "team_name":"Shapr"
   },
   {
      "team_name":"Casa-M"
   },
   {
      "team_name":"shawol"
   },
   {
      "team_name":"Ubor.io"
   },
   {
      "team_name":"Slobbnocker"
   },
   {
      "team_name":"jus-eberron"
   },
   {
      "team_name":"WINSTON"
   },
   {
      "team_name":"Function Incorporated"
   },
   {
      "team_name":"Lahann Lab"
   },
   {
      "team_name":"rogr"
   },
   {
      "team_name":"sg"
   },
   {
      "team_name":"3za"
   },
   {
      "team_name":"Total Highspeed"
   },
   {
      "team_name":"Bypass"
   },
   {
      "team_name":"Kre8it"
   },
   {
      "team_name":"2175market"
   },
   {
      "team_name":"Square Penguin"
   },
   {
      "team_name":"Rosetta"
   },
   {
      "team_name":"Rakuten inc."
   },
   {
      "team_name":"Hammer"
   },
   {
      "team_name":"blah"
   },
   {
      "team_name":"IGS BTS"
   },
   {
      "team_name":"Purse"
   },
   {
      "team_name":"marketing605apple"
   },
   {
      "team_name":"KH"
   },
   {
      "team_name":"Lexy"
   },
   {
      "team_name":"Wikkit Labs"
   },
   {
      "team_name":"Quibb"
   },
   {
      "team_name":"garnet2"
   },
   {
      "team_name":"nextbigthing"
   },
   {
      "team_name":"Kaeberlein Lab"
   },
   {
      "team_name":"jizi"
   },
   {
      "team_name":"km and Beyond"
   },
   {
      "team_name":"Brandtrust"
   },
   {
      "team_name":"kt"
   },
   {
      "team_name":"GRKN"
   },
   {
      "team_name":"Bitwater"
   },
   {
      "team_name":"Nocturnal Ninjas"
   },
   {
      "team_name":"GULC BLSA Board 2016-17"
   },
   {
      "team_name":"iiibot"
   },
   {
      "team_name":"Delusional"
   },
   {
      "team_name":"Media Genesis"
   },
   {
      "team_name":"Sciensa"
   },
   {
      "team_name":"Eagle 5 Bros"
   },
   {
      "team_name":"MadAppGang"
   },
   {
      "team_name":"A&A"
   },
   {
      "team_name":"Messaging Trends"
   },
   {
      "team_name":"z"
   },
   {
      "team_name":"Team Tandem"
   },
   {
      "team_name":"bots.com"
   },
   {
      "team_name":"JohnHenry"
   },
   {
      "team_name":"TMS of South Tampa"
   },
   {
      "team_name":"3djedimedia"
   },
   {
      "team_name":"icu"
   },
   {
      "team_name":"OPIGGL"
   },
   {
      "team_name":"RedPulse"
   },
   {
      "team_name":"hipmunk"
   },
   {
      "team_name":"Open RP Highschool roleplay group 2012"
   },
   {
      "team_name":"The Philodendron Society"
   },
   {
      "team_name":"Safaia"
   },
   {
      "team_name":"Grunkovitz"
   },
   {
      "team_name":"10clouds"
   },
   {
      "team_name":"Information Systems"
   },
   {
      "team_name":"garnet1"
   },
   {
      "team_name":"vwaproject"
   },
   {
      "team_name":"1self"
   },
   {
      "team_name":"Troops Demo"
   },
   {
      "team_name":"chriskiptesting"
   },
   {
      "team_name":"Leading Advice"
   },
   {
      "team_name":"Pplbot"
   },
   {
      "team_name":"Deus"
   },
   {
      "team_name":"No Adults Allowed"
   },
   {
      "team_name":"The DG ro"
   },
   {
      "team_name":"AllChat"
   },
   {
      "team_name":"Aplos Innovations"
   },
   {
      "team_name":"ndarville"
   },
   {
      "team_name":"garnet7"
   },
   {
      "team_name":"Frogwares"
   },
   {
      "team_name":"Public Theater LX"
   },
   {
      "team_name":"Catalyst"
   },
   {
      "team_name":"The Family Church"
   },
   {
      "team_name":"okumura"
   },
   {
      "team_name":"福州榨骗集团"
   },
   {
      "team_name":"Alpha Kappa Psi"
   },
   {
      "team_name":"Work For The Soul"
   },
   {
      "team_name":"ProjectGrayskull"
   },
   {
      "team_name":"Shopping Test Group"
   },
   {
      "team_name":"rehabstudio"
   },
   {
      "team_name":"Requisit"
   },
   {
      "team_name":"Tawa"
   },
   {
      "team_name":"Berkshire Inc."
   },
   {
      "team_name":"Reel Memoriez Photography"
   },
   {
      "team_name":"HP_westrings"
   },
   {
      "team_name":"JamesplayGames"
   },
   {
      "team_name":"signred"
   },
   {
      "team_name":"AEZcorp"
   },
   {
      "team_name":"SDG Customer Intelligence"
   },
   {
      "team_name":"bivapi"
   },
   {
      "team_name":"TargetBeat"
   },
   {
      "team_name":"Cargo"
   },
   {
      "team_name":"Flatonia Baptist Church"
   },
   {
      "team_name":"Luno"
   },
   {
      "team_name":"SAFE Arabia Group"
   },
   {
      "team_name":"1701"
   },
   {
      "team_name":"IVLP"
   },
   {
      "team_name":"Zembula"
   },
   {
      "team_name":"Exponento"
   },
   {
      "team_name":"Sensibo"
   },
   {
      "team_name":"#startup"
   },
   {
      "team_name":"Loonamoon"
   },
   {
      "team_name":"WGS"
   },
   {
      "team_name":"DouglasL"
   },
   {
      "team_name":"Swisscom Digital"
   },
   {
      "team_name":"InTurn"
   },
   {
      "team_name":"UNITiD"
   },
   {
      "team_name":"Co-Captains"
   },
   {
      "team_name":"Bigfoot"
   },
   {
      "team_name":"Bearrry"
   },
   {
      "team_name":"Saucey"
   },
   {
      "team_name":"sooyeun"
   },
   {
      "team_name":"League of 52"
   },
   {
      "team_name":"Tech"
   },
   {
      "team_name":"SVG Media"
   },
   {
      "team_name":"despano"
   },
   {
      "team_name":"thedataincubator"
   },
   {
      "team_name":"Tech 4 Development"
   },
   {
      "team_name":"deleev, delicious delivery"
   },
   {
      "team_name":"MagicBots"
   },
   {
      "team_name":"kirill"
   },
   {
      "team_name":"YaloChat"
   },
   {
      "team_name":"Redberry, est 2008"
   },
   {
      "team_name":"Relay"
   },
   {
      "team_name":"Ingberman"
   },
   {
      "team_name":"The Tribe"
   },
   {
      "team_name":"Hooligans"
   },
   {
      "team_name":"futurenetdevelop"
   },
   {
      "team_name":"SFW Name"
   },
   {
      "team_name":"Spark"
   },
   {
      "team_name":"harvey.leung"
   },
   {
      "team_name":"Princemay"
   },
   {
      "team_name":"Leafdock"
   },
   {
      "team_name":"The Chien Group"
   },
   {
      "team_name":"Cha(t)Cha(t)Cha(t)"
   },
   {
      "team_name":"Ryerson Formula Racing"
   },
   {
      "team_name":"OklandIT"
   }
]
// var users = [
//   {
//     id:'U02PN3B2F',
//     team_id:'T02PN3B25'
//   },
//   {
//     id:'U02PN3T5R',
//     team_id:'T02PN3B25'
//   },
// ]

//
// Run it
//
function * main () {
  // yield sleep(1000)
  // console.log('batch', batch)
  // console.log(days[batch / 10 | 0], days[batch % 10])
  // console.log('Sending message to users in batch', batch)
  // console.log(`there are ${users.length} users in this batch`)
  // console.log('(ctrl-c if that looks wrong)')


  //CHECK IF A STOP TEAM (INC AXEL TEAMS)
  //CHECK IF AN ADMIN ONLY TEAM (inc team size > 100)
  console.log('/ / / / / / / / / / / running test team')

  yield teamsTestAll.map(function * (t) {
    console.log('MAP TEAM ',t)
    if(t.team_name){
      var team = yield db.Slackbots.findOne({team_name: t.team_name}).exec()
      if (team && team.team_id){
        var users = yield db.Chatusers.find({team_id: team.team_id,'is_bot':false,'deleted':false}).exec()
        if(users){
        
          for (var u in users) {

            if(users[u].id && users[u].team_id){

              if(users[u].id !== 'USLACKBOT'){
                yield sleep(100)
                yield sendToUser(users[u].id,users[u].team_id)
              }else {
                console.log('slackbot found!')
              }    
            }
          }

        
        }
      }
    }
  })

  console.log('/ / / / / / / / / / test team ran, proceeding to real teams')
  yield sleep(8000)

  console.log('/ / / / / / / / / / /running admin only teams')

  // yield teamsAdminOnly.map(function * (t) {
  //   yield sleep(20)
  //   console.log('MAP TEAM ',t)
  //   if(t.team_name){
  //     var team = yield db.Slackbots.findOne({team_name: t.team_name}).exec()

  //     if (team && team.meta && team.meta.office_assistants && team.meta.office_assistants.length > 0){

  //       console.log('FOUND ADMINS ',team.meta.office_assistants)

  //       yield team.meta.office_assistants.map(function * (u) {
  //         if(u){

  //           console.log('sending to id ',u)
  //           yield sendToUser(u,team.team_id)
 
            
  //         }
  //       }) 

  //     }
  //   }
  // })

  console.log('/ / / / / / / / / / admin teams ran, proceeding to all message teams')
  yield sleep(5000)


  yield teamsAll.map(function * (t) {
    yield sleep(20)
    console.log('MAP TEAM ',t)
    if(t.team_name){
      var team = yield db.Slackbots.findOne({team_name: t.team_name}).exec()
      if (team && team.team_id){
        var users = yield db.Chatusers.find({team_id: team.team_id,'is_bot':false,'deleted':false}).exec()
        if(users){

          for (var u in users) {

            if(users[u].id && users[u].team_id){

              if(users[u].id !== 'USLACKBOT'){
                yield sleep(100)
                yield sendToUser(users[u].id,users[u].team_id)
              }else {
                console.log('slackbot found!')
              }    
            }
          }
        
        }
      }
    }
  })

  console.log('/ / / / / / / / / / /DONE SENDING TO ALL TEAMS!!!!!!!!!!!')
  // var userId = 'U02PN3T5R'
  // var teamId = 'T02PN3B25'

  //yield sendToUser(userId,teamId)
  process.exit(0)
}

const days = [
` 00000
 00   00
 00  000
 00 0 00
 000  00
 00   00
  00000

`,
  `  1111
  11111
   1111
   1111
   1111
   1111
  111111
`,
  `  2222
  222222
  2  22
    22
   22
  222222
  222222
`,
  `3333333
     33
    33
  33333
     333
    333
 3333
`,
  `    44
    444
   4444
  44 44
 44  44
44444444
     44
`,
  `5555555
 55
 5555555
     555
     555
    555
 55555
`,
  `  66
  66
 66
 66666
 66  66
 66  66
  6666
`,
  `77777777
       77
      77
   7777
    77
   77
  77
`,
  ` 888888
 88  88
   888
  88 88
 88   88
 88   88
  88888
`,
  `  9999
  99  99
  99  99
   99999
      99
     99
    99
`
].map(d => '\n ' + d)

co(main).catch(e => {
  console.error(e)
  process.exit(1)
})
