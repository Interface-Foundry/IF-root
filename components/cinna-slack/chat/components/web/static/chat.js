var socket = io();

var $chats = $('.chats')
var $chatMessages = $('.chat-messages')
var chats_el = $chats[0];

var user = document.cookie.match(/kip_user=[A-Z0-9]+/ig)[0].split('=')[1];

var initial_messages_loaded = false;
socket.on('please_init', function() {
  socket.emit('init', {
    group: document.location.pathname.split('/').pop(),
    user: user
  });
});

socket.on('init', function(data) {
  console.log('client initialized', data);
  if (initial_messages_loaded) return
  data.messages.reverse().map(m => {
    printMessage(m.html, m.user);
  })
  initial_messages_loaded = true;
})

// setTimeout(function() {
//   $("#msg").focus();
// }, 0);

function sendMessage() {
  var message = $("#msg").val();
  $("#msg").val('');
  socket.emit("message", {
    msg: message
  }); //passing all messages with channel/org Ids attached

  printMessage(message, user)
}

//generates new id for user session
function makeId() {
  return Math.random().toString(36).substring(7);
}

//
// Print messages to screen
//
function get_avatar(u) {
  if (!u) u = 'kip';

  if (u === 'kip') {
    return '<img style="padding-right:5px;" width="45" src="http://kipthis.com/img/kip-icon.png">'
  } else {
    var c = randomColor({seed: parseInt(u.replace(/[^0-9]/g, ''))});
    var name = u === user ? 'ME' : '⏁';
    return `<div class="avatar" style="background-color: ${c}">${name}</div>`;
  }
}

var user_talking = '';
// prints a message on the screen with the appropriate icon
function printMessage(msg, u) {
  console.log(msg, u);
  // var isUser = u === user;
  // if (isUser && !userIsTalking) {
  //   msg = get_avatar(u) + msg;
  // } else if (!isUser && userIsTalking) {
  //   msg = get_avatar(u) + msg;
  // }
  // userIsTalking = isUser;
  $chatMessages.append('<li>' + (user_talking === u ? '' : get_avatar(u)) + msg + '</li>');
  user_talking = u;
  scrollChat();
}

//
// Data in, convert to message
//
socket.on("message", function(data) {
  console.log('message', data);

  // var res = str.replace(/blue/g, "red");
  //var b = url.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  // var urlIcon;
  // urlIcon = data.message.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  //
  //
  // var geturl = new RegExp(
  //   "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g"
  // );
  //
  // var onlyUrl = data.message.match(geturl);
  //
  //
  // // var testUrl = data.message.match(/'(https?:[^\s]+)'/),
  // //     onlyUrl = testUrl && testUrl[1];
  //
  // // console.log(urlIcon);
  // console.log(onlyUrl);
  //
  // if (checkImgURL(data.message)) { //image URL
  //   var msgP = '<img class="picstitch" src="' + data.message + '"><br>';
  //
  // } else if (onlyUrl) { //reg url
  //
  //   var msgP = urlIcon + " " + "<a target='_blank' href=' " + onlyUrl + "'>" + onlyUrl + "</a><br>";
  //
  // } else if (/^(ftp|http|https):\/\/[^ "]+$/.test(data.message)) { //reg url
  //
  //
  //   var msgP = "<a target='_blank' href=' " + data.message + "'>" + data.message + "</a><br>";
  //
  // } else { //else
  //   var msgP = data.message;
  //
  // }
  //
  //
  // function checkImgURL(url) {
  //   return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  // }

  printMessage(data.message, data.user)

})

function scrollChat() {
  $chats.stop()
  $chats.animate({
    scrollTop: chats_el.scrollHeight
  })
}

//
// Initialize
//
printMessage('<img width="60" style="margin-bottom: -15px;" src="http://kipthis.com/img/kip_logo_new.svg">', 'kip')
user_talking = '';
