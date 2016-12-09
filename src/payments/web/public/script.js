// production vs testing
if (window.location.hostname === 'pay.kipthis.com') {
  var stripeKey = 'pk_live_0LCJqLkmMCFKYDwbPCrhQknH';
} else {
  var stripeKey = 'pk_test_8bnLnE2e1Ch7pu87SmQfP8p7';
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

    data = JSON.parse(data)

    $("#headerText").text("Kip Café Order");
    $("#bodyTitle").html('<a href="'+data.order.chosen_restaurant.url+'">'+data.order.chosen_restaurant.name+'</a>');
    $("#bodyText").html(data.order.order.order_type+'</br>'+(data.order.order.total/100).toFixed(2));

    var handler = StripeCheckout.configure({
        key: stripeKey,
        image: 'https://kipthis.com/images/kip_head.png',
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

    // $('#stripeButton').click(function(e){
    //   console.log('EEEE ',e)
    // })

    // $( "#target" ).click(function() {
    //   alert( "Handler for .click() called." );
    // });

    $('#stripeButton').trigger( "click" );

}


//responsive gradient
$('#wrap').css('height', $(window).height() + 3);
$(window).resize(function() {
  $('#wrap').css('height', $(window).height() + 3);
});