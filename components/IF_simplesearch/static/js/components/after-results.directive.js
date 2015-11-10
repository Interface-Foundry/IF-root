simpleSearchApp.directive('afterResults', ['$document', function($document) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            windowHeight: '='
        },
        link: function(scope) {
            if (scope.$parent.$last) {
                scope.windowHeight = $document[0].body.clientHeight;
            }
        }
    };
}]);