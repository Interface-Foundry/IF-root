// production vs testing
if (window.location.hostname === 'pay.kipthis.com') {

  var stripeKey = 'pk_live_0LCJqLkmMCFKYDwbPCrhQknH';
  Stripe.setPublishableKey('pk_live_0LCJqLkmMCFKYDwbPCrhQknH');
} else {
  var stripeKey = 'pk_test_8bnLnE2e1Ch7pu87SmQfP8p7';
  Stripe.setPublishableKey('pk_test_8bnLnE2e1Ch7pu87SmQfP8p7');
}

function getQueryStringValue (key) {
  return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
// parsing query strings
var session_token = getQueryStringValue('k');
var baseURL = decodeURI(getQueryStringValue('b'));

//clear query strings in url param
history.replaceState({}, 'Kip Café with Stripe', '/');

//something went broken, we dont have the token from URL :(
if (!session_token){
    $("#kipPay").fadeIn(450);
    $("#headerText").text("Kip Café Error");
    $("#bodyTitle").text("Please try clicking payment link on Slack again");
    $("#innerButton").hide();
}

//fetch checkout info by token
if (session_token.length == 512){
  $.ajax({
      url: '/session',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        session_token: session_token
      }),
      success: process
  })
}

//HANDLE special snowflake iOS ❄️
if(mobileDetect()){
  console.log('❄️');
  $("#stripeButton").hide(); //hide other checkout button
  $("#payment-form").show();
  $("#stripeJSButton").show();

  //STRIPE.JS
  $(function() {
    var $form = $('#payment-form');
    $form.submit(function(event) {
      // Disable the submit button to prevent repeated clicks:
      $form.find('.submit').prop('disabled', true);

      // Request a token from Stripe:
      Stripe.card.createToken($form, stripeResponseHandler);

      // Prevent the form from being submitted:
      return false;
    });
  });
}else {
  //not iOS
}

//FOR iOS stuff
function stripeResponseHandler(status, response) {
  // Grab the form:
  var $form = $('#payment-form');

  if (response.error) { // Problem!

    // Show the errors on the form:
    $( "#stripeJSButton" ).show();
    $( "#stripeProcessing" ).hide();
    $( "#stripeSuccess" ).hide();
    alert(response.error.message);
    //$form.find('.payment-errors').text(response.error.message);
    $form.find('.submit').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // console.log('token ',token)
    // console.log('session_token ',session_token)

    $.ajax({
        url: '/process',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          token: token,
          session_token: session_token
        }),
        success: function(){

          console.log('SUCCESS')

          $( "#stripeJSButton" ).hide();
          $( "#stripeSuccess" ).show();
          $(".form-row input").empty();

          setTimeout(function(){
            window.close();
          },500)

        },
        error: function(req,status,err){

        }
    })

    // // Insert the token ID into the form so it gets submitted to the server:
    // $form.append($('<input type="hidden" name="stripeToken">').val(token));

    // // Insert the kip pay session token so it gets submitted to the server:
    // $form.append($('<input type="hidden" name="sessionToken">').val(session_token));

    // // Submit the form:
    // $form.get(0).submit();
  }
};
////////////

//do the thing
function process(data){

    //check if the stripe popup was blocked
    setTimeout(function(){
        //no stripe didn't pop up
        if(!$('.stripe_checkout_app').is(":visible")){
            $("#kipPay").fadeIn(450);
        }
        //yes stripe popped up
        else {
            //popup not blocked, but detecting if user closes popup, so we can show kip dialog
            setInterval(function(){
                if(!$('.stripe_checkout_app').is(":visible")){
                   $("#kipPay").fadeIn(450);
                }
            },500)
        }
    },1000)

    // causes issue
    // data = JSON.parse(data)

    $("#headerText").text("Kip Café Order");

    //only for desktops
    if(!mobileDetect()){
      $("#bodyTitle").html('<a href="'+data.order.chosen_restaurant.url+'">'+data.order.chosen_restaurant.name+'</a>');
      $("#bodyText").html(data.order.order.order_type+'</br>'+(data.order.order.total/100).toFixed(2));

      var handler = StripeCheckout.configure({
          key: stripeKey,
          image: 'img/kip-head.png',
          locale: 'auto',
          token: function(token) {
            $.ajax({
                url: '/process',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  token: token.id,
                  session_token: data.session_token
                }),
                success: function(){
                  window.close();
                }
            })
          }
      });

      document.getElementById('stripeButton').addEventListener('click', function(e) {

        // Open Checkout with further options:
        handler.open({
          name: 'Kip Café',
          description: 'Delivery from ' + data.order.chosen_restaurant.name,
          amount: data.order.order.total,
          zipCode: true,
          email: data.order.convo_initiater.email
        });
        e.preventDefault();

        //show underneath button
      });

      // Close Checkout on page navigation:
      window.addEventListener('popstate', function() {
          handler.close();
      });

      $('#stripeButton').trigger( "click" );
    }

    //mobile ios
    else {
      $("#stripeJSButton").text("Pay $"+(data.order.order.total/100).toFixed(2));
      $("#stripeEmail").text(data.order.convo_initiater.email);
      $('#stripeEmail').attr('data-email', data.order.convo_initiater.email);
      $('#cafeInfo').text('Delivery from ' + data.order.chosen_restaurant.name);

      //make spaces every 4 characters for cc num
      document.getElementById('s').addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
      });
    }

    // $('#stripeButton').click(function(e){
    //   console.log('EEEE ',e)
    // })

    // $( "#target" ).click(function() {
    //   alert( "Handler for .click() called." );
    // });



}

function mobileDetect() {
  //var isMobile = false; //initiate as false
  // device detection
  //via http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  // if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
  //     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

  // return isMobile;

  var userAgent = window.navigator.userAgent.toLowerCase(),
      safari = /safari/.test( userAgent ),
      ios = /iphone|ipod|ipad/.test( userAgent );
  if( ios ) {
    if ( safari ) {
      //browser
      return true;
    } else if ( !safari ) {
      //webview
      return true;
    };
  } else {
      //not iOS
      return false;
  };
}

//responsive gradient
$('#wrap').css('height', $(window).height() + 3);
$(window).resize(function() {
  $('#wrap').css('height', $(window).height() + 3);
});
