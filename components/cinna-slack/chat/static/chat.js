
 var socket = io();
 // var channelId = Math.random().toString(36).substring(7); //generate random user ID for this session
 // var orgId = 'kip';

var $chats = $('.chats')
var chats_el = $chats[0];


setTimeout(function(){
    $( "#msg" ).focus();
}, 0);

 function sendMessage() {
     var message = $("#msg").val();
     $("#msg").val('');
     socket.emit("msgToClient",  { msg: message }); //passing all messages with channel/org Ids attached

      var anon = '<img style="float:left; padding-right:5px;" width="45" src="https://eatout.ug/assets/img/default-icon-user.png">';
      message = anon + '<p>' + message + '</p>';

     $(".chats").append(message);
     scrollChat()
 }

 //generates new id for user session
 function makeId(){
    return Math.random().toString(36).substring(7);
 }

 socket.on("msgFromSever", function(data) {

   // var res = str.replace(/blue/g, "red");
    //var b = url.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    var cinna = '<img style="float:left; padding-right:5px;" width="45" src="http://kipthis.com/img/kip-icon.png">';
    var urlIcon;
    urlIcon = data.message.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');


    var geturl = new RegExp(
              "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))"
             ,"g"
           );

    var onlyUrl = data.message.match(geturl);


    // var testUrl = data.message.match(/'(https?:[^\s]+)'/),
    //     onlyUrl = testUrl && testUrl[1];

    // console.log(urlIcon);
    console.log(onlyUrl);

    if (checkImgURL(data.message)){ //image URL
      var msgP = "<img width='1000' style='max-width:400px;' src='" + data.message + "''><br>";

    }
    else if (onlyUrl){ //reg url

      var msgP = urlIcon + " " + "<a target='_blank' href=' " + onlyUrl + "'>" + onlyUrl +"</a><br>";

    }
    else if (/^(ftp|http|https):\/\/[^ "]+$/.test(data.message)){ //reg url


      var msgP = "<a target='_blank' href=' " + data.message + "'>"+data.message+"</a><br>";

    }
    else { //else
      var msgP = "<p> " + data.message + "</p>";

    }


    function checkImgURL(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    if (!onlyUrl){
      msgP = cinna + msgP;
    }


   $(".chats").append(msgP);

   scrollChat()




    // $(".chats").scrollTop($(document).height());
    // var wtf = $('.chats');
    // var height = wtf[0].scrollHeight;
    // wtf.scrollTop(height);

 })

 function scrollChat() {
      $chats.animate({scrollTop: chats_el.scrollHeight})
 }
