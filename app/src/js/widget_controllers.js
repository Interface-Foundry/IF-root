function TweetlistCtrl( $location, $scope, db, $rootScope,$routeParams,apertureService) {	
    olark('api.box.hide'); //hides olark tab on this page
    $rootScope.showSwitch = false;
    var aperture = apertureService
    aperture.set('off');
    //query tweets
    $scope.currentTag = $routeParams.hashTag;
    $scope.tweets = db.tweets.query({limit:60, tag:$scope.currentTag}); // make infinite scroll?
    // $scope.globalhashtag = global_hashtag;
	
    //not enabled right now
    $scope.tagSearch = function() { 
        var tagged = $scope.searchText.replace("#","");
        $scope.tweets = db.tweets.query({tag: tagged});
    };

    $scope.goBack = function(){
        window.history.back();
    }
}
TweetlistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope','$routeParams', 'apertureService'];



function InstalistCtrl( $location, $scope, db, $rootScope,$routeParams, apertureService) {
    olark('api.box.hide'); //hides olark tab on this page
	var aperture = apertureService;
	aperture.set('off');
    $rootScope.showSwitch = false;  

    //query instagram
    $scope.currentTag = $routeParams.hashTag;
    $scope.instagrams = db.instagrams.query({limit:30, tag:$scope.currentTag}); // make infinite scroll?

    // $scope.globalhashtag = global_hashtag;

    $scope.goBack = function(){
        window.history.back();
    }
}
InstalistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope','$routeParams', 'apertureService'];



function TalktagCtrl( $location, $scope, $routeParams, db, $rootScope) {
    olark('api.box.hide'); //hides olark tab on this page

    $rootScope.showSwitch = false;

    $scope.currentTag = $routeParams.hashTag;
    $scope.globalhashtag = global_hashtag;

    $scope.time = "all";
    $scope.tweets = db.tweets.query({limit:60, tag: $routeParams.hashTag, time:$scope.time});

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.goTalk = function(url) {
      $location.path('talk');
    };

}
TalktagCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope'];



function MenuCtrl( $location, $scope, db, $routeParams, $rootScope) {
    olark('api.box.hide'); //hides olark tab on this page


    // TURN THIS PAGE INTO RAW HTML PAGE, A LA MENU page
    shelfPan('return');
    window.scrollTo(0, 0);

    $rootScope.showSwitch = false;

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.shelfUpdate = function(type){     
        if ($scope.shelfUpdate == type){
            $scope.shelfUpdate = 'default';
        }
        else {
            $scope.shelfUpdate = type;
        }
    }

    $scope.menuType = $routeParams.type;

}
MenuCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];


function ListCtrl( $location, $scope, db, $routeParams, $rootScope) {
    olark('api.box.hide'); //hides olark tab on this page


    shelfPan('return');

    window.scrollTo(0, 0);

    //fixing back button showing up glitches
    $rootScope.showBack = false;
    $rootScope.showBackPage = false;
    $rootScope.showBackMark = false;
    $rootScope.showSwitch = false;

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.shelfUpdate = function(type){     
        if ($scope.shelfUpdate == type){
            $scope.shelfUpdate = 'default';
        }
        else {
            $scope.shelfUpdate = type;
        }
    }

    //---- EVENT CARDS WIDGET -----//

    $scope.listType = $routeParams.category;

    if ($scope.listType == 'lecture' ){
        $scope.day = "WEDNESDAY";
    }
    if ($scope.listType == 'award' ){
        $scope.day = "TUESDAY";
    }
    if ($scope.listType == 'show' ){
        $scope.day = "THURSDAY";
    }

    queryList();

    function queryList(){

        $scope.listLimit = 10;

        //---- Happened -----//
        $scope.queryType = "events";
        $scope.queryFilter = $routeParams.filter;
        $scope.queryCat = $routeParams.category;

        $scope.landmarksList = db.landmarks.query({ queryType:$scope.queryType, queryFilter:$scope.queryFilter, queryCat: $scope.queryCat, nowTimeEnd: "noNow"},function(){
         
        });
    }

    //------------------------//

    //query function for all sorting buttons
    $scope.filter = function(type, filter) {
        $scope.landmarks = db.landmarks.query({ queryType: type, queryFilter: filter });
    };
}
ListCtrl.$inject = [ '$location', '$scope', 'db', '$routeParams', '$rootScope'];


// function ChatCtrl($scope, socket, $sce, $rootScope, apertureService) {
	
// 	$scope.aperture = apertureService;	
//     $scope.aperture.set('off');

	
//   // Socket listeners
//   // ================

//   socket.on('init', function (data) {
//     $rootScope.chatName = data.name;
//     $rootScope.users = data.users;
//   });

//   socket.on('send:message', function (message) {
//     $rootScope.messages.push(message);
//   });

//   socket.on('change:name', function (data) {
//     changeName(data.oldName, data.newName);
//   });

//   // socket.on('reconnect');
  
//   // socket.on('user:join', function (data) {
//   //   $scope.messages.push({
//   //     user: 'chatroom',
//   //     text: 'User ' + data.name + ' has joined.'
//   //   });
//   //   $scope.users.push(data.name);
//   // });

//   // // add a message to the conversation when a user disconnects or leaves the room
//   // socket.on('user:left', function (data) {
//   //   $scope.messages.push({
//   //     user: 'chatroom',
//   //     text: 'User ' + data.name + ' has left.'
//   //   });
//   //   var i, user;
//   //   for (i = 0; i < $scope.users.length; i++) {
//   //     user = $scope.users[i];
//   //     if (user === data.name) {
//   //       $scope.users.splice(i, 1);
//   //       break;
//   //     }
//   //   }
//   // });

//   // Private helpers
//   // ===============

//   var changeName = function (oldName, newName) {
//     // rename user in list of users
//     var i;
//     for (i = 0; i < $rootScope.users.length; i++) {
//       if ($rootScope.users[i] === oldName) {
//         $rootScope.users[i] = newName;
//       }
//     }

//     // $scope.messages.push({
//     //   user: 'chatroom',
//     //   text: 'User ' + oldName + ' is now known as ' + newName + '.'
//     // });
//   }

//   // Methods published to the scope
//   // ==============================

//   $scope.changeName = function () {
//     socket.emit('change:name', {
//       name: $scope.newName
//     }, function (result) {
//       if (!result) {
//         alert('That name is already in use');
//       } else {
//         changeName($rootScope.chatName, $scope.newName);
//         $rootScope.chatName = $scope.newName;
//         $scope.newName = '';
//       }
//     });
//   };

//   //$scope.messages = [];

//   $scope.sendMessage = function () {

//     socket.emit('send:message', {
//       message: $scope.message
//     });

//     var date = new Date;
//     var seconds = (date.getSeconds()<10?'0':'') + date.getSeconds();
//     var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
//     var hour = date.getHours();

//     // add the message to our model locally
//     $rootScope.messages.push({
//       user: $rootScope.chatName,
//       text: $scope.message,
//       time: hour + ":" + minutes + ":" + seconds
//     });

//     // clear message box
//     $scope.message = '';
//   };

//   $scope.sendEmo = function (input) {
//     var path = "/img/emoji/";
//     var emoji;

//     switch(input) {
//         case "cool":
//             emoji = path+"cool.png";
//             break;
//         case "dolphin":
//             emoji = path+"dolphin.png";
//             break;
//         case "ghost":
//             emoji = path+"ghost.png";
//             break;
//         case "heart":
//             emoji = path+"heart.png";
//             break;
//         case "love":
//             emoji = path+"love.png";
//             break;
//         case "party":
//             emoji = path+"party.png";
//             break;
//         case "smile":
//             emoji = path+"smile.png";
//             break;
//         case "woah":
//             emoji = path+"woah.png";
//             break;
//         default:
//             emoji = path+"love.png";
//             break;
//     }
//     $scope.message = '<img src="'+emoji+'">';
//     $scope.sendMessage();
//   }


// }


