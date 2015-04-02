'use strict';

app.controller('SuperuserContestController', SuperuserContestController);

SuperuserContestController.$inject = ['$scope', 'Contests','$routeParams', '$location', 'superuserService'];

function SuperuserContestController($scope, Contests, $routeParams, $location, superuserService) {

	$scope.contest = {};
	$scope.contests;
	$scope.currentRoute = superuserService.getCurrentRoute();
	$scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  $scope.dateTime = {};
	$scope.openEnd = openEnd;
	$scope.openStart = openStart;
	$scope.region = $routeParams.region;
	$scope.regions = ['global'];
	$scope.resetContestForm = resetContestForm;
	$scope.routes = superuserService.routes
	$scope.submit = submit;
	$scope.updateContest = updateContest;

	activate();

	function activate() {
		Contests.get({
			id: $scope.region
		}).$promise
    .then(function(response) {
    	if (response._id) {
      	$scope.contest = response;
    	}
			getDates();
    }, function(error) {
    	console.log('Error:', error);
    	getDates();
    });
    resetContestForm();
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

  function resetContestForm() {
		$scope.contest = {
			contestTags: [],
			region: $scope.region
		};
  }

	function submit(form) {
		if (form.$invalid) {
  		console.log('Form is missing required fields.');
  		return;			
		}

		// convert datepicker and timepicker and attach to contest object
		$scope.contest.startDate = formatDateTime().start;
		$scope.contest.endDate = formatDateTime().end;

		// if _id exists then we are updating an existing contest
		if ($scope.contest._id) {
			updateContest();
		} else {

			Contests.save($scope.contest).$promise
      .then(function(response) {
        $scope.contest = response;
      });;
		}
	}

	function getDates() {
		if (!$scope.contest._id) {
			// if no contest exists in DB, set calendar and clock to current date/time
			var d = new Date,
					st,
					et;
	    $scope.dateTime.startDate = d;
	    $scope.dateTime.startTime = d;
	    $scope.dateTime.endDate = d;
	    $scope.dateTime.endTime = d;
	    // set minutes to 00
	    $scope.dateTime.startTime.setMinutes(0);
	    $scope.dateTime.endTime.setMinutes(0);
		} else {
			// set calendar and clock to match the contest data
		  $scope.dateTime.startDate = new Date($scope.contest.startDate);
		  st = ISOtoDate($scope.contest.startDate);
	    $scope.dateTime.startTime = new Date(st.getFullYear(), st.getMonth(), st.getDate(), st.getHours(), st.getMinutes(),0 , 0);
	    $scope.dateTime.endDate = new Date($scope.contest.endDate);
	    et = ISOtoDate($scope.contest.endDate);
	    $scope.dateTime.endTime = new Date(et.getFullYear(), et.getMonth(), et.getDate(), et.getHours(), et.getMinutes(),0 , 0);
		}
  }

  function ISOtoDate(ISOdate) {
  	return new Date(ISOdate);
  }

  function updateContest() {
  	Contests.update({
  		id: $scope.contest._id
  	}, $scope.contest)
  	.$promise
  	.then(function(response) {
  		$scope.contest = response;
  	});	
  }

}