function WorldChatCtrl( $location, $scope, socket, $sce, db, $rootScope, $routeParams, apertureService) {
  var aperture = apertureService;
  aperture.set('off');

    //angular while loop the query every 2 seconds
    //$scope.chats = db.worldchats.query({limit:1, tag:$scope.world.id});
    ///

    var side = 'left';

    //Messages, client info & sending
    $scope.messages = [];


    $scope.sendMessage = function () {

        //$scope.messageText;

        var newChat = {
            worldID: $routeParams.worldID,
            nickname: 'lel',
            userID: 'REPLACE ME',
            msg: $scope.messageText
        };

        if ($scope.messageImg){
            newChat.img = $scope.messageImg;
        }


        db.worldchat.create(newChat, function(response) {

            console.log(response);
          
                
        });


        // $scope.messages.push({
        //   user: $rootScope.chatName,
        //   text: $scope.messageText,
        //   time: hour + ":" + minutes + ":" + seconds,
        //   side: side,
        //   avatar: '/img/emoji/cool.png'
        // });

        $scope.messageText = "";
    };



    //greater than mongoID
    // db.landmarks.query({ queryType:'all', queryFilter:'all', parentID: $scope.world._id}, function(data){
    //         console.log('--db.landmarks.query--');
    //         console.log('data');
    //         console.log(data);
    //     //data.shift();
    //     $scope.landmarks = $scope.landmarks.concat(data);
    //         console.log('$scope.landmarks');
    //         console.log($scope.landmarks);
        
    //     //add markers to map
    //     angular.forEach($scope.landmarks, function(value, key) {
    //         //for each landmark add a marker
    //         map.addMarker(value._id, {
    //             lat:value.loc.coordinates[1],
    //             lng:value.loc.coordinates[0],
    //             draggable: true,
    //             icon: {
    //                 iconUrl: 'img/marker/bubble-marker-50.png',
    //                 shadowUrl: '',
    //                 iconSize: [25, 48],
    //                 iconAnchor: [13, 10]
    //             },
    //             message:value.name
    //         });
    //     });
    //     landmarksLoaded = true;
        
    // });



















    //Occurs when we receive chat messages

    // server.ngChatMessagesInform = function (p) {


    //     $scope.messages.push({
    //         avatar: "data:image/png;base64," + p.avatar.toBase64(),
    //         text: p.message,
    //         side: side
    //     });
    //     $scope.$apply();

    //     // Animate
    //     $("#viewport-content").animate({
    //         bottom: $("#viewport-content").height() - $("#viewport").height()
    //     }, 250);

    //     // flip the side
    //     side = side == 'left' ? 'right' : 'left';

    // };




    
  // Socket listeners
  // ================

  // socket.on('init', function (data) {
  //   $rootScope.chatName = data.name;
  //   $rootScope.users = data.users;
  // });

  // //receiving messages
  // socket.on('send:message', function (p) {

  //       console.log(p);

  //       $scope.messages.push({
  //           avatar: p.avatar,
  //           text: p.text,
  //           side: p.side,
  //           time: p.time,
  //           user: p.user
  //       });
  //       //$scope.$apply();

  //       // Animate
  //       $("#viewport-content").animate({
  //           bottom: $("#viewport-content").height() - $("#viewport").height()
  //       }, 250);

  //       // flip the side
  //       side = side == 'left' ? 'right' : 'left';
  // });










  // socket.on('change:name', function (data) {
  //   changeName(data.oldName, data.newName);
  // });


  // // Private helpers
  // // ===============

  // var changeName = function (oldName, newName) {
  //   // rename user in list of users
  //   var i;
  //   for (i = 0; i < $rootScope.users.length; i++) {
  //     if ($rootScope.users[i] === oldName) {
  //       $rootScope.users[i] = newName;
  //     }
  //   }
  // }

  // // Methods published to the scope
  // // ==============================

  // $scope.changeName = function () {
  //   socket.emit('change:name', {
  //     name: $scope.newName
  //   }, function (result) {
  //     if (!result) {
  //       alert('That name is already in use');
  //     } else {
  //       changeName($rootScope.chatName, $scope.newName);
  //       $rootScope.chatName = $scope.newName;
  //       $scope.newName = '';
  //     }
  //   });
  // };



    $scope.goBack = function(){
        window.history.back();
    }
}
