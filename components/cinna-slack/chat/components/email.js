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

//
// Process incoming email from sendgrid
//
var processEmail = module.exports.process = function(message) {
  return co(function*() {
    console.log(message);
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
    var text = `Hey bae,
just lettin u know that i care about u, so i wanted to say that the last call for office stuff is soon. whisper your dreams in my ear and i will make it so.`

    var payload = {
        to: addresses,
        from: 'cinna@kipthis.com',
        subject: 'Last Call for Office Purchase Order',
        text: text
    };

    return co(function*() {
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
