var socket = io();
// var channelId = Math.random().toString(36).substring(7); //generate random user ID for this session
// var orgId = 'kip';

var $chats = $('.chats')
var $chatMessages = $('.chat-messages')
var chats_el = $chats[0];


// setTimeout(function() {
//   $("#msg").focus();
// }, 0);

function sendMessage() {
  var message = $("#msg").val();
  $("#msg").val('');
  socket.emit("msgToClient", {
    msg: message
  }); //passing all messages with channel/org Ids attached

  printMessage(message, true)
}

//generates new id for user session
function makeId() {
  return Math.random().toString(36).substring(7);
}

//
// Print messages to screen
//
var IMAGES = {
  me: '<img style="padding-right:5px;" width="45" src="https://eatout.ug/assets/img/default-icon-user.png">',
  cinna: '<img style="padding-right:5px;" width="45" src="http://kipthis.com/img/kip-icon.png">'
};
var userIsTalking = true;
// prints a message on the screen with the appropriate icon
function printMessage(msg, isUser) {
  if (isUser && !userIsTalking) {
    msg = IMAGES.me + msg;
  } else if (!isUser && userIsTalking) {
    msg = IMAGES.cinna + msg;
  }
  userIsTalking = isUser;
  $chatMessages.append('<li>' + msg + '</li>');
  scrollChat();
}

//
// Data in, convert to message
//
socket.on("msgFromSever", function(data) {
  console.log('data')
  console.log(data);

  // var res = str.replace(/blue/g, "red");
  //var b = url.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  var urlIcon;
  urlIcon = data.message.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');


  var geturl = new RegExp(
    "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g"
  );

  var onlyUrl = data.message.match(geturl);


  // var testUrl = data.message.match(/'(https?:[^\s]+)'/),
  //     onlyUrl = testUrl && testUrl[1];

  // console.log(urlIcon);
  console.log(onlyUrl);

  if (checkImgURL(data.message)) { //image URL
    var msgP = '<img class="picstitch" src="' + data.message + '"><br>';

  } else if (onlyUrl) { //reg url

    var msgP = urlIcon + " " + "<a target='_blank' href=' " + onlyUrl + "'>" + onlyUrl + "</a><br>";

  } else if (/^(ftp|http|https):\/\/[^ "]+$/.test(data.message)) { //reg url


    var msgP = "<a target='_blank' href=' " + data.message + "'>" + data.message + "</a><br>";

  } else { //else
    var msgP = "<p> " + data.message + "</p>";

  }


  function checkImgURL(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  printMessage(msgP)

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
printMessage('<img width="60" style="margin-bottom: -15px;" src="http://kipthis.com/img/kip_logo_new.svg">')
