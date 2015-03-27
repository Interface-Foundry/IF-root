'use strict';

app.controller('SuperuserContestController', SuperuserContestController);

SuperuserContestController.$inject = ['$scope', 'Contests','$routeParams', '$location'];

function SuperuserContestController($scope, Contests, $routeParams, $location) {

	$scope.contest = {};
	$scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  $scope.dateTime = {};
	$scope.routes = ['Announcements', 'Contests'];
	$scope.currentRoute = $location.path().indexOf('announcements') >= 0 ? $scope.routes[0] : $scope.routes[1];
	$scope.openEnd = openEnd;
	$scope.openStart = openStart;
	$scope.region = $routeParams.region;
	$scope.submit = submit;
	$scope.updateContest = updateContest;

	activate();

	function activate() {
		today();
		Contests.query({
			id: $scope.region
		}).$promise
	    .then(function(response) {
	      $scope.contest = response;
	    });
	}

	$scope.changeRoute = function() {
		$location.path('/su/' + $scope.currentRoute.toLowerCase() + '/' + $scope.region.toLowerCase());
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
    .then(function(contest) {
    console.log(contest);
      $scope.newcontest = contest;
      
    }, function(error) {
      console.log(error.data);
    });;
	}

	function today() {
		var d = new Date;
    $scope.dateTime.startDate = d;
    $scope.dateTime.startTime = d;
    $scope.dateTime.endDate = d;
    $scope.dateTime.endTime = d;
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