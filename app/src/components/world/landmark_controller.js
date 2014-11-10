function LandmarkController( World, Landmark, db, $routeParams, $scope, $location, $log, $window, leafletData, $rootScope, apertureService, mapManager, styleManager, userManager, alertManager, $http) {

		var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];
		zoomControl.style.top = "100px";
		zoomControl.style.left = "1%";

		console.log('--Landmark Controller--');
		var map = mapManager;
		var style = styleManager;
		var alerts = alertManager;
		$scope.aperture = apertureService;
		$scope.aperture.set('half');

		olark('api.box.hide'); //shows olark tab on this page

		$scope.worldURL = $routeParams.worldURL;
		$scope.landmarkURL = $routeParams.landmarkURL;
   		
   		$scope.collectedPresents = [];		

		//eventually landmarks can have non-unique names
		$scope.landmark = Landmark.get({id: $routeParams.landmarkURL}, function(landmark) {
			console.log(landmark);
			console.log('trying to get landmark');
			//goto landmarker
			goToMark();	
		});
	
		World.get({id: $routeParams.worldURL}, function(data) {
			console.log(data)
			if (data.err) {
				$log.error(data.err);
				$location.path('/#/');
			} else {
				$scope.world = data.world;
				$scope.style = data.style;
				style.navBG_color = $scope.style.navBG_color;

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

						$http.get('/api/user/loggedin').success(function(user){
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

					 // $scope.user = {
					 // 	// presents:{
					 // 	// 	collected:[]
					 // 	// }
					 // };
					// $scope.user.presents;

					// if ($scope.user) {
					// 	userManager.saveUser($scope.user);
					// 	alert.addAlert('success', 'Your contact info has been successfully saved!', true);
					// } else {
					// 	console.log('error');
					// }

					// userManager.getUser(function(user){
					// 	//$scope.user = user._user;

					// 	console.log(user._user);

					// 	// if ($scope.user) {
					// 	// 	userManager.saveUser($scope.user);
					// 	// 	alert.addAlert('success', 'Your contact info has been successfully saved!', true);
					// 	// } else {
					// 	// 	console.log('error');
					// 	// }
					// });


					// $scope.user.presents.collected.unshift({
					// 	avatar: 'avatarlink', 
					// 	landmarkID: 'landmarkIDmongo',
					// 	categoryname: 'bikes',
					// 	completed: false,
					// 	numleft:3
					// });





					/// if completed == false, check if completed. if so, update
					///////



				      // // Make an AJAX call to check if the user is logged in
				      // $http.get('/api/user/loggedin').success(function(user){

				      //   // Authenticated
				      //   if (user !== '0'){

				      //         if (user._id){
				      //           $rootScope.userID = user._id;
				      //         }
				      //         //determine name to display on login (should check for name extension before adding...)
				      //         if (user.name){
				      //             $rootScope.userName = user.name;
				      //         }
				      //         else if (user.facebook){
				      //             $rootScope.userName = user.facebook.displayName;
				      //         }
				      //         else if (user.twitter){
				      //             $rootScope.userName = user.twitter.displayName;
				      //         }
				      //         else if (user.meetup){
				      //             $rootScope.userName = user.meetup.displayName;
				      //         }
				      //         else if (user.local){
				      //             $rootScope.userName = user.local.email;
				      //         }
				      //         else {
				      //             $rootScope.userName = "Me";
				      //         }
				             
				      //     $rootScope.avatar = user.avatar;
				      //     $rootScope.showLogout = true;

				      //   }

				      //});


					// show present card --> "you collected!"
					// with link to share it on group chat ---> click to share, says in green notice: message was shared CLICK to see it

					// read landmark category for landmark

					//COLLECTING
					//$scope.landmark.category PUSH
					//$scope.landmark.category_avatar
					//$scope.landmark.category
					///------> send both of these to server ---> save to user 
				}
			}
		});
		
		function goToMark() {
			
			map.setCenter($scope.landmark.loc.coordinates, 20); 
		  	var markers = map.markers;
		  	angular.forEach(markers, function(marker) {
		  		console.log(marker);
			  	map.removeMarker(marker._id);
		  	});
		  	

		  	map.addMarker($scope.landmark._id, {
		  			lat: $scope.landmark.loc.coordinates[1],
		  			lng: $scope.landmark.loc.coordinates[0],
		  			draggable:false,
		  			message:$scope.landmark.name,
				  	icon: {
						iconUrl: 'img/marker/bubble-marker-50.png',
						shadowUrl: '',
						iconSize: [35, 67],
						iconAnchor: [17.5, 60]
					},
		  			_id: $scope.landmark._id
		  			});
		  	map.setMarkerFocus($scope.landmark._id);
		 };
		 
		map.refresh();
}