(function () {
    'use strict';

    angular.module('app.testresults')
        .controller('TestResultsCtrl', ['$scope', '$filter', '$http', TestResultsCtrl]);

    function TestResultsCtrl($scope, $filter, $http) {
        // $scope.results= $sce.trustAsHtml('<h1>sup</h1>');
        $scope.results = '<h4>fetching results</h4>'
        var url = window.location.href.split('/').pop();
        if (url === 'nlp') {
          $http.get('http://localhost:9999/run')
          .then(function(r) {
            $scope.results = r;
          }, function(e) {
            $scope.results = '<h1>Error</h1><p>could not run tests at <a href="$URL">$URL</a>.  Please make sure cinna-slack/nlp/test-runner.js is running.</p>'.replace(/\$URL/g, e.config.url);

          })
        }
    }

})();
