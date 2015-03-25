'use strict';

app.controller('SuperuserController', SuperuserController);

SuperuserController.$inject = ['$scope', 'Announcements','$routeParams'];

function SuperuserController($scope, Announcements, $routeParams) {

  $scope.region = $routeParams.region;
	
	Announcements.query({id: $scope.region}).$promise
    .then(function(as) {
   
      $scope.as = as;
    })

	function submit() {
		console.log('Submitted:', vm.announcement);
	}

}


// var announcementsSchema = mongoose.Schema({
//     headline: {
//         type: String,
//         required: true
//     }, 
//     body: {
//         type: String,
//         required: true
//     }, 
//     URL: {
//         type: String,
//         required: true
//     }, 
//     priority: {type: Number},
//     live: {type: Boolean},
//     imgURL: {
//         type: String,
//         required: true
//     },
//     region: {
//         type: String,
//         default: 'global'
//     },
//     timestamp: { type: Date, default: Date.now }
// });