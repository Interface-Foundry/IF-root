require('../../../kip')
var co = require('co')
var request = require('co-request')
var sleep = require('co-sleep')
var slack = require('@slack/client')
const fs = require('fs')
var series = require('co-series')

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



 //db.chatusers.find({'is_bot':false,'deleted':false}).count()


var teamsTestAll = [
{
  'team_name':'kip'
}
]

var teamsAll = [
  {
          "team_name" : "FairVentures Lab"
  },
  {
    "team_name" : "INTERSECTION VENTURES"
  },
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
          "team_name" : "Hergui"
  },
  {
          "team_name" : "quinnchristmas"
  },
  {
          "team_name" : "cyclogy"
  },
  {
          "team_name" : "蒋村科技有限公司"
  },
  {
          "team_name" : "servo-ai"
  },
  {
          "team_name" : "affectiva"
  },
  {
          "team_name" : "Campbell Lab"
  },
  {
          "team_name" : "boxed"
  },
  {
          "team_name" : "Rad Campaign"
  },
  {
          "team_name" : "rgb72"
  },
  {
          "team_name" : "Hope City"
  },
  {
          "team_name" : "wemart"
  },
  {
          "team_name" : "YS-INT"
  },
  {
          "team_name" : "Project G"
  },
  {
          "team_name" : "slisystems"
  },
  {
          "team_name" : "midbot"
  },
  {
          "team_name" : "cyberdine"
  },
  {
          "team_name" : "IUrja"
  },
  {
          "team_name" : "Fellow Campers"
  },
  {
          "team_name" : "chatbots"
  },
  {
          "team_name" : "hiro"
  },
  {
          "team_name" : "Idee101"
  },
  {
          "team_name" : "Evergen Resources"
  },
  {
          "team_name" : "luscofuscocyclery"
  },
  {
          "team_name" : "Fan Fest"
  },
  {
          "team_name" : "Kudi"
  },
  {
          "team_name" : "Blippar"
  },
  {
          "team_name" : "The Dog Company"
  },
  {
          "team_name" : "RallyBound"
  },
  {
          "team_name" : "Andrade & Company"
  },
  {
          "team_name" : "The Oots"
  },
  {
          "team_name" : "Agripod"
  },
  {
          "team_name" : "Gutenberg"
  },
  {
          "team_name" : "Tamedia Digital"
  },
  {
          "team_name" : "techteamer"
  },
  {
          "team_name" : "bismuth10"
  },
  {
          "team_name" : "EP"
  },
  {
          "team_name" : "C4 Security"
  },
  {
          "team_name" : "gamezop"
  },
  {
          "team_name" : "bismuth11"
  },
  {
          "team_name" : "T"
  },
  {
          "team_name" : "Leadsmarket"
  },
  {
          "team_name" : "Because We Will be Rich Someday"
  },
  {
          "team_name" : "How2marry"
  },
  {
          "team_name" : "{一个不平凡的莫纳什IT团队}"
  },
  {
          "team_name" : "liberta"
  },
  {
          "team_name" : "CyberProductivity S.A."
  },
  {
          "team_name" : "Tiki"
  },
  {
          "team_name" : "Openix"
  },
  {
          "team_name" : "egi_bots"
  },

  {
          "team_name" : "Bunker604"
  },
  {
          "team_name" : "Tripoto"
  },
  {
          "team_name" : "Overtone Labs"
  },
  {
          "team_name" : "BetterLife"
  },
  {
          "team_name" : "JOHN ELLIOTT"
  },
  {
          "team_name" : "Lob"
  },
  {
          "team_name" : "Vital AI"
  },
  {
          "team_name" : "The Post Office"
  },
  {
          "team_name" : "HighTechEnt"
  },
  {
          "team_name" : "The Village"
  },
  {
          "team_name" : "Global Relay"
  },
  {
          "team_name" : "BCGDV"
  },
  {
          "team_name" : "Ngo Family"
  },
  {
          "team_name" : "Blue Kangaroo"
  },
  {
          "team_name" : "Visual"
  },
  {
          "team_name" : "restock"
  },
  {
          "team_name" : "Intros"
  },
  {
          "team_name" : "微壹"
  },
  {
          "team_name" : "crunchball"
  },
  {
          "team_name" : "diamond1"
  },
  {
          "team_name" : "Delcampe Team"
  },
  {
          "team_name" : "Appscinated"
  },
  {
          "team_name" : "clytemnestra"
  },
  {
          "team_name" : "meow cat parlor"
  },
  {
          "team_name" : "motobecane"
  },
  {
          "team_name" : "AmidA"
  },
  {
          "team_name" : "Black Euphoria"
  },
  {
          "team_name" : "cypriengilbert"
  },
  {
          "team_name" : "Soko Glam"
  },
  {
          "team_name" : "BAT - Business Intelligence"
  },
  {
          "team_name" : "DSC"
  },
  {
          "team_name" : "Rexel"
  },
  {
          "team_name" : "lifebleedsink"
  },
  {
          "team_name" : "EzFlipCards"
  },
  {
          "team_name" : "fintros"
  },
  {
          "team_name" : "Baatch"
  },
  {
          "team_name" : "Dojo Madness"
  },
  {
          "team_name" : "TGEU"
  },
  {
          "team_name" : "Studio Deversus"
  },
  {
          "team_name" : "Happi"
  },
  {
          "team_name" : "MarineTraffic Marketing"
  },
  {
          "team_name" : "GRG"
  },
  {
          "team_name" : "Fluenty"
  },
  {
          "team_name" : "LMILTest"
  },
  {
          "team_name" : "7Lab"
  },
  {
          "team_name" : "Strive Labs"
  },
  {
          "team_name" : "Fotawa"
  },
  {
          "team_name" : "OSM Aviation"
  },
  {
          "team_name" : "DG educators"
  },
  {
          "team_name" : "Futures"
  },
  {
          "team_name" : "enxoy"
  },
  {
          "team_name" : "Pretius APEX"
  },
  {
          "team_name" : "Robinsons Archipel"
  },
  {
          "team_name" : "Nicolas-Jana"
  },
  {
          "team_name" : "besiktas"
  },
  {
          "team_name" : "botworkshop"
  },
  {
          "team_name" : "Home"
  },
  {
          "team_name" : "Tomigo"
  },
  {
          "team_name" : "Tidridge Family"
  },
  {
          "team_name" : "abzreider"
  },
  {
          "team_name" : "Feathr"
  },
  {
          "team_name" : "Zinda.xyz"
  },
  {
          "team_name" : "instastint"
  },
  {
          "team_name" : "iF"
  },
  {
          "team_name" : "Localz"
  },
  {
          "team_name" : "SMARTX"
  },
  {
          "team_name" : "motobecane enthusiasts"
  },
  {
          "team_name" : "The Andersen's"
  },
  {
          "team_name" : "AdviceCoach"
  },
  {
          "team_name" : "sergioska"
  },
  {
          "team_name" : "vadnov"
  },
  {
          "team_name" : "Web Efficient"
  },
  {
          "team_name" : "prostocompany"
  },
  {
          "team_name" : "Plano Foundry"
  },
  {
          "team_name" : "Spawn Advertising"
  },
  {
          "team_name" : "Hardcore-Development"
  },
  {
          "team_name" : "Practo"
  },
  {
          "team_name" : "Project Pilot"
  },
  {
          "team_name" : "webklusive GmbH"
  },
  {
          "team_name" : "Open Web Uruguay"
  },
  {
          "team_name" : "Botomaker"
  },
  {
          "team_name" : "GDMobileUIBots"
  },
  {
          "team_name" : "CBC Kitchen"
  },
  {
          "team_name" : "Ottowa Randonneurs"
  },
  {
          "team_name" : "zentrusts"
  },
  {
          "team_name" : "HLE"
  },
  {
          "team_name" : "AIM Coach (Artificial Intelligence Mental Coach)"
  },
  {
          "team_name" : "Sharpies Inc."
  },
  {
          "team_name" : "2PAx"
  },
  {
          "team_name" : "Bomoda"
  },
  {
          "team_name" : "Amikuku"
  },
  {
          "team_name" : "UGT IT Solutions"
  },
  {
          "team_name" : "DSR09"
  },
  {
          "team_name" : "nidebefuv"
  },
  {
          "team_name" : "ARMDD"
  },
  {
          "team_name" : "Hollys"
  },
  {
          "team_name" : "Midtjys-Kloge"
  },
  {
          "team_name" : "Bonaverde"
  },
  {
          "team_name" : "Tomek"
  },
  {
          "team_name" : "Lunchr"
  },
  {
          "team_name" : "SPD"
  },
  {
          "team_name" : "TestingKip"
  },
  {
          "team_name" : "AI Interns Inc."
  },
  {
          "team_name" : "12 Labs"
  },
  {
          "team_name" : "Codementor"
  },
  {
          "team_name" : "righttalent"
  },
  {
          "team_name" : "iSmart"
  },
  {
          "team_name" : "VidaCare"
  },
  {
          "team_name" : "mutesix"
  },
  {
          "team_name" : "Take it easy"
  },
  {
          "team_name" : "ALPOL rozwiązania IT"
  },
  {
          "team_name" : "Deus"
  },
  {
          "team_name" : "Vidyanext"
  },
  {
          "team_name" : "SavageSquad"
  },
  {
          "team_name" : "SakthiGear"
  },
  {
          "team_name" : "Opera"
  },
  {
          "team_name" : "StarterKitGenerator"
  },
  {
          "team_name" : "AngularRiders"
  },
  {
          "team_name" : "dayoffun"
  },
  {
          "team_name" : "ValdasPlayground"
  },
  {
          "team_name" : "TheTallTeam"
  },
  {
          "team_name" : "Ordy Development"
  },
  {
          "team_name" : "tsepak"
  },
  {
          "team_name" : "ML Startup"
  },
  {
          "team_name" : "Deloitte Digital (US)"
  },
  {
          "team_name" : "Klinche"
  },
  {
          "team_name" : "gentlepie"
  },
  {
          "team_name" : "acemee"
  },
  {
          "team_name" : "MOCEANS CIL"
  },
  {
          "team_name" : "Cinimod Studio"
  },
  {
          "team_name" : "jTestBot"
  },
  {
          "team_name" : "Solinea Group Ltd"
  },
  {
          "team_name" : "iQmetrix"
  },
  {
          "team_name" : "Lystable"
  },
  {
          "team_name" : "Snaps"
  },
  {
          "team_name" : "BotTester"
  },
  {
          "team_name" : "Jagrat'sContentStack"
  },
  {
          "team_name" : "ChatbotsMeetup"
  },
  {
          "team_name" : "cafeliang"
  },
  {
          "team_name" : "naccaratonetwork"
  },
  {
          "team_name" : "Artis"
  },
  {
          "team_name" : "K0_R1"
  },
  {
          "team_name" : "sad"
  },
  {
          "team_name" : "GD-PAL"
  },
  {
          "team_name" : "FindHotel"
  },
  {
          "team_name" : "RotoGrinders"
  },
  {
          "team_name" : "botsociety"
  },
  {
          "team_name" : "botdock"
  },
  {
          "team_name" : "Crush Empire"
  },
  {
          "team_name" : "Jewelsmith"
  },
  {
          "team_name" : "Crate Gallery is Awesome"
  },
  {
          "team_name" : "Jumpcut Studios"
  },
  {
          "team_name" : "Maragi"
  },
  {
          "team_name" : "SafeTrek"
  },
  {
          "team_name" : "duplastudios"
  },
  {
          "team_name" : "dyad"
  },
  {
          "team_name" : "Hashlama029"
  },
  {
          "team_name" : "Maragi"
  },
  {
          "team_name" : "BTC-ECHO"
  },
  {
          "team_name" : "Clara"
  },
  {
          "team_name" : "Cole Haan"
  },
  {
          "team_name" : "Learn Beyond Inc."
  },
  {
          "team_name" : "Students for Legal Research in the Public Interest"
  },
  {
          "team_name" : "UPS i-parcel IT"
  },
  {
          "team_name" : "Freestyle"
  },
  {
          "team_name" : "Secret Cactus"
  },
  {
          "team_name" : "SBC Kingdom Ministry"
  },
  {
          "team_name" : "TB4HR"
  },
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

//
// We'll send this message to ppl as a marketing campaign
//
const message = {
  "text":"",
  "attachments": [{
    "text": "",
    "pretext":"Today is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉",
    "image_url": "https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_1.png",
    "mrkdwn_in": ["text,pretext"],
    "fallback": "Today is Admin Day! Thank team members who keep the office running smoothly\n Take this short quiz to find out what to get 🎉",
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

function * createChatUser (userId,teamId,channelId) {
    console.log('creating new user for team')
    var new_user = new db.Chatuser()
    new_user.team_id = teamId
    new_user.id = userId
    new_user.dm = channelId
    new_user.is_bot = false
    new_user.history.interactions = []
    new_user.save(function(err, saved) {
      if(err){
        console.log('saving user err ',err)
      }
      return
    })
}


//
// Sends a message to a specific user
//
function sendToUser (userId,teamId,channelId) {
  console.log('running for user ', userId)
  console.log('on team ', teamId)
  console.log('on channel ', channelId)
  
  return co(function * () {
    
    //check if user exists in our DB
    var user = yield db.Chatusers.findOne({id: userId, team_id: teamId}).exec()

    if (!user) {
      console.log('could not find user in db, creating....', userId)
      yield createChatUser(userId,teamId,channelId)
    }

    //console.log('🌵🌵 !user! ',user)

    //Don't re-send to someone who we have already sent this marketing message
    var sentCount = yield db.Metrics.count({
      'data.user': userId,
      'data.team': teamId,
      'data.feature': 'bloomthat_today'
    }).exec()

    if (sentCount > 0) {
      console.log('already sent to user', userId)
      return
    }

    // CHECK HERE WHICH TIMEZONE THEY'RE IN, so it's 10am their time. so run it at 10am , 11am, 12pm 

    //ACTUALLY GET THREE DIFFERENT LISTS OF USERS, by timezone (when it's 10am their time)


    // Send a message to this user 
    let slackbot = yield db.Slackbots.findOne({team_id: teamId}).exec()

    //try {
    let bot = new slack.WebClient(slackbot.bot.bot_access_token)

    yield bot.chat.postMessage(channelId, '', message)

    console.log('🌵 SENT MESSAGE!')

    db.Metrics.log('feature.rollout.sent', {
      team: teamId,
      user: userId,
      feature: 'bloomthat_today'
    })  

  })
}

//
// Run it
//
function * main () {

  console.log('/ / / / / / / / / / / running test team')

  // yield teamsTestAll.map(function * (t) {
  //   if(t.team_name){
  //     yield spamTeam(t.team_name,'all') //i'm over it, really
  //   }
  // })

  console.log('/ / / / / / / / / / test team ran, proceeding to real teams')
  // yield sleep(8000)

  // console.log('/ / / / / / / / / / /running admin only teams')

  // yield teamsAdminOnly.map(function * (t) {
  //   if(t.team_name){
  //     yield spamTeam(t.team_name,'admins') //i'm over it, really
  //   }
  // })

  console.log('/ / / / / / / / / / admin teams ran, proceeding to all message teams')
  yield sleep(2000)


  // yield teamsAll.map(series(function * (t) {
  //   if(t.team_name){
  //     var res = yield spamTeam(t.team_name,'all') //i'm over it, really
  //   }
  // }))

  // yield spamTeam('Hergui','all')
  // yield spamTeam('quinnchristmas','all')
  // yield spamTeam('cyclogy','all')
  // yield spamTeam('蒋村科技有限公司','all')
  // yield spamTeam('servo-ai','all')
  // yield spamTeam('affectiva','all')
  // yield spamTeam('Campbell Lab','all')
  // yield spamTeam('boxed','all')
  // yield spamTeam('Rad Campaign','all')
  // yield spamTeam('rgb72','all')
  // yield spamTeam('Hope City','all')
  // yield spamTeam('wemart','all')
  // yield spamTeam('YS-INT','all')
  // yield spamTeam('Project G','all')
  // yield spamTeam('slisystems','all')
  yield spamTeam('midbot','all')
  yield spamTeam('cyberdine','all')
  yield spamTeam('IUrja','all')
  yield spamTeam('Fellow Campers','all')
  yield spamTeam('chatbots','all')
  yield spamTeam('hiro','all')
  yield spamTeam('Idee101','all')
  yield spamTeam('Evergen Resources','all')
  yield spamTeam('luscofuscocyclery','all')
  yield spamTeam('Fan Fest','all')
  yield spamTeam('Kudi','all')
  yield spamTeam('Blippar','all')
  yield spamTeam('The Dog Company','all')
  yield spamTeam('RallyBound','all')
  yield spamTeam('Andrade & Company','all')
  yield spamTeam('The Oots','all')
  yield spamTeam('Agripod','all')
  yield spamTeam('Gutenberg','all')
  yield spamTeam('Tamedia Digital','all')
  yield spamTeam('techteamer','all')
  yield spamTeam('EP','all')
  yield spamTeam('C4 Security','all')
  yield spamTeam('gamezop','all')
  yield spamTeam('T','all')
  yield spamTeam('Leadsmarket','all')
  yield spamTeam('Because We Will be Rich Someday','all')
  yield spamTeam('How2marry','all')
  yield spamTeam('{一个不平凡的莫纳什IT团队}','all')
  yield spamTeam('liberta','all')
  yield spamTeam('CyberProductivity S.A.','all')
  yield spamTeam('Tiki','all')
  yield spamTeam('Openix','all')
  yield spamTeam('egi_bots','all')
  yield spamTeam('Bunker604','all')
  yield spamTeam('Tripoto','all')
  yield spamTeam('Overtone Labs','all')
  yield spamTeam('BetterLife','all')
  yield spamTeam('JOHN ELLIOTT','all')
  yield spamTeam('Lob','all')
  yield spamTeam('Vital AI','all')
  yield spamTeam('The Post Office','all')
  yield spamTeam('HighTechEnt','all')
  yield spamTeam('The Village','all')
  yield spamTeam('Global Relay','all')
  yield spamTeam('BCGDV','all')
  yield spamTeam('Ngo Family','all')
  yield spamTeam('Blue Kangaroo','all')
  yield spamTeam('Visual','all')
  yield spamTeam('restock','all')
  yield spamTeam('Intros','all')
  yield spamTeam('微壹','all')
  yield spamTeam('crunchball','all')
  yield spamTeam('diamond1','all')
  yield spamTeam('Delcampe Team','all')
  yield spamTeam('Appscinated','all')
  yield spamTeam('clytemnestra','all')
  yield spamTeam('meow cat parlor','all')
  yield spamTeam('motobecane','all')
  yield spamTeam('AmidA','all')
  yield spamTeam('Black Euphoria','all')
  yield spamTeam('cypriengilbert','all')
  yield spamTeam('Soko Glam','all')
  yield spamTeam('BAT - Business Intelligence','all')
  yield spamTeam('DSC','all')
  yield spamTeam('Rexel','all')
  yield spamTeam('lifebleedsink','all')
  yield spamTeam('EzFlipCards','all')
  yield spamTeam('fintros','all')
  yield spamTeam('Baatch','all')
  yield spamTeam('Dojo Madness','all')
  yield spamTeam('TGEU','all')
  yield spamTeam('Studio Deversus','all')
  yield spamTeam('Happi','all')
  yield spamTeam('MarineTraffic Marketing','all')
  yield spamTeam('GRG','all')
  yield spamTeam('Fluenty','all')
  yield spamTeam('LMILTest','all')
  yield spamTeam('7Lab','all')
  yield spamTeam('Strive Labs','all')
  yield spamTeam('Fotawa','all')
  yield spamTeam('OSM Aviation','all')
  yield spamTeam('DG educators','all')
  yield spamTeam('Futures','all')
  yield spamTeam('enxoy','all')
  yield spamTeam('Pretius APEX','all')
  yield spamTeam('Robinsons Archipel','all')
  yield spamTeam('Nicolas-Jana','all')
  yield spamTeam('besiktas','all')
  yield spamTeam('botworkshop','all')
  yield spamTeam('Home','all')
  yield spamTeam('Tomigo','all')
  yield spamTeam('Tidridge Family','all')
  yield spamTeam('abzreider','all')
  yield spamTeam('Feathr','all')
  yield spamTeam('Zinda.xyz','all')
  yield spamTeam('instastint','all')
  yield spamTeam('iF','all')
  yield spamTeam('Localz','all')
  yield spamTeam('SMARTX','all')
  yield spamTeam('motobecane enthusiasts','all')
  yield spamTeam('The Andersen\'s','all')
  yield spamTeam('AdviceCoach','all')
  yield spamTeam('sergioska','all')
  yield spamTeam('vadnov','all')
  yield spamTeam('Web Efficient','all')
  yield spamTeam('prostocompany','all')
  yield spamTeam('Plano Foundry','all')
  yield spamTeam('Spawn Advertising','all')
  yield spamTeam('Hardcore-Development','all')
  yield spamTeam('Practo','all')
  yield spamTeam('Project Pilot','all')
  yield spamTeam('webklusive GmbH','all')
  yield spamTeam('Open Web Uruguay','all')
  yield spamTeam('Botomaker','all')
  yield spamTeam('GDMobileUIBots','all')
  yield spamTeam('CBC Kitchen','all')
  yield spamTeam('Ottowa Randonneurs','all')
  yield spamTeam('zentrusts','all')
  yield spamTeam('HLE','all')
  yield spamTeam('AIM Coach (Artificial Intelligence Mental Coach)','all')
  yield spamTeam('Sharpies Inc.','all')
  yield spamTeam('2PAx','all')
  yield spamTeam('Bomoda','all')
  yield spamTeam('Amikuku','all')
  yield spamTeam('UGT IT Solutions','all')
  yield spamTeam('DSR09','all')
  yield spamTeam('nidebefuv','all')
  yield spamTeam('ARMDD','all')
  yield spamTeam('Hollys','all')
  yield spamTeam('Midtjys-Kloge','all')
  yield spamTeam('Bonaverde','all')
  yield spamTeam('Tomek','all')
  yield spamTeam('Lunchr','all')
  yield spamTeam('SPD','all')
  yield spamTeam('TestingKip','all')
  yield spamTeam('AI Interns Inc.','all')
  yield spamTeam('12 Labs','all')
  yield spamTeam('Codementor','all')
  yield spamTeam('righttalent','all')
  yield spamTeam('iSmart','all')
  yield spamTeam('VidaCare','all')
  yield spamTeam('mutesix','all')
  yield spamTeam('Take it easy','all')
  yield spamTeam('ALPOL rozwiązania IT','all')
  yield spamTeam('Deus','all')
  yield spamTeam('Vidyanext','all')
  yield spamTeam('SavageSquad','all')
  yield spamTeam('SakthiGear','all')
  yield spamTeam('Opera','all')
  yield spamTeam('StarterKitGenerator','all')
  yield spamTeam('AngularRiders','all')
  yield spamTeam('dayoffun','all')
  yield spamTeam('ValdasPlayground','all')
  yield spamTeam('TheTallTeam','all')
  yield spamTeam('Ordy Development','all')
  yield spamTeam('tsepak','all')
  yield spamTeam('ML Startup','all')
  yield spamTeam('Deloitte Digital (US)','all')
  yield spamTeam('Klinche','all')
  yield spamTeam('gentlepie','all')
  yield spamTeam('acemee','all')
  yield spamTeam('MOCEANS CIL','all')
  yield spamTeam('Cinimod Studio','all')
  yield spamTeam('jTestBot','all')
  yield spamTeam('Solinea Group Ltd','all')
  yield spamTeam('iQmetrix','all')
  yield spamTeam('Lystable','all')
  yield spamTeam('Snaps','all')
  yield spamTeam('BotTester','all')
  yield spamTeam('Jagrat\'sContentStack','all')
  yield spamTeam('ChatbotsMeetup','all')
  yield spamTeam('cafeliang','all')
  yield spamTeam('naccaratonetwork','all')
  yield spamTeam('Artis','all')
  yield spamTeam('K0_R1','all')
  yield spamTeam('sad','all')
  yield spamTeam('GD-PAL','all')
  yield spamTeam('FindHotel','all')
  yield spamTeam('RotoGrinders','all')
  yield spamTeam('botsociety','all')
  yield spamTeam('botdock','all')
  yield spamTeam('Crush Empire','all')
  yield spamTeam('Jewelsmith','all')
  yield spamTeam('Crate Gallery is Awesome','all')
  yield spamTeam('Jumpcut Studios','all')
  yield spamTeam('Maragi','all')
  yield spamTeam('SafeTrek','all')
  yield spamTeam('duplastudios','all')
  yield spamTeam('dyad','all')
  yield spamTeam('Hashlama029','all')
  yield spamTeam('Maragi','all')
  yield spamTeam('BTC-ECHO','all')
  yield spamTeam('Clara','all')
  yield spamTeam('Cole Haan','all')
  yield spamTeam('Learn Beyond Inc.','all')
  yield spamTeam('Students for Legal Research in the Public Interest','all')
  yield spamTeam('UPS i-parcel IT','all')
  yield spamTeam('Freestyle','all')
  yield spamTeam('Secret Cactus','all')
  yield spamTeam('SBC Kingdom Ministry','all')
  yield spamTeam('TB4HR','all')
  yield spamTeam('PI','all')
  yield spamTeam('Firma Dorsch','all')
  yield spamTeam('hihishopping','all')
  yield spamTeam('automat','all')
  yield spamTeam('GoButler','all')
  yield spamTeam('Init','all')
  yield spamTeam('Intermedia','all')
  yield spamTeam('RushTera','all')
  yield spamTeam('IxDA Miami','all')
  yield spamTeam('VatosLocos','all')
  yield spamTeam('Tech and Talk','all')
  yield spamTeam('The77TCollective','all')
  yield spamTeam('NandoTech','all')
  yield spamTeam('Singlebrook','all')
  yield spamTeam('JWJMO','all')
  yield spamTeam('T2','all')
  yield spamTeam('Fred & Farid','all')
  yield spamTeam('Democratic Alliance','all')
  yield spamTeam('Bhaku','all')
  yield spamTeam('booboo','all')
  yield spamTeam('grandpryze','all')
  yield spamTeam('Creative Woods','all')
  yield spamTeam('What\'s The Plan Fam?','all')
  yield spamTeam('family','all')
  yield spamTeam('Hudson Valley Tech Meetup','all')
  yield spamTeam('HeyLuc','all')
  yield spamTeam('BAMSAS','all')
  yield spamTeam('out-for-delivery','all')
  yield spamTeam('Warners','all')
  yield spamTeam('MUX4','all')
  yield spamTeam('City to City','all')
  yield spamTeam('Chaput Family','all')
  yield spamTeam('ReimboldEye','all')
  yield spamTeam('ITS','all')
  yield spamTeam('Rutgers Coding Bootcamp','all')
  yield spamTeam('Vermonster','all')
  yield spamTeam('sfbot-dev','all')
  yield spamTeam('ϛιιξα','all')
  yield spamTeam('besiktas','all')
  yield spamTeam('trifekta','all')
  yield spamTeam('workbus','all')
  yield spamTeam('Ben Sutton','all')
  yield spamTeam('Coases','all')
  yield spamTeam('rocket','all')
  yield spamTeam('SupeRanky','all')
  yield spamTeam('Pitchoune & Jérôminette','all')
  yield spamTeam('xiaoxin','all')
  yield spamTeam('Outspoken Media','all')
  yield spamTeam('yangko','all')
  yield spamTeam('research - chat bots','all')
  yield spamTeam('SD Fin Control','all')
  yield spamTeam('Done Deal','all')
  yield spamTeam('NTG','all')
  yield spamTeam('The Addams Family','all')
  yield spamTeam('Bot User Research','all')
  yield spamTeam('botuserresearch2','all')
  yield spamTeam('Special Projects','all')
  yield spamTeam('Pierce Washington','all')
  yield spamTeam('ABT Solutions','all')
  yield spamTeam('Furious 8','all')
  yield spamTeam('Mario','all')
  yield spamTeam('codechemistry','all')
  yield spamTeam('Dynamo PR','all')
  yield spamTeam('Squarehead Technology','all')
  yield spamTeam('Slackers at 476','all')
  yield spamTeam('Peninsula Temple Sholom','all')
  yield spamTeam('UMD SUAS','all')
  yield spamTeam('photobooth','all')
  yield spamTeam('Summit','all')
  yield spamTeam('Freetime Hospitality B.V.','all')
  yield spamTeam('BC','all')
  yield spamTeam('Yala','all')
  yield spamTeam('Dinamo','all')
  yield spamTeam('Spec Brand','all')
  yield spamTeam('exceptional-code','all')
  yield spamTeam('Colorado Product Services','all')
  yield spamTeam('LKKHPG DI - Innovation Lab','all')
  yield spamTeam('Djenee','all')
  yield spamTeam('Cre8ive Business','all')
  yield spamTeam('bottokyo','all')
  yield spamTeam('ZuPi Düsseldorf','all')
  yield spamTeam('Loot Crate','all')
  yield spamTeam('NYDN','all')
  yield spamTeam('Jamly','all')
  yield spamTeam('Consequence','all')
  yield spamTeam('SyncUpLabs','all')
  yield spamTeam('Baycall','all')
  yield spamTeam('tomozo','all')
  yield spamTeam('Product','all')
  yield spamTeam('chloekwon','all')
  yield spamTeam('Bera-Tek Slack','all')
  yield spamTeam('398438942934','all')
  yield spamTeam('bauerhour','all')
  yield spamTeam('EXO-ARM','all')
  yield spamTeam('35cm','all')
  yield spamTeam('huit-iam','all')
  yield spamTeam('PKO','all')
  yield spamTeam('source{d}','all')
  yield spamTeam('InPos Soft','all')
  yield spamTeam('Early Days','all')
  yield spamTeam('Cobb Superior Court','all')
  yield spamTeam('ITINERIS','all')
  yield spamTeam('KindHealth','all')
  yield spamTeam('TouchPoint Travel','all')
  yield spamTeam('MakerBot','all')
  yield spamTeam('Network Nerds','all')
  yield spamTeam('Beachfront Only','all')
  yield spamTeam('technologiclee','all')
  yield spamTeam('hahahahahaha','all')
  yield spamTeam('Luke Bots','all')
  yield spamTeam('Metodo','all')
  yield spamTeam('brograms','all')
  yield spamTeam('Leo Burnett London','all')
  yield spamTeam('IttyBot','all')
  yield spamTeam('Jam','all')
  yield spamTeam('IdeaHackers.nl','all')
  yield spamTeam('asdfasdfsdfdf','all')
  yield spamTeam('Myntra','all')
  yield spamTeam('oknewthing','all')
  yield spamTeam('me','all')
  yield spamTeam('Acumen Creative','all')
  yield spamTeam('newfutile','all')
  yield spamTeam('Skelter and all','all')
  yield spamTeam('Nossa Growth','all')
  yield spamTeam('Bot Bureau','all')
  yield spamTeam('Stup Sistemas','all')
  yield spamTeam('bci-slack','all')
  yield spamTeam('TGT Labs','all')
  yield spamTeam('timebot','all')
  yield spamTeam('Andynebs','all')
  yield spamTeam('nlnl','all')
  yield spamTeam('sandbox','all')
  yield spamTeam('Infinitum Deo','all')
  yield spamTeam('Tesco Labs Bengaluru','all')
  yield spamTeam('tester111','all')
  yield spamTeam('TeamHaribo','all')
  yield spamTeam('ProudFolio','all')
  yield spamTeam('Crossbeat','all')
  yield spamTeam('hanaber','all')
  yield spamTeam('Tether','all')
  yield spamTeam('CZ Art Department','all')
  yield spamTeam('MontanaPBS Producers','all')
  yield spamTeam('JBi Digital','all')
  yield spamTeam('Bapply','all')
  yield spamTeam('Little Letter','all')
  yield spamTeam('teuscher','all')
  yield spamTeam('Mnpco','all')
  yield spamTeam('Bonanza','all')
  yield spamTeam('Scratch','all')
  yield spamTeam('Larvol','all')
  yield spamTeam('TWSitecheckQA','all')
  yield spamTeam('rally.ai','all')
  yield spamTeam('Nerd Fort','all')
  yield spamTeam('NotYetFound','all')
  yield spamTeam('SATOS','all')
  yield spamTeam('asdfaddddd','all')
  yield spamTeam('Gary Thompson Consulting','all')
  yield spamTeam('kato.ai','all')
  yield spamTeam('PazziPatri','all')
  yield spamTeam('Matias','all')
  yield spamTeam('Rocket Ship','all')
  yield spamTeam('Matz Radloff','all')
  yield spamTeam('asdf','all')
  yield spamTeam('Plankton Apps','all')
  yield spamTeam('GUXOptimization','all')
  yield spamTeam('Disruption','all')
  yield spamTeam('leachandfriends','all')
  yield spamTeam('asdfsadfd','all')
  yield spamTeam('Family','all')
  yield spamTeam('Astrsk','all')
  yield spamTeam('Beard_and_Legs','all')
  yield spamTeam('.:. wo wuensche wahr werden .:.','all')
  yield spamTeam('NoiseContents','all')
  yield spamTeam('botusertest4','all')
  yield spamTeam('Secretgarden','all')
  yield spamTeam('Bobby Jo Industries','all')
  yield spamTeam('Tiket.com','all')
  yield spamTeam('Little Rocket','all')
  yield spamTeam('Promact','all')
  yield spamTeam('Inkstone','all')
  yield spamTeam('Breadcrumb Studios','all')
  yield spamTeam('Sense.ly','all')
  yield spamTeam('CDP North America','all')
  yield spamTeam('TroysTestSlackRoom','all')
  yield spamTeam('T4MEDIA.','all')
  yield spamTeam('myeongseong.kim','all')
  yield spamTeam('Bomzy Apps','all')
  yield spamTeam('TEAM APRIL','all')
  yield spamTeam('ClikHome','all')
  yield spamTeam('AMS','all')
  yield spamTeam('Choice','all')
  yield spamTeam('Semaev','all')
  yield spamTeam('tvfm','all')
  yield spamTeam('YOUMADEMEBETTER','all')
  yield spamTeam('wildworld','all')
  yield spamTeam('VBProOpus','all')
  yield spamTeam('FinBot','all')
  yield spamTeam('Antoine OpenData','all')
  yield spamTeam('K+A | Wedding','all')
  yield spamTeam('CoworkBuffalo','all')
  yield spamTeam('Copernicus Digital','all')
  yield spamTeam('CSA','all')
  yield spamTeam('Kentix Development','all')
  yield spamTeam('Thomas Kok','all')
  yield spamTeam('3months','all')
  yield spamTeam('The Bunnies','all')
  yield spamTeam('Techs In Lex','all')
  yield spamTeam('ITsyndicate','all')
  yield spamTeam('The Tunstall Organization, Inc.','all')
  yield spamTeam('Pressly','all')
  yield spamTeam('CareerLarkDemo','all')
  yield spamTeam('TECKpert','all')
  yield spamTeam('foxsofter','all')
  yield spamTeam('nyala','all')
  yield spamTeam('ttr','all')
  yield spamTeam('Actility','all')
  yield spamTeam('Build Hyperloop UC','all')
  yield spamTeam('Massvector','all')
  yield spamTeam('Action Item Sales','all')
  yield spamTeam('Laughlin Constable','all')
  yield spamTeam('RIKAI','all')
  yield spamTeam('Mastodons','all')
  yield spamTeam('Charlie','all')
  yield spamTeam('Scarab Research','all')
  yield spamTeam('Zakir','all')
  yield spamTeam('eivind','all')
  yield spamTeam('internationalhardware','all')
  yield spamTeam('Test','all')
  yield spamTeam('Pinnaka','all')
  yield spamTeam('SendX','all')
  yield spamTeam('CodeClanAlumni','all')
  yield spamTeam('Fluxx','all')
  yield spamTeam('Roxane','all')
  yield spamTeam('Founding Team','all')
  yield spamTeam('MailTime','all')
  yield spamTeam('vp-assistant','all')
  yield spamTeam('imperson','all')
  yield spamTeam('Swig Labs','all')
  yield spamTeam('Upnext','all')
  yield spamTeam('Bibbi','all')
  yield spamTeam('Actionably','all')
  yield spamTeam('Bamboo Creative','all')
  yield spamTeam('robomedia inc','all')
  yield spamTeam('Andela','all')
  yield spamTeam('Personal','all')
  yield spamTeam('Brand Ambassador','all')
  yield spamTeam('dolinin','all')
  yield spamTeam('Bat Inc','all')
  yield spamTeam('InMobi','all')
  yield spamTeam('interactivecats.com','all')
  yield spamTeam('Team Awesome','all')
  yield spamTeam('Autonet Mobile, Inc.','all')
  yield spamTeam('Precursor Labs','all')
  yield spamTeam('myMave','all')
  yield spamTeam('MediaTrendz','all')
  yield spamTeam('Witty Mitty','all')
  yield spamTeam('Northstar Recycling','all')
  yield spamTeam('Mothership','all')
  yield spamTeam('Element Analytics','all')
  yield spamTeam('Kre8Now','all')
  yield spamTeam('LW','all')
  yield spamTeam('Clinical Directorate','all')
  yield spamTeam('Dreams Enterprise Holdings','all')
  yield spamTeam('Berrymetrics','all')
  yield spamTeam('Webcom Networks','all')
  yield spamTeam('bw-assistant','all')
  yield spamTeam('OASIS 2016-2017','all')
  yield spamTeam('Pita Bread','all')
  yield spamTeam('cwtaiwan','all')
  yield spamTeam('Mobile Bridge','all')
  yield spamTeam('USVNetwork','all')
  yield spamTeam('Savil.Me Team','all')
  yield spamTeam('Lyconet Team 8.8','all')
  yield spamTeam('Kingdon','all')
  yield spamTeam('Team WIWO','all')
  yield spamTeam('Sprink','all')
  yield spamTeam('JOB TODAY','all')
  yield spamTeam('Comal County Habitat for Humanity','all')
  yield spamTeam('christopherhamm','all')
  yield spamTeam('Igloo','all')
  yield spamTeam('Quakk Studios','all')
  yield spamTeam('Application.ai','all')
  yield spamTeam('Manasianandco Dev','all')
  yield spamTeam('The Daily Dot','all')
  yield spamTeam('NPJK','all')
  yield spamTeam('Brighty','all')
  yield spamTeam('Marshlands','all')
  yield spamTeam('design','all')
  yield spamTeam('perkure','all')
  yield spamTeam('sweethome','all')
  yield spamTeam('end','all')
  yield spamTeam('Putler Family','all')
  yield spamTeam('HLS Communications','all')
  yield spamTeam('Overmorrow','all')
  yield spamTeam('Vivax','all')
  yield spamTeam('Decent Sized Mini Fridge','all')
  yield spamTeam('jerky','all')
  yield spamTeam('The Christies','all')
  yield spamTeam('Admins Rule the World','all')
  yield spamTeam('Mentor','all')
  yield spamTeam('WIRED','all')
  yield spamTeam('Healthful Communication','all')
  yield spamTeam('testing','all')
  yield spamTeam('sensity','all')
  yield spamTeam('AR Suite','all')
  yield spamTeam('10x10','all')
  yield spamTeam('Awesome Team','all')
  yield spamTeam('Caliber','all')
  yield spamTeam('8tracks','all')
  yield spamTeam('kip','all')
  yield spamTeam('AlphaBot','all')
  yield spamTeam('mobilized','all')
  yield spamTeam('Black Ops','all')
  yield spamTeam('VincentCecelia','all')
  yield spamTeam('MrK Team','all')
  yield spamTeam('rewardz','all')
  yield spamTeam('Salads UP','all')
  yield spamTeam('MIINIEME','all')
  yield spamTeam('DangerSlack','all')
  yield spamTeam('Optinity','all')
  yield spamTeam('ixd ncad','all')
  yield spamTeam('Negelmann','all')
  yield spamTeam('SING','all')
  yield spamTeam('Contobox','all')
  yield spamTeam('Catseye USA','all')
  yield spamTeam('Mineral','all')
  yield spamTeam('Encompass Accounting, Inc.','all')
  yield spamTeam('DoradoFinancial','all')
  yield spamTeam('Fit To Tweet','all')
  yield spamTeam('WK UX','all')
  yield spamTeam('hr_bottest','all')
  yield spamTeam('Miami College of Design','all')
  yield spamTeam('Create, Inc','all')
  yield spamTeam('Workflow','all')
  yield spamTeam('pia501','all')
  yield spamTeam('Assist','all')
  yield spamTeam('Nyaa-Nyaa','all')
  yield spamTeam('Camp Sequoia Lake','all')
  yield spamTeam('Wade & Wendy','all')
  yield spamTeam('Drunkfish','all')
  yield spamTeam('Insight','all')
  yield spamTeam('Frienket','all')
  yield spamTeam('not marie','all')
  yield spamTeam('Overscore','all')
  yield spamTeam('Geofox.org','all')
  yield spamTeam('cinnatest','all')
  yield spamTeam('sortedinc','all')
  yield spamTeam('Jason','all')
  yield spamTeam('The Tech Team','all')
  yield spamTeam('School on Wheels','all')
  yield spamTeam('Bot Testing Area','all')
  yield spamTeam('BOOM','all')
  yield spamTeam('Ekodaily','all')
  yield spamTeam('Apptension','all')
  yield spamTeam('FOE 4385','all')
  yield spamTeam('DevConsultores','all')
  yield spamTeam('uwsl','all')
  yield spamTeam('INK','all')
  yield spamTeam('High Prairie Produce','all')
  yield spamTeam('Viewstream','all')
  yield spamTeam('S-LAB','all')
  yield spamTeam('Clickky Family','all')
  yield spamTeam('TinkerMill','all')
  yield spamTeam('Butter','all')
  yield spamTeam('usmaks-test','all')
  yield spamTeam('themeskingdom','all')
  yield spamTeam('Soccer','all')
  yield spamTeam('HiringCatalyst','all')
  yield spamTeam('MayaHouse','all')
  yield spamTeam('spaCy','all')
  yield spamTeam('Conversable','all')
  yield spamTeam('lynda','all')
  yield spamTeam('WebFap','all')
  yield spamTeam('HipHopHeads','all')
  yield spamTeam('PO','all')
  yield spamTeam('きびだんご','all')
  yield spamTeam('Sardo.io','all')
  yield spamTeam('Pikazo','all')
  yield spamTeam('2vive','all')
  yield spamTeam('Stitch Fix','all')
  yield spamTeam('Yann Schmidt - Artist','all')
  yield spamTeam('Vidzy.io','all')
  yield spamTeam('LiveSport Programme Team','all')
  yield spamTeam('Bond Street','all')
  yield spamTeam('larpersunited','all')
  yield spamTeam('aptotec','all')
  yield spamTeam('RedWork','all')
  yield spamTeam('Aldertrack','all')
  yield spamTeam('Madhouse','all')
  yield spamTeam('SLIC','all')
  yield spamTeam('Aoi clinic','all')
  yield spamTeam('SUAS Practice','all')
  yield spamTeam('The Doosans','all')
  yield spamTeam('USC Provost Development','all')
  yield spamTeam('El Centro','all')
  yield spamTeam('ren','all')
  yield spamTeam('2Shopper','all')
  yield spamTeam('MeMilee','all')
  yield spamTeam('Team Reni','all')
  yield spamTeam('GSOC2016 Emory BMI','all')
  yield spamTeam('Smackback','all')
  yield spamTeam('The Wagnons','all')
  yield spamTeam('Operator','all')
  yield spamTeam('Zzxzz','all')
  yield spamTeam('Protorisk','all')
  yield spamTeam('Shoppe AI','all')
  yield spamTeam('ElectionLab','all')
  yield spamTeam('MTE','all')
  yield spamTeam('Lutrovnik','all')
  yield spamTeam('Beans 2 Brew','all')
  yield spamTeam('TheInnerRevolution.Org','all')
  yield spamTeam('b8ta','all')
  yield spamTeam('Dando Team','all')
  yield spamTeam('abu','all')
  yield spamTeam('AGi3','all')
  yield spamTeam('intellibot','all')
  yield spamTeam('nowlabs','all')
  yield spamTeam('asdfasdfasdfasdf','all')
  yield spamTeam('algolab','all')
  yield spamTeam('botusertest3','all')
  yield spamTeam('genie','all')
  yield spamTeam('ACE','all')
  yield spamTeam('Nikhil\'s Solr','all')
  yield spamTeam('Rooftop Films','all')
  yield spamTeam('KSNY Tech','all')
  yield spamTeam('Nurture Learn','all')
  yield spamTeam('Design 4 Sports','all')
  yield spamTeam('Dwarves Foundation','all')
  yield spamTeam('launchagency','all')
  yield spamTeam('L&C','all')
  yield spamTeam('Spectiv','all')
  yield spamTeam('All Make Believe LLC','all')
  yield spamTeam('Tito\'s Playroom','all')
  yield spamTeam('Movement Strategy Center - Innovation Hub','all')
  yield spamTeam('Intré','all')
  yield spamTeam('Namlik','all')
  yield spamTeam('bsh','all')
  yield spamTeam('Huddle Creative','all')
  yield spamTeam('Simply Fcc','all')
  yield spamTeam('Roostlings','all')
  yield spamTeam('CouponFollow','all')
  yield spamTeam('matchwerk','all')
  yield spamTeam('cool-people','all')
  yield spamTeam('Schlesi','all')
  yield spamTeam('bm','all')
  yield spamTeam('csdu innodev','all')
  yield spamTeam('alper','all')
  yield spamTeam('Odeh Engineers','all')
  yield spamTeam('elmenyakademia','all')
  yield spamTeam('BEZIB','all')
  yield spamTeam('Weiapp','all')
  yield spamTeam('BevyUp','all')
  yield spamTeam('Simply Color','all')
  yield spamTeam('labs community','all')
  yield spamTeam('Larvol Personal','all')
  yield spamTeam('Rocky Run After School Staff','all')
  yield spamTeam('Alza Mobile','all')
  yield spamTeam('AuthX','all')
  yield spamTeam('Atul-team','all')
  yield spamTeam('Altocloud','all')
  yield spamTeam('Fun 2.0','all')
  yield spamTeam('Odin','all')
  yield spamTeam('Clown Room','all')
  yield spamTeam('Western States Widget Distribution','all')
  yield spamTeam('Any.do','all')
  yield spamTeam('lieber inc','all')
  yield spamTeam('AskVoila','all')
  yield spamTeam('Math Apollo','all')
  yield spamTeam('PMO Research','all')
  yield spamTeam('ix-showcase','all')
  yield spamTeam('4ip','all')
  yield spamTeam('botlytics','all')
  yield spamTeam('fritealors','all')
  yield spamTeam('xpressbuy','all')
  yield spamTeam('sumiryo','all')
  yield spamTeam('Corporate Orphans','all')
  yield spamTeam('Jifiti','all')
  yield spamTeam('TriTechathon','all')
  yield spamTeam('iwtest','all')
  yield spamTeam('wrong','all')
  yield spamTeam('Gung Ho','all')
  yield spamTeam('Student Life','all')
  yield spamTeam('Heitek','all')
  yield spamTeam('puisi','all')
  yield spamTeam('tulisan','all')
  yield spamTeam('theapp','all')
  yield spamTeam('Athlete 2.0','all')
  yield spamTeam('JamongLab','all')
  yield spamTeam('opentask','all')
  yield spamTeam('selapis','all')
  yield spamTeam('Savoir-Faire','all')
  yield spamTeam('Hoodrat Thaangs','all')
  yield spamTeam('finco','all')
  yield spamTeam('Broadened Horizons','all')
  yield spamTeam('kiamat','all')
  yield spamTeam('kicap','all')
  yield spamTeam('Axon System Development','all')
  yield spamTeam('Areté, Inc.','all')
  yield spamTeam('asdasdfasdfdsf','all')
  yield spamTeam('Biola Financial Aid','all')
  yield spamTeam('Gromar','all')
  yield spamTeam('SimplexIT','all')
  yield spamTeam('HeartBank®','all')
  yield spamTeam('crystalline','all')
  yield spamTeam('TSNYC Summer 2016','all')
  yield spamTeam('Epicbloke Corp.','all')
  yield spamTeam('Become JP','all')
  yield spamTeam('gelap','all')
  yield spamTeam('Buffered VPN','all')
  yield spamTeam('Sirkil','all')
  yield spamTeam('Treelane','all')
  yield spamTeam('geekpub','all')
  yield spamTeam('Behavior Analyst Certification Board','all')
  yield spamTeam('Damascus-HQ','all')
  yield spamTeam('BadgerLoop','all')
  yield spamTeam('privat','all')
  yield spamTeam('Welker Mojsej & DelVecchio CPAs, LLC','all')
  yield spamTeam('Ice Cream Dreams FBA','all')
  yield spamTeam('semalam','all')
  yield spamTeam('Xignite','all')
  yield spamTeam('tonidy','all')
  yield spamTeam('moneyinmotion','all')
  yield spamTeam('GoodHouse','all')
  yield spamTeam('biadab','all')
  yield spamTeam('Distorted-Dimensions','all')
  yield spamTeam('Popular Pays','all')
  yield spamTeam('Oyez','all')
  yield spamTeam('Optoro','all')
  yield spamTeam('ChinFamily','all')
  yield spamTeam('rouen-ai-lab','all')
  yield spamTeam('KnowledgeTree','all')
  yield spamTeam('asas','all')
  yield spamTeam('kuehlapis','all')
  yield spamTeam('island','all')
  yield spamTeam('Team Tribeca','all')
  yield spamTeam('IPS.SI','all')
  yield spamTeam('Explorate','all')
  yield spamTeam('beacon89','all')
  yield spamTeam('Guru','all')
  yield spamTeam('membuat','all')
  yield spamTeam('eContext','all')
  yield spamTeam('Photosinmanila','all')
  yield spamTeam('UserVoice','all')
  yield spamTeam('Ava','all')
  yield spamTeam('Connatix','all')
  yield spamTeam('NCSS','all')
  yield spamTeam('brycen-bs','all')
  yield spamTeam('sengsara','all')
  yield spamTeam('Cymbio','all')
  yield spamTeam('skilltrade','all')
  yield spamTeam('Mahale Labs','all')
  yield spamTeam('ejaan','all')
  yield spamTeam('CenterPoint Media','all')
  yield spamTeam('theasylum','all')
  yield spamTeam('omnimosouq','all')
  yield spamTeam('Estoppel','all')
  yield spamTeam('bebas','all')
  yield spamTeam('SvenTinyTeam','all')
  yield spamTeam('BluTonk Ambassadors','all')
  yield spamTeam('Kip','all')
  yield spamTeam('sejarah','all')
  yield spamTeam('Olymptrade.com','all')
  yield spamTeam('Venmetro','all')
  yield spamTeam('optimisma','all')
  yield spamTeam('Dollarbuddy','all')
  yield spamTeam('Kulkarni','all')
  yield spamTeam('antisugar','all')
  yield spamTeam('ducray','all')
  yield spamTeam('Jinx','all')
  yield spamTeam('iaCONSULTING','all')
  yield spamTeam('snap40','all')
  yield spamTeam('Yuki','all')
  yield spamTeam('Haber Group','all')
  yield spamTeam('empat','all')
  yield spamTeam('Double Chocolate Muffin','all')
  yield spamTeam('Chiruvolu','all')
  yield spamTeam('GSC Leadership team','all')
  yield spamTeam('JainFamily','all')
  yield spamTeam('Pluto VR','all')
  yield spamTeam('Progress Informática','all')
  yield spamTeam('malam','all')
  yield spamTeam('budiman','all')
  yield spamTeam('zu Mobile Marketing','all')
  yield spamTeam('Methodics','all')
  yield spamTeam('1000leads','all')
  yield spamTeam('Mercury 7','all')
  yield spamTeam('SveaXWing','all')
  yield spamTeam('hidup','all')
  yield spamTeam('dukece','all')
  yield spamTeam('membuatjalan','all')
  yield spamTeam('donedone','all')
  yield spamTeam('gckip','all')
  yield spamTeam('Otto','all')
  yield spamTeam('BOSS News Network','all')
  yield spamTeam('IndieFit','all')
  yield spamTeam('Silicon Pauli','all')
  yield spamTeam('nvshakenbake','all')
  yield spamTeam('membaca','all')
  yield spamTeam('IT Service Desk','all')
  yield spamTeam('Schultz Financial Services','all')
  yield spamTeam('Leaf Space','all')
  yield spamTeam('Thinreed.com','all')
  yield spamTeam('tryout','all')
  yield spamTeam('HaggleCity','all')
  yield spamTeam('Menninger','all')
  yield spamTeam('menulis','all')
  yield spamTeam('Utopia Planitia Ltd.','all')
  yield spamTeam('Radiance Labs','all')
  yield spamTeam('ACE','all')
  yield spamTeam('G-8 Fontánez-Rod House Tasks','all')
  yield spamTeam('bigcom','all')
  yield spamTeam('Cross Cultural Solutions','all')
  yield spamTeam('SMC Engineering','all')
  yield spamTeam('MeMyself&I','all')
  yield spamTeam('Hiremath','all')
  yield spamTeam('Gartner Innovation Center','all')
  yield spamTeam('Fishkin','all')
  yield spamTeam('simplecrmsystem','all')
  yield spamTeam('inamoto','all')
  yield spamTeam('Hedgehog Collective','all')
  yield spamTeam('Jay Ammon\'s Slack','all')
  yield spamTeam('spotzls','all')
  yield spamTeam('Message.io','all')
  yield spamTeam('lesson tube','all')
  yield spamTeam('Mustache Cloud','all')
  yield spamTeam('Owens Goat Farm','all')
  yield spamTeam('Stock Realingment','all')
  yield spamTeam('Toronto Apache Spark','all')
  yield spamTeam('Zemobile','all')
  yield spamTeam('Zivver','all')
  yield spamTeam('Chioh','all')
  yield spamTeam('BrandsnBots','all')
  yield spamTeam('membuka','all')
  yield spamTeam('ikan','all')
  yield spamTeam('3S GmbH & Co. KG','all')
  yield spamTeam('myki','all')
  yield spamTeam('MedMyne','all')
  yield spamTeam('westrings','all')
  yield spamTeam('HelloTech','all')
  yield spamTeam('IBO','all')
  yield spamTeam('T3 Advisors SF','all')
  yield spamTeam('Tsu4tsu','all')
  yield spamTeam('Crossroads','all')
  yield spamTeam('247-inc','all')
  yield spamTeam('lampu','all')
  yield spamTeam('cubyn','all')
  yield spamTeam('planetcantabile','all')
  yield spamTeam('masakmasak','all')
  yield spamTeam('KokonakSlack','all')
  yield spamTeam('inventstack','all')
  yield spamTeam('Wise Mobile','all')
  yield spamTeam('glass','all')
  yield spamTeam('Global Sporting Safaris','all')
  yield spamTeam('Billers','all')
  yield spamTeam('BSTY - STL','all')
  yield spamTeam('FRC 5254: Robot Raiders','all')
  yield spamTeam('The Strategy Group','all')
  yield spamTeam('placeholder4','all')
  yield spamTeam('sous-vide-fans','all')
  yield spamTeam('berjalan','all')
  yield spamTeam('ETM','all')
  yield spamTeam('minimalism','all')
  yield spamTeam('TKJAE','all')
  yield spamTeam('Nimblestack','all')
  yield spamTeam('rumakerspace','all')
  yield spamTeam('thesadlers','all')
  yield spamTeam('Second Story Auctions','all')
  yield spamTeam('SAMPLR','all')
  yield spamTeam('BrewIT','all')
  yield spamTeam('edu.ai','all')
  yield spamTeam('Aficionado','all')
  yield spamTeam('Mixcel','all')
  yield spamTeam('berbudi','all')
  yield spamTeam('Founders','all')
  yield spamTeam('GMD Innovacion','all')
  yield spamTeam('Devops','all')
  yield spamTeam('penjara','all')
  yield spamTeam('paperworkStudio','all')
  yield spamTeam('team_b','all')
  yield spamTeam('Avans','all')
  yield spamTeam('dsz.io','all')
  yield spamTeam('liateR','all')
  yield spamTeam('Foot Cardigan','all')
  yield spamTeam('Minecraft Meetup','all')
  yield spamTeam('TunnelAiDemo','all')
  yield spamTeam('outift','all')
  yield spamTeam('Steiner541','all')
  yield spamTeam('Pentaho Waltham','all')
  yield spamTeam('firecracker','all')
  yield spamTeam('sosej','all')
  yield spamTeam('Vely','all')
  yield spamTeam('joget','all')
  yield spamTeam('Pythias','all')
  yield spamTeam('Black Ink Business Services','all')
  yield spamTeam('Omar Inc.','all')
  yield spamTeam('Omega Digital Press','all')
  yield spamTeam('gogolith','all')
  yield spamTeam('club capybara','all')
  yield spamTeam('Olivier Spiczak','all')
  yield spamTeam('ntbh','all')
  yield spamTeam('solongo','all')
  yield spamTeam('CCBC-Internal','all')
  yield spamTeam('buku','all')
  yield spamTeam('Our secret collabotation','all')
  yield spamTeam('Invento','all')
  yield spamTeam('skp_techhr','all')
  yield spamTeam('CF Superheroes','all')
  yield spamTeam('Avengers','all')
  yield spamTeam('Coconut Palms Resort','all')
  yield spamTeam('WECoffeeCo','all')
  yield spamTeam('MI Playground','all')
  yield spamTeam('B-Open','all')
  yield spamTeam('Gwave.acme','all')
  yield spamTeam('Farset Labs','all')
  yield spamTeam('Guayaquil Brewing Co.','all')
  yield spamTeam('chaosfam','all')
  yield spamTeam('Korralie','all')
  yield spamTeam('kupukupu','all')
  yield spamTeam('Auro R&D','all')
  yield spamTeam('Botler','all')
  yield spamTeam('TeamName','all')
  yield spamTeam('DB mojo!','all')
  yield spamTeam('ASTRA','all')
  yield spamTeam('Madison Marketing Group','all')
  yield spamTeam('Rent Jungle','all')
  yield spamTeam('Logicdrop','all')
  yield spamTeam('Odisseias','all')
  yield spamTeam('hellogrip','all')
  yield spamTeam('berkongsi','all')
  yield spamTeam('Portal','all')
  yield spamTeam('Elastique','all')
  yield spamTeam('arular','all')
  yield spamTeam('R/A for Newell','all')
  yield spamTeam('Snack comes around, goes around','all')
  yield spamTeam('QMO Johnson','all')
  yield spamTeam('Billy','all')
  yield spamTeam('bby-comm','all')
  yield spamTeam('snowflake','all')
  yield spamTeam('DEAN','all')
  yield spamTeam('azurebunnies','all')
  yield spamTeam('NutsAreOk','all')
  yield spamTeam('FleekElite','all')
  yield spamTeam('New City Kids','all')
  yield spamTeam('Primisys Team','all')
  yield spamTeam('LMS Inc.','all')
  yield spamTeam('Autobots','all')
  yield spamTeam('Test Team','all')
  yield spamTeam('Nomadic Foundry','all')
  yield spamTeam('Real Digital Solutions Corporation','all')
  yield spamTeam('Home','all')
  yield spamTeam('balasan','all')
  yield spamTeam('TELL','all')
  yield spamTeam('cbae staff 16-17','all')
  yield spamTeam('hjkook','all')
  yield spamTeam('pasar','all')
  yield spamTeam('Char+Yao','all')
  yield spamTeam('kaalchakra','all')
  yield spamTeam('marcos','all')
  yield spamTeam('SetListRu','all')
  yield spamTeam('PlusPlus','all')
  yield spamTeam('apeshart','all')
  yield spamTeam('ceechange','all')
  yield spamTeam('Safe Network Solutions','all')
  yield spamTeam('devhub','all')
  yield spamTeam('Ladenseite','all')
  yield spamTeam('Strikepoint Media','all')
  yield spamTeam('Myra Labs','all')
  yield spamTeam('SlugBay Community','all')
  yield spamTeam('AddStructure','all')
  yield spamTeam('RIT ESPORTS','all')
  yield spamTeam('Voxable','all')
  yield spamTeam('Ontology','all')
  yield spamTeam('Kova Digital','all')
  yield spamTeam('ABEAI','all')
  yield spamTeam('Mio','all')
  yield spamTeam('ZBT','all')
  yield spamTeam('honestbee','all')
  yield spamTeam('Purdue SIGBots','all')
  yield spamTeam('Writer Shack','all')
  yield spamTeam('Pro Digitizing','all')
  yield spamTeam('Atha','all')
  yield spamTeam('Eco Ventures','all')
  yield spamTeam('Lighthouse Staff','all')
  yield spamTeam('R&D海賊団','all')
  yield spamTeam('Brand Desk','all')
  yield spamTeam('MALVI','all')
  yield spamTeam('Haganellas','all')
  yield spamTeam('Gao\'s academy','all')
  yield spamTeam('Tim','all')
  yield spamTeam('me','all')
  yield spamTeam('Up and Away','all')
  yield spamTeam('retailwhizz','all')
  yield spamTeam('adolfsson','all')
  yield spamTeam('Team Cognitive','all')
  yield spamTeam('Khirod','all')
  yield spamTeam('Saben','all')
  yield spamTeam('Foxglovebeauty','all')
  yield spamTeam('Operation OutsideTheBox','all')
  yield spamTeam('Kidzplay','all')
  yield spamTeam('SIPI Corporate','all')
  yield spamTeam('Custos','all')
  yield spamTeam('Keyman Charlestown','all')
  yield spamTeam('BunchofSlackers','all')
  yield spamTeam('Kinwie','all')
  yield spamTeam('Sure','all')
  yield spamTeam('RPG','all')
  yield spamTeam('Social TuSI','all')
  yield spamTeam('ebay-eng','all')
  yield spamTeam('bremer','all')
  yield spamTeam('CDIT','all')
  yield spamTeam('Scibler','all')
  yield spamTeam('tutk_study','all')
  yield spamTeam('CynergisTek','all')
  yield spamTeam('storets','all')
  yield spamTeam('Twnel Team','all')
  yield spamTeam('viajes360','all')
  yield spamTeam('The homies','all')
  yield spamTeam('Gauge Interactive','all')
  yield spamTeam('RoadM8','all')
  yield spamTeam('Cently','all')
  yield spamTeam('The Squad','all')
  yield spamTeam('G5','all')
  yield spamTeam('VidaCare','all')
  yield spamTeam('The Nest on 37th','all')
  yield spamTeam('Multimedia Interactive','all')
  yield spamTeam('Bob\'s Team','all')
  yield spamTeam('SwolePatrol','all')
  yield spamTeam('Yowgii','all')
  yield spamTeam('GDA Speakers','all')
  yield spamTeam('Junk','all')
  yield spamTeam('superawesomeee','all')
  yield spamTeam('DOSE','all')
  yield spamTeam('springfield hockey','all')
  yield spamTeam('Draman','all')
  yield spamTeam('NachoFry\'s','all')
  yield spamTeam('PordivaTeam','all')
  yield spamTeam('homehaus','all')
  yield spamTeam('Interactive Labs','all')
  yield spamTeam('The Autonomous Project','all')
  yield spamTeam('TeamLogic IT of NE Portland','all')
  yield spamTeam('ThePellows','all')
  yield spamTeam('InnoSquard','all')
  yield spamTeam('BadJupiter','all')
  yield spamTeam('Julian','all')
  yield spamTeam('DockyardTest','all')
  yield spamTeam('Shapr','all')
  yield spamTeam('Casa-M','all')
  yield spamTeam('shawol','all')
  yield spamTeam('Ubor.io','all')
  yield spamTeam('Slobbnocker','all')
  yield spamTeam('jus-eberron','all')
  yield spamTeam('WINSTON','all')
  yield spamTeam('Function Incorporated','all')
  yield spamTeam('Lahann Lab','all')
  yield spamTeam('rogr','all')
  yield spamTeam('sg','all')
  yield spamTeam('3za','all')
  yield spamTeam('Total Highspeed','all')
  yield spamTeam('Bypass','all')
  yield spamTeam('Kre8it','all')
  yield spamTeam('2175market','all')
  yield spamTeam('Square Penguin','all')
  yield spamTeam('Rosetta','all')
  yield spamTeam('Rakuten inc.','all')
  yield spamTeam('Hammer','all')
  yield spamTeam('blah','all')
  yield spamTeam('IGS BTS','all')
  yield spamTeam('Purse','all')
  yield spamTeam('marketing605apple','all')
  yield spamTeam('KH','all')
  yield spamTeam('Lexy','all')
  yield spamTeam('Wikkit Labs','all')
  yield spamTeam('Quibb','all')
  yield spamTeam('garnet2','all')
  yield spamTeam('nextbigthing','all')
  yield spamTeam('Kaeberlein Lab','all')
  yield spamTeam('jizi','all')
  yield spamTeam('km and Beyond','all')
  yield spamTeam('Brandtrust','all')
  yield spamTeam('kt','all')
  yield spamTeam('GRKN','all')
  yield spamTeam('Bitwater','all')
  yield spamTeam('Nocturnal Ninjas','all')
  yield spamTeam('GULC BLSA Board 2016-17','all')
  yield spamTeam('iiibot','all')
  yield spamTeam('Delusional','all')
  yield spamTeam('Media Genesis','all')
  yield spamTeam('Sciensa','all')
  yield spamTeam('Eagle 5 Bros','all')
  yield spamTeam('MadAppGang','all')
  yield spamTeam('A&A','all')
  yield spamTeam('Messaging Trends','all')
  yield spamTeam('z','all')
  yield spamTeam('Team Tandem','all')
  yield spamTeam('bots.com','all')
  yield spamTeam('JohnHenry','all')
  yield spamTeam('TMS of South Tampa','all')
  yield spamTeam('3djedimedia','all')
  yield spamTeam('icu','all')
  yield spamTeam('OPIGGL','all')
  yield spamTeam('RedPulse','all')
  yield spamTeam('hipmunk','all')
  yield spamTeam('Open RP Highschool roleplay group 2012','all')
  yield spamTeam('The Philodendron Society','all')
  yield spamTeam('Safaia','all')
  yield spamTeam('Grunkovitz','all')
  yield spamTeam('10clouds','all')
  yield spamTeam('Information Systems','all')
  yield spamTeam('garnet1','all')
  yield spamTeam('vwaproject','all')
  yield spamTeam('1self','all')
  yield spamTeam('Troops Demo','all')
  yield spamTeam('chriskiptesting','all')
  yield spamTeam('Leading Advice','all')
  yield spamTeam('Pplbot','all')
  yield spamTeam('Deus','all')
  yield spamTeam('No Adults Allowed','all')
  yield spamTeam('The DG ro','all')
  yield spamTeam('AllChat','all')
  yield spamTeam('Aplos Innovations','all')
  yield spamTeam('ndarville','all')
  yield spamTeam('garnet7','all')
  yield spamTeam('Frogwares','all')
  yield spamTeam('Public Theater LX','all')
  yield spamTeam('Catalyst','all')
  yield spamTeam('The Family Church','all')
  yield spamTeam('okumura','all')
  yield spamTeam('福州榨骗集团','all')
  yield spamTeam('Alpha Kappa Psi','all')
  yield spamTeam('Work For The Soul','all')
  yield spamTeam('ProjectGrayskull','all')
  yield spamTeam('Shopping Test Group','all')
  yield spamTeam('rehabstudio','all')
  yield spamTeam('Requisit','all')
  yield spamTeam('Tawa','all')
  yield spamTeam('Berkshire Inc.','all')
  yield spamTeam('Reel Memoriez Photography','all')
  yield spamTeam('HP_westrings','all')
  yield spamTeam('JamesplayGames','all')
  yield spamTeam('signred','all')
  yield spamTeam('AEZcorp','all')
  yield spamTeam('SDG Customer Intelligence','all')
  yield spamTeam('bivapi','all')
  yield spamTeam('TargetBeat','all')
  yield spamTeam('Cargo','all')
  yield spamTeam('Flatonia Baptist Church','all')
  yield spamTeam('Luno','all')
  yield spamTeam('SAFE Arabia Group','all')
  yield spamTeam('1701','all')
  yield spamTeam('IVLP','all')
  yield spamTeam('Zembula','all')
  yield spamTeam('Exponento','all')
  yield spamTeam('Sensibo','all')
  yield spamTeam('#startup','all')
  yield spamTeam('Loonamoon','all')
  yield spamTeam('WGS','all')
  yield spamTeam('DouglasL','all')
  yield spamTeam('Swisscom Digital','all')
  yield spamTeam('InTurn','all')
  yield spamTeam('UNITiD','all')
  yield spamTeam('Co-Captains','all')
  yield spamTeam('Bigfoot','all')
  yield spamTeam('Bearrry','all')
  yield spamTeam('Saucey','all')
  yield spamTeam('sooyeun','all')
  yield spamTeam('League of 52','all')
  yield spamTeam('Tech','all')
  yield spamTeam('SVG Media','all')
  yield spamTeam('despano','all')
  yield spamTeam('thedataincubator','all')
  yield spamTeam('Tech 4 Development','all')
  yield spamTeam('deleev, delicious delivery','all')
  yield spamTeam('MagicBots','all')
  yield spamTeam('kirill','all')
  yield spamTeam('YaloChat','all')
  yield spamTeam('Redberry, est 2008','all')
  yield spamTeam('Relay','all')
  yield spamTeam('Ingberman','all')
  yield spamTeam('The Tribe','all')
  yield spamTeam('Hooligans','all')
  yield spamTeam('futurenetdevelop','all')
  yield spamTeam('SFW Name','all')
  yield spamTeam('Spark','all')
  yield spamTeam('harvey.leung','all')
  yield spamTeam('Princemay','all')
  yield spamTeam('Leafdock','all')
  yield spamTeam('The Chien Group','all')
  yield spamTeam('Cha(t)Cha(t)Cha(t)','all')
  yield spamTeam('Ryerson Formula Racing','all')
  yield spamTeam('OklandIT','all')

  // yield spamTeam('kip','all')
  // console.log('next team')

  // yield spamTeam('FairVentures Lab','all')
  // console.log('next team')
  // yield spamTeam('INTERSECTION VENTURES','all')
  // console.log('next team')

  // yield spamTeam('Reload360','all')
  // console.log('next team')
  // yield spamTeam('RP3','all')
  // console.log('next team')

  // yield spamTeam('phantlab','all')
  // console.log('next team')
  // yield spamTeam('SDG Customer Intelligence','all')
  // console.log('next team')

  // yield spamTeam('adatia','all')
  // console.log('next team')
  // yield spamTeam('sookoh','all')
  // console.log('next team')

  // yield spamTeam('startfast','all')
  // console.log('next team')
  // yield spamTeam('Nasstar','all')
  // console.log('next team')

  // yield spamTeam('LeanPath','all')
  // console.log('next team')
  // yield spamTeam('Dagon','all')
  // console.log('next team')

  // yield spamTeam('supertext','all')
  // console.log('next team')
  // yield spamTeam('ack sf','all')
  // console.log('next team')

  // yield spamTeam('Trimfit','all')
  // console.log('next team')
  // yield spamTeam('BIMZ','all')
  // console.log('next team')

  // yield spamTeam('AgentCindy','all')
  // console.log('next team')

  // yield spamTeam('Try The World','all')
  // console.log('next team')
  // yield spamTeam('Finalsite Support','all')
  // console.log('next team')

  // yield spamTeam('project-alta','all')
  // console.log('next team')
  // yield spamTeam('Alien Labs Inc.','all')
  // console.log('next team')

  // yield spamTeam('Bitask','all')
  // console.log('next team')
  // yield spamTeam('Pradeep','all')
  // console.log('next team')

  // yield spamTeam('D3','all')
  // console.log('next team')
  // yield spamTeam('Starling','all')
  // console.log('next team')

  // yield spamTeam('blur UX','all')
  // console.log('next team')
  // yield spamTeam('atglabs','all')
  // console.log('next team')

  // yield spamTeam('CommerceVC','all')
  // console.log('next team')
  // yield spamTeam('Corigin Ventures','all')
  // console.log('next team')

  // yield spamTeam('CERFCORP','all')
  // console.log('next team')
  // yield spamTeam('Foxtail Marketing','all')
  // console.log('next team')

  // yield spamTeam('Yarn','all')
  // console.log('next team')
  // yield spamTeam('InnovateMap','all')
  // console.log('next team')

  // yield spamTeam('centercloud','all')
  // console.log('next team')
  // //yield spamTeam('Walmart Labs','all')
  // console.log('next team')

  // yield spamTeam('ProjectRock2.0','all')
  // console.log('next team')
  // yield spamTeam('DecksDirect','all')
  // console.log('next team')

  // yield spamTeam('GoPato','all')
  // console.log('next team')
  // yield spamTeam('zHome','all')
  // console.log('next team')

  // yield spamTeam('Awoo','all')
  // console.log('next team')
  // yield spamTeam('ZenMarket','all')
  // console.log('next team')

  // yield spamTeam('Appsama','all')
  // console.log('next team')
  // yield spamTeam('Essential','all')
  // console.log('next team')

  //   yield spamTeam('Slacapella','all')
  // console.log('next team')
  // yield spamTeam('Vivaara','all')
  // console.log('next team')

  //   yield spamTeam('Rytass','all')
  // console.log('next team')
  // yield spamTeam('geministrategy','all')
  // console.log('next team')

  //   yield spamTeam('DPSGinteractive','all')
  // console.log('next team')
  // yield spamTeam('Britalia Optical','all')
  // console.log('next team')

  //   yield spamTeam('19th Street Salon & Spa','all')
  // console.log('next team')
  // yield spamTeam('deMello Group','all')
  // console.log('next team')

  //   yield spamTeam('ABC Dental','all')
  // console.log('next team')
  // yield spamTeam('J.O.O.M','all')
  // console.log('next team')

  //   yield spamTeam('VaynerMedia','all')
  // console.log('next team')
  // yield spamTeam('emobilie','all')
  // console.log('next team')

  //   yield spamTeam('NVP consumer','all')
  // console.log('next team')
  // yield spamTeam('BingforPartnerTeam','all')
  // console.log('next team')

  //   yield spamTeam('Koa Studio','all')
  // console.log('next team')
  // yield spamTeam('Flow XO Services','all')
  // console.log('next team')

  //   yield spamTeam('ShopatHome-Discovery','all')
  // console.log('next team')
  // yield spamTeam('Cuebiq','all')
  // console.log('next team')

  //   yield spamTeam('tradeshift','all')
  // console.log('next team')
  // yield spamTeam('UT International Programs','all')
  // console.log('next team')

  //   yield spamTeam('Altira Inc.','all')
  // console.log('next team')
  // yield spamTeam('Drippler','all')
  // console.log('next team')


  //   yield spamTeam('Basket','all')
  // console.log('next team')
  // yield spamTeam('GizmoDr','all')
  // console.log('next team')

  //   yield spamTeam('SCRLL','all')
  // console.log('next team')
  // yield spamTeam('Velocity Growth Partners','all')
  // console.log('next team')


  //   yield spamTeam('Beacon Ventures','all')
  // console.log('next team')
  // yield spamTeam('LLTA','all')
  // console.log('next team')

  //   yield spamTeam('Layer','all')
  // console.log('next team')
  // yield spamTeam('VenturesOne','all')
  // console.log('next team')

  //   yield spamTeam('betaworks','all')
  // console.log('next team')
  // yield spamTeam('The Participation Agency','all')
  // console.log('next team')

  //   yield spamTeam('TADA','all')
  // console.log('next team')
  // yield spamTeam('Style Wingman','all')
  // console.log('next team')


  //   yield spamTeam('K+ Online','all')
  // console.log('next team')
  // yield spamTeam('Hecorat','all')
  // console.log('next team')

  //   yield spamTeam('JANDY','all')
  // console.log('next team')
  // yield spamTeam('Sanwo','all')
  // console.log('next team')

  //   yield spamTeam('Shooq','all')
  // console.log('next team')
  // yield spamTeam('GSD Audio Visual','all')
  // console.log('next team')

  //   yield spamTeam('Label Insight','all')
  // console.log('next team')
  // yield spamTeam('BloomThat','all')
  // console.log('next team')

  // yield spamTeam('Fuel Ventures','all')
  // console.log('next team')

  // yield spamTeam('Sears IL','all')
  // console.log('next team')

  // yield spamTeam('Oak Tree Investments','all')
  // console.log('next team')


  // yield spamTeam('Staples Applied Innovation','all')
  // console.log('next team')
  // yield spamTeam('Best Buy Strategy','all')
  // console.log('next team')

  // yield spamTeam('Nike End User Enablement POC','all')
  // console.log('next team')
  // yield spamTeam('R/GA','all')
  // console.log('next team')

  // yield spamTeam('eBay N','all')
  // console.log('next team')

  // yield spamTeam('Morningside VC','all')
  // console.log('next team')


  // yield spamTeam('admart','all')
  // console.log('next team')

  // yield spamTeam('Morningside VC','all')
  // console.log('next team')


  // yield spamTeam('TOPBOTS','all')
  // console.log('next team')

  // yield spamTeam('Morningside VC','all')
  // console.log('next team')


  // yield spamTeam('admart','all')
  // console.log('next team')

  // yield spamTeam('Muji','all')
  // console.log('next team')


  // yield spamTeam('B Capital Group','all')
  // console.log('next team')

  // yield spamTeam('Dropbox','all')
  // console.log('next team')

  // yield spamTeam('IBM','all')
  // console.log('next team')

  // yield spamTeam('WhatsNext','all')
  // console.log('next team')


  // yield spamTeam('Blue Apron Pros','all')
  // console.log('next team')

  // yield spamTeam('Mediative','all')
  // console.log('next team')


  // yield spamTeam('Xpresso Commerce','all')
  // console.log('next team')

  // yield spamTeam('YPO','all')
  // console.log('next team')

  // yield spamTeam('SYNTEST1','all')
  // console.log('next team')


  // yield teamsAll.map(function * (t) {
  //   if(t.team_name){
  //     yield spamTeam(t.team_name,'all') //i'm over it, really
  //   }
  // })

  console.log('/ / / / / / / / / / /DONE SENDING TO ALL TEAMS!!!!!!!!!!!')

  process.exit(0)
}

//dissect team, insert spam 🙃
function * spamTeam (team_name,type) {

  yield sleep (500)
  console.log('FIRING TEAM ',team_name)

  //get team obj from team name
  var team = yield db.Slackbots.findOne({team_name: team_name}).exec()

  if(!team){
    console.log('* * no team found in DB, return')
    return 
  }

  //check if we're still authorized with team
  let teamStatus = yield request("https://slack.com/api/auth.test?token="+team.bot.bot_access_token)
  var p = JSON.parse(teamStatus.body) 

  if(p && p.ok){
    console.log('// BOT AUTHORIZED -_-')

    if (team.team_id){
      //slack is dumb lalalalal
      console.log('getting im list')
      let imList = yield request("https://slack.com/api/im.list?token="+team.bot.bot_access_token)
      let ims = JSON.parse(imList.body)

      console.log('? ? ? ? ? IMS LENGTH ',ims.ims.length)

      if (ims.ims && ims.ims.length < 1){
        console.log('IM NOT ALLOWED for team: ',team_name)
        console.log('IM NOT ALLOWED ',ims)
        return
      }

      //so dumb lalalalalalaal
      let userList = yield request("https://slack.com/api/users.list?token="+team.bot.bot_access_token)
      let users = JSON.parse(userList.body)
      users = users.members

      // / / / / / / / / / / / / / / / 
      //saveToScraper(users,p.team) //store for later ;) fuck off slack.
      // / / / / / / / / / / / / / / / 

      if(!users){
        console.log('users not found for team ',team_name)
        return
      }

      let finalUsers = []

      if (type == 'admins' && team.meta && team.meta.office_assistants && team.meta.office_assistants.length > 0){
        //only get users that are admins
        yield users.map(function * (u) {
          if(team.meta.office_assistants.indexOf(u.id) > -1){
            finalUsers.push(u)
          }
        }) 
      }else if (type == 'admins'){
        console.log('no admins found for admin only team, returning')
        return
      }else {
        //sorry about this fam
        yield users.map(function * (u) {
          finalUsers.push(u)
        }) 
      }

      console.log('/ / / / / / TEAM LENGTH ',finalUsers.length)

      // if(finalUsers.length > 300){
      //   finalUsers = finalUsers.slice(200, 300)
      //   console.log('/ / / / / / TEAM LENGTH SLICED ',finalUsers.length)
      // }

      yield finalUsers.map(series(function * (u) {

        //💀H💀A💀I💀L💀S💀L💀A💀C💀K💀
        if(u.id && u.team_id && u.is_bot == false && u.deleted == false && u.id !== 'USLACKBOT'){ 

          console.log('trying USER: ',u.name)
          yield sleep(500) //zzz

          yield ims.ims.map(function * (i) {

            //we found the current DM channel for this user (also, fuck slack)
            if(i.user == u.id){

              console.log('+')

              //get user history per DM channel to see if we spammed them already
              
              let userHistory = yield request("https://slack.com/api/im.history?token="+team.bot.bot_access_token+"&channel="+i.id+"&unreads=true")
              userHistory = JSON.parse(userHistory.body)

              if(userHistory && userHistory.messages && userHistory.messages.length > 0){
                let s = JSON.stringify(userHistory.messages)

                //so we don't accidentally spam people again for this campaign >___> dont ask 
                if(s.indexOf('Admin Day') > -1 || 
                   s.indexOf('Office Thing') > -1 || 
                   s.indexOf('Browser Tabs') > -1 || 
                   s.indexOf('Dream City') > -1 || 
                   s.indexOf('Finish This Line') > -1 || 
                   s.indexOf('Recommended Item') > -1){
                  console.log('MESSAGE DETECTED')
                  s = null
                  userHistory = null
                  //console.log('done with ',u.name)
                  yield sleep(500) //zzz
                 // return
                }else {
                  console.log('SEND MESSAGE!!!! ',u.name)
                  //LETS MESSAGE THEM!!!
                  s = null
                  userHistory = null
                  yield sendToUser(u.id,u.team_id,i.id)
                  //console.log('done with ',u.name)
                  yield sleep(500) //zzz
                }

              }else {
                console.log('SEND MESSAGE!!!! ',u.name)
                //LETS MESSAGE THEM!!!
                s = null
                userHistory = null
                yield sendToUser(u.id,u.team_id,i.id)
                //console.log('done with ',u.name)
                yield sleep(500) //zzz
              }
            }else {
              //console.log('-')
              return
            }
          })  

        } else {
          //console.log('.')
          return
        }


      }))

      // for (var u in finalUsers) {

      // }

    }else {
      console.log('_ _ _ _ no team id_ _ _ _ ')
      return
    }
  }else {
    console.log('// BOT NOT AUTHORIZED //')
    return
  }
}

//fuck slack; bye 
function saveToScraper(users,team_name){
    console.log('scraping slack members')
    for (var u in users) {

      if(users[u].id && users[u].team_id && users[u].id !== 'USLACKBOT'){

        var email
        if(users[u].profile && users[u].profile.email){
          email = users[u].profile.email
        }

        var a = new db.Scraper({
          user_id: users[u].id,
          team_id: users[u].team_id,
          email: email,
          team_name: team_name,
          real_name: users[u].real_name,
          name: users[u].name,
          deleted: users[u].deleted,
        })
        
        a.save()
      }
    }
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
