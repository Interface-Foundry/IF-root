(function () {
    'use strict';

    angular.module('app.chart')
    .controller('ChartjsCtrl', ['$scope', '$rootScope', ChartjsCtrl])

    function ChartjsCtrl($scope, $rootScope){
        $scope.bar = {};
        $scope.line = {};
        $scope.radar = {};
        $scope.polarArea = {};
        $scope.doughnut = {};
        $scope.pie = {};

        ////

        Chart.defaults.global.tooltipCornerRadius = 2;
        Chart.defaults.global.colours = [
            { // primary
                fillColor: 'rgba(63,81,181,0.3)',
                strokeColor: 'rgba(63,81,181,1)',
                pointColor: 'rgba(63,81,181,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(63,81,181,0.8)'
            }, { // gray
                fillColor: 'rgba(187,187,187,0.3)',
                strokeColor: 'rgba(187,187,187,1)',
                pointColor: 'rgba(187,187,187,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(187,187,187,0.8)'
            }, { // success
                fillColor: 'rgba(76,175,80,0.3)',
                strokeColor: 'rgba(76,175,80,1)',
                pointColor: 'rgba(76,175,80,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(76,175,80,0.8)'
            }, { // danger
                fillColor: 'rgba(244,67,54,0.3)',
                strokeColor: 'rgba(244,67,54,1)',
                pointColor: 'rgba(244,67,54,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(244,67,54,0.8)'
            }, { // warning
                fillColor: 'rgba(255,193,7,0.3)',
                strokeColor: 'rgba(255,193,7,1)',
                pointColor: 'rgba(255,193,7,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(255,193,7,0.8)'
            }, { // dark grey
                fillColor: 'rgba(77,83,96,0.3)',
                strokeColor: 'rgba(77,83,96,1)',
                pointColor: 'rgba(77,83,96,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(77,83,96,1)'
            }
        ];

        // var charts = [];
        // $scope.$on('create', function (event, chart) {
        //     charts.push(chart);
        // });

        // $scope.resize = function() {
        //     charts.forEach( function(chart) {
        //         chart.resize(chart.render);
        //     });
        // }

        // $rootScope.$on("layout:changed", function (event, currentRoute, previousRoute) {
        //     charts.forEach( function(chart) {
        //         chart.resize(chart.render);
        //     });
        // });

        $scope.bar = {
            labels: ['2009', '2010', '2011', '2012', '2013', '2014'],
            series: ['A', 'B'],
            data: [
                [59, 40, 61, 26, 55, 40],
                [38, 80, 19, 66, 27, 90]
            ],
            options: {
                barValueSpacing: 15
            }
        }
        $scope.line = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            series: ['A', 'B'],
            data: [
                [28, 48, 40, 19, 86, 27, 90],
                [65, 55, 75, 55, 65, 50, 55]
            ],
            options: {
                // scaleOverride: true,
                // scaleBeginAtZero: true
            }
        }

        $scope.radar = {
            labels:["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
            data: [
                [65, 59, 90, 81, 56, 55, 40],
                [28, 48, 40, 19, 96, 27, 100]
            ]
        }
        $scope.polarArea = {
            labels: ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"],
            data: [300, 500, 100, 40, 120]
        }

        $scope.doughnut = {
            labels: ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
            data: [300, 500, 100]         
        }
        $scope.pie = {
            labels: ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
            data: [300, 500, 100]
        }
    }
})(); 
