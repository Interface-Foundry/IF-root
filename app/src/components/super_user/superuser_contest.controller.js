'use strict';

app.controller('SuperuserContestController', SuperuserContestController);

SuperuserContestController.$inject = ['$scope', 'Contests','$routeParams', '$location', 'superuserService'];

function SuperuserContestController($scope, Contests, $routeParams, $location, superuserService) {

	$scope.contest = {};
	$scope.currentRoute = superuserService.getCurrentRoute();
	$scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  $scope.dateTime = {};
	$scope.routes = superuserService.routes
	$scope.openEnd = openEnd;
	$scope.openStart = openStart;
	$scope.region = $routeParams.region;
	$scope.submit = submit;
	$scope.updateContest = updateContest;

	activate();

	function activate() {
		Contests.get({
			id: $scope.region
		}).$promise
    .then(function(response) {
      $scope.contest = response;
			getDates();
    }, function(error) {
    	console.log('Error:', error);
    	getDates();
    });
	}

	$scope.changeRoute = function() {
		superuserService.changeRoute($scope.currentRoute, $scope.region);
	}

	function formatDateTime() {
		var sd = $scope.dateTime.startDate,
				st = $scope.dateTime.startTime,
				ed = $scope.dateTime.endDate,
				et = $scope.dateTime.endTime;
		var start = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), st.getHours(), st.getMinutes(), 0, 0);
		var end = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate(), et.getHours(), et.getMinutes(), 0, 0);

		return {
			start: start,
			end: end
		};
	}

  function openEnd($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedEnd = true;
  }

  function openStart($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedStart = true;
  }

	function submit(form) {
		if (form.$invalid) {
  		console.log('Form is missing required fields.');
  		return;			
		}

		$scope.contest.startDate = formatDateTime().start;
		$scope.contest.endDate = formatDateTime().end;

		Contests.save($scope.contest).$promise
      .then(function(response) {
        $scope.contest = response;
      });;
	}

	function getDates() {
		if (!$scope.contest._id) {
			var d = new Date;
	    $scope.dateTime.startDate = d;
	    $scope.dateTime.startTime = d;
	    $scope.dateTime.endDate = d;
	    $scope.dateTime.endTime = d;
		} else {
		  $scope.dateTime.startDate = $scope.contest.startDate;
	    $scope.dateTime.startTime = $scope.contest.startTime;
	    $scope.dateTime.endDate = $scope.contest.endDate;
	    $scope.dateTime.endTime = $scope.contest.endTime;
		}
  }

  function updateContest(form) {
  	if (form.$invalid) {
  		console.log('Form is missing required fields.');
  		return;
  	}

  	Contests.update({
  		id: $scope.contest._id
  	}, $scope.contest)
  	.$promise
  	.then(function(response) {
  		$scope.contest = response;
  	});	
  }

}