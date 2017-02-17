/*jshint esversion: 6 */
/*jshint -W061 */
if (sbrzGSearchID) {
  (function() {
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + sbrzGSearchID;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
  })();
}

function activateSocial(id){
    var lab_id=eval(id);
	if (lab_id) {
      document.getElementById(id).setAttribute("href", lab_id);
	} else {
		document.getElementById(id).remove();
	}
}
var sbrzGSearchID;
var sbrzLinkedin, sbrzGoogleplus, sbrzGithub, sbrzDribbble, sbrzPinterest, sbrzVimeo, sbrzDropbox, sbrzWechat, sbrzYoutube, sbrzPay, sbrzPayLabel, sbrzFacebook, sbrzTwitter;
var sbrzlist={ 
    sbrzLinkedin:'sbrzLinkedin', 
	sbrzGoogleplus:'sbrzGoogleplus',
	sbrzGithub:'sbrzGithub',
	sbrzDribbble:'sbrzDribbble',
	sbrzPinterest:'sbrzPinterest',
	sbrzVimeo:'sbrzVimeo',
	sbrzDropbox:'sbrzDropbox',
	sbrzWechat:'sbrzWechat',
	sbrzYoutube:'sbrzYoutube',
	sbrzFacebook:'sbrzFacebook',
	sbrzTwitter:'sbrzTwitter'
};
$( document ).ready(function() {
  for (var brzsocial in sbrzlist) {
	activateSocial(brzsocial);
  }
  var lab_id=eval("sbrzPay");
  if (lab_id) {
    document.getElementById("sbrzPay").setAttribute("href", lab_id);
    var txt_id=eval("sbrzPayLabel");
    if (txt_id){
      document.getElementById("sbrzPay").innerHTML=txt_id;
    } 
  } else {
   document.getElementById("sbrzPay").remove();
  }
   });

/* globals jQuery, document */
(function($, undefined) {
   // fancybox config
  $('.post-content a:has(img)').addClass('fancybox');
  $(".fancybox").attr('rel', 'gallery-group').fancybox({
    helpers: {
      overlay: {
        css: {
          'background': 'rgba(0, 154, 97, 0.33)'
        },
        locked: false
      }
    },
    beforeShow: function() {
      var alt = this.element.find('img').attr('alt');
      this.inner.find('img').attr('alt', alt);
      this.title = alt;
    }
  }); 
})(jQuery);
