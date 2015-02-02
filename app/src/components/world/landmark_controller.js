app.controller('LandmarkController', ['World', 'Landmark', 'db', '$routeParams', '$scope', '$location', '$window', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'userManager', 'alertManager', '$http', 'worldTree', 
function (World, Landmark, db, $routeParams, $scope, $location, $window, leafletData, $rootScope, apertureService, mapManager, styleManager, userManager, alertManager, $http, worldTree) {

var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
zoomControl.style.top = "100px";
zoomControl.style.left = "1%";

console.log('--Landmark Controller--');
var map = mapManager;
var style = styleManager;
var alerts = alertManager;
//$scope.aperture = apertureService;
var aperture = apertureService;

$scope.worldURL = $routeParams.worldURL;
$scope.landmarkURL = $routeParams.landmarkURL;
	
$scope.collectedPresents = [];


worldTree.getWorld($routeParams.worldURL).then(function(data) {
	$scope.world = data.world;
	$scope.style = data.style;
	style.navBG_color = $scope.style.navBG_color;
	
worldTree.getLandmark($scope.world._id, $routeParams.landmarkURL).then(function(landmark) {
	$scope.landmark = landmark;
	console.log(landmark); 
	
	goToMark();
	
console.log($scope.style.widgets.presents);

console.log($scope.landmark.category);

				//present collecting enabled and landmark has present
				if ($scope.style.widgets.presents && $scope.landmark.category){

					if ($scope.landmark.category.hiddenPresent && $scope.landmark.category.name){

						// userManager.getUser({},function(user){
						// 	console.log(userManager);
						// });
						$scope.temp = {
							showInitialPresent: true,
							presentCollected: false,
							presentAlreadyCollected: false,
							showPresentCard: true
						}
						// $scope.showPresentCard = true;
						// $scope.showInitialPresent = true;
						// $scope.presentCollected = false;
						// $scope.presentAlreadyCollected = false;

						$http.get('/api/user/loggedin', {server: true}).success(function(user){
							if (user !== '0'){
								userManager.getUser().then(
									function(response) {

									$scope.user = response;

									if(!$scope.user.presents){
										$scope.user.presents = {
											collected:[]
										};
									}
									
									//check if present already collected
									var found = false;	
									for(var i = 0; i < $scope.user.presents.collected.length; i++) {
									    if ($scope.user.presents.collected[i].landmarkID == $scope.landmark._id || $scope.user.presents.collected[i].categoryname == $scope.landmark.category.name) {
									    	if ($scope.user.presents.collected[i].worldID == $scope.world._id){
										        found = true;
										        $scope.temp.presentAlreadyCollected = true;
										        $scope.temp.showInitialPresent = false;
										        break;						    		
									    	}
									    }
									}
									//new present
									if (!found){
										savePresent();
									}
									else {
										checkFinalState();
									}

									function savePresent(){
										$scope.user.presents.collected.unshift({
											avatar: $scope.landmark.category.avatar, 
											landmarkID: $scope.landmark._id,
											landmarkName: $scope.landmark.name,
											worldID: $scope.world._id,
											worldName: $scope.world.name,
											categoryname: $scope.landmark.category.name
										});
										userManager.saveUser($scope.user);
										// display card with avatar + name

										$scope.temp.presentCollected = true;
										$scope.temp.showIntialPresent = false;
										alerts.addAlert('success', 'You found a present!', true);

										checkFinalState();
									}

									//showing collected presents in this world
									for(var i = 0; i < $scope.user.presents.collected.length; i++) {
									    if ($scope.user.presents.collected[i].worldID == $scope.world._id){
											$scope.collectedPresents.push($scope.user.presents.collected[i].categoryname);
									    }
									}

									//to see if user reached world collect goal for final present
									function checkFinalState(){

										var numPresents = $scope.world.landmarkCategories.filter(function(x){return x.present == true}).length;
										var numCollected = $scope.user.presents.collected.filter(function(x){return x.worldID == $scope.world._id}).length;

										//are # of present user collected in the world == to number of presents available in the world?
										if (numPresents == numCollected){
											console.log('final state!');
											//DISPLAY THANK YOU MESSAGE TO USER, collected all
											$scope.temp.finalPresent = true;
											$scope.temp.showInitialPresent = false;
											$scope.temp.presentCollected = false;
											$scope.temp.presentAlreadyCollected = false;
										}
										else{
											$scope.presentsLeft = numPresents - numCollected;
											console.log('presents left '+ $scope.presentsLeft);
										}
									}	

								});
							}
							else {
								$scope.temp.signupCollect = true;
								
							}
						});

					}				
				}

})
});
		
		

function goToMark() {
	map.setCenter($scope.landmark.loc.coordinates, 17, 'aperture-half'); 
	aperture.set('half');
  	// var markers = map.markers;
  	// angular.forEach(markers, function(marker) {
  	// 	console.log(marker);
	  // 	map.removeMarker(marker._id);
  	// });
	map.removeAllMarkers();
  	

  	map.addMarker($scope.landmark._id, {
  			lat: $scope.landmark.loc.coordinates[1],
  			lng: $scope.landmark.loc.coordinates[0],
  			draggable:false,
  			message:$scope.landmark.name,
		  	icon: {
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 67],
				iconAnchor: [17.5, 60],
				popupAnchor: [0, -40]
			},
  			_id: $scope.landmark._id
  			});
  	map.setMarkerFocus($scope.landmark._id);
  	
  	map.refresh();
};
		 
		
}]);