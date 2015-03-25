'use strict';

app.controller('SuperuserController', SuperuserController);

SuperuserController.$inject = ['$scope', 'Announcements'];

function SuperuserController($scope, Announcements) {
	var vm = this;

	vm.announcement = {};
	vm.submit = submit;

	Announcements.get().$promise
    .then(function(announcements) {
      vm.announcements = announcements;
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