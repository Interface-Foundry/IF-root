function TalklistCtrl( $location, $scope, db, $rootScope) {

    $rootScope.showSwitch = false;

    //query tweets
    $scope.tweets = db.tweets.query({limit:70}); // make infinite scroll?
    $scope.globalhashtag = global_hashtag;

    //not enabled right now
    $scope.tagSearch = function() { 
        var tagged = $scope.searchText.replace("#","");
        $scope.tweets = db.tweets.query({tag: tagged});
    };

    $scope.goBack = function(){
        window.history.back();
    }
}
TalklistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope'];



function InstalistCtrl( $location, $scope, db, $rootScope) {

    $rootScope.showSwitch = false;

    //query instagram
    $scope.instagrams = db.instagrams.query({limit:70}); // make infinite scroll?
    $scope.globalhashtag = global_hashtag;

    $scope.goBack = function(){
        window.history.back();
    }
}
InstalistCtrl.$inject = [ '$location', '$scope', 'db', '$rootScope'];



function TalktagCtrl( $location, $scope, $routeParams, db, $rootScope) {

    $rootScope.showSwitch = false;

    $scope.currentTag = $routeParams.hashTag;
    $scope.globalhashtag = global_hashtag;

    $scope.time = "all";
    $scope.tweets = db.tweets.query({tag: $routeParams.hashTag, time:$scope.time});

    $scope.goBack = function(){
        window.history.back();
    }

    $scope.goTalk = function(url) {
      $location.path('talk');
    };

}
TalktagCtrl.$inject = [ '$location', '$scope', '$routeParams', 'db', '$rootScope'];



function MenuCtrl( $location, $scope, db, $routeParams, $rootScope) {

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



