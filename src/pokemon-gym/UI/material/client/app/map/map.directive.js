(function () {
    'use strict';

    angular.module('app.ui.map')
    .directive('uiJvectormap', uiJvectormap);

    function uiJvectormap() {
        return {
            restrict: 'A',
            scope: {
            options: '='
            },
            link: function(scope, ele, attrs) {
            var options;

            options = scope.options;
            ele.vectorMap(options);
            }
        }
    }

})(); 