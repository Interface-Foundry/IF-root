(function () {
    'use strict';

    angular.module('app.chart')
        .controller('FlotChartCtrl', ['$scope', FlotChartCtrl]);


    function FlotChartCtrl($scope) {
        var areaChart, barChart, barChartClean, barChartH, 
        lineChart1, lineChart2, sampledata1, sampledata2;

        $scope.line1 = {};
        $scope.line2 = {};
        $scope.area = {};
        $scope.barChartCleanH = {};
        $scope.barChartCleanV = {};
        $scope.combo1 = {};
        $scope.combo2 = {};
        $scope.barChartStacked = {};
        $scope.barChartVertical = {};
        $scope.barChartHorizontal = {};
        $scope.pieChart = {};
        $scope.donutChart = {};
        $scope.donutChartHarmony = {};
        $scope.donutNationality = {};
        $scope.combo3 = {};
        $scope.line3 = {};
        $scope.tmp = {};


        $scope.line3.data = [{
            label: "Too",
            data: [[0, 19], [1, 29], [2, 38], [3, 45], [4, 51], [5, 63], [6, 71], [7, 75], [8, 78], [9, 76], [10, 78] ],
            lines: {
                show: true,
                fill: true,
                lineWidth: 2,
                fillColor: {colors: ["rgba(255,255,255,.1)", "rgba(79,195,247,.8)"]}
            }
        }];
        $scope.line3.options = {
            grid: {
                borderWidth: 0,
                borderColor: "#f0f0f0",
                margin: 0,
                minBorderMargin: 0,
                labelMargin: 20,
                hoverable: true,
                clickable: true
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s X: %x Y: %y",
                shifts: {y: 25 },
                defaultTheme: false
            },
            legend: {
                labelBoxBorderColor: "#ccc",
                show: false,
                noColumns: 0
            },
            series: {
                stack: true,
                shadowSize: 0,
                highlightColor: 'rgba(30,120,120,.5)'
            },
            xaxis: {
                tickLength: 0,
                tickDecimals: 0,
                show: true,
                min: 2,
                font: {
                    style: "normal",
                    color: "#666666"
                }
            },
            yaxis: {
                ticks: 3,
                tickDecimals: 0,
                show: true,
                tickColor: "#f0f0f0",
                font: {
                    style: "normal",
                    color: "#666666"
                }
            },
            points: {
                show: true,
                radius: 2,
                symbol: "circle"
            },
            colors: [$scope.color.info]
        };


        $scope.donutNationality.data = [ 
            { label: "United States", data: 40 }, 
            { label: "United Kingdom", data: 10 },
            { label: "Canada", data: 20 },
            { label: "Germany", data: 12 },
            { label: "Japan", data: 18 }
        ];
        $scope.donutNationality.options = {
            series: { 
                pie: { 
                    show: true,
                    innerRadius: 0.75,
                    stroke: { width: 0 }
                } 
            },
            colors: [$scope.color.success, $scope.color.primary, $scope.color.infoAlt,$scope.color.info, $scope.color.warning],
            grid: { hoverable: true, clickable: true, borderWidth: 0, color: '#ccc' },   
            legend: {
                show: true
            },            
            tooltip: true,
            tooltipOpts: { 
                content: '%s: %p.0%',
                defaultTheme: true
            }
        };

        ////

        lineChart1 = {};
        lineChart1.data1 = [[1, 15], [2, 20], [3, 14], [4, 10], [5, 10], [6, 20]];
        $scope.line1.data = [{data: lineChart1.data1, label: 'Trend'} ];
        $scope.line1.options = {
            series: {
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {colors: [{opacity: 0 }, {opacity: 0.3 } ] }
                },
                points: {
                    show: true,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 5
                }
            },
            colors: [$scope.color.primary, $scope.color.infoAlt],
            tooltip: true,
            tooltipOpts: {defaultTheme: false },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            xaxis: {
                ticks: [[1, 'Jan.'], [2, 'Feb.'], [3, 'Mar.'], [4, 'Apr.'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'Aug.'], [9, 'Sept.'], [10, 'Oct.'], [11, 'Nov.'], [12, 'Dec.']]
            }
        };

        lineChart2 = {};
        lineChart2.data1 = [[1, 20], [2, 14], [3, 16], [4, 22], [5, 28], [6, 38]];
        lineChart2.data2 = [[1, 26], [2, 24], [3, 22], [4, 22], [5, 20], [6, 16]];
        $scope.line2.data = [
            {
                data: lineChart2.data1,
                label: "Profit"
            }, {
                data: lineChart2.data2,
                label: "Cost",
                yaxis: 2
            }
        ];
        $scope.line2.options = {
            series: {
                lines: {
                    show: true,
                    fill: false
                },
                points: {
                    show: true,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#fff",
                    symbol: "circle",
                    radius: 5
                },
                shadowSize: 0
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            colors: [$scope.color.primary, $scope.color.success],
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            xaxis: {
                ticks: [[1, 'Jan.'], [2, 'Feb.'], [3, 'Mar.'], [4, 'Apr.'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'Aug.'], [9, 'Sept.'], [10, 'Oct.'], [11, 'Nov.'], [12, 'Dec.']]
            },
            yaxes: [
            {
                min: 0,
                max: 50
            }, {
                min: 0,
                max: 50,
                position: "right"
            }
            ]
        };



        areaChart = {};
        areaChart.data1 = [[2017, 15], [2018, 20], [2019, 10], [2020, 5], [2021, 9]];
        areaChart.data2 = [[2017, 15], [2018, 16], [2019, 22], [2020, 14], [2021, 12]];
        $scope.area.data = [
            {
                data: areaChart.data1,
                label: "Value A",
                lines: {
                    fill: true
                }
            }, {
                data: areaChart.data2,
                label: "Value B",
                points: {
                    show: true
                },
                yaxis: 2
            }
        ];
        $scope.area.options = {
            series: {
                lines: {
                    show: true,
                    fill: false
                },
                points: {
                    show: true,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 5
                },
                shadowSize: 0
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            colors: [$scope.color.success, $scope.color.danger],
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            xaxis: {
                mode: "time"
            },
            yaxes: [
            {}, {
                position: "right"
            }
            ]
        };


        // Clean style
        barChartClean = {};
        barChartClean.dataH1 = [[40, 1], [59, 2], [50, 3], [81, 4], [56, 5]];
        barChartClean.dataH2 = [[28, 1], [48, 2], [90, 3], [19, 4], [45, 5]];
        barChartClean.dataV1 = [[1, 28], [2, 48], [3, 90], [4, 19], [5, 45], [6, 58]];
        barChartClean.dataV2 = [[1, 40], [2, 59], [3, 50], [4, 81], [5, 56], [6, 49]];
        $scope.barChartCleanH.data = [
        {
            label: " A",
            data: barChartClean.dataH1,
            bars: {
                order: 0,
                fillColor: {
                    colors: [
                    {
                        opacity: 0.3
                    }, {
                        opacity: 0.3
                    }
                    ]
                }
            }
        }, {
            label: " B",
            data: barChartClean.dataH2,
            bars: {
                order: 1,
                fillColor: {
                    colors: [
                    {
                        opacity: 0.3
                    }, {
                        opacity: 0.3
                    }
                    ]
                }
            }
        }
        ];
        $scope.barChartCleanH.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: .35,
                    align: "center",
                    horizontal: true
                }
            },
            grid: {
                show: true,
                aboveData: false,
                color: '#eaeaea',
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eaeaea"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.primary, $scope.color.info, $scope.color.danger]
        };

        $scope.barChartCleanV.data = [
        {
            label: " A",
            data: barChartClean.dataV1,
            bars: {
                order: 0,
                fillColor: {
                    colors: [
                    {
                        opacity: 0.3
                    }, {
                        opacity: 0.3
                    }
                    ]
                }
            }
        }, {
            label: " B",
            data: barChartClean.dataV2,
            bars: {
                order: 1,
                fillColor: {
                    colors: [
                    {
                        opacity: 0.3
                    }, {
                        opacity: 0.3
                    }
                    ]
                }
            }
        }
        ];
        $scope.barChartCleanV.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: .25,
                    align: "center",
                    horizontal: false
                }
            },
            grid: {
                show: true,
                aboveData: false,
                color: '#eaeaea',
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eaeaea"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.primary, $scope.color.info, $scope.color.danger]
        };


        $scope.combo3.data = [ 
            { 
                label: 'WOM channels',
                bars: { show: true, fill: true, barWidth: 0.5, align: "center", order: 1, fillColor: { colors: [{ opacity: 1 }, { opacity: 1}] } },
                data: [ [0,75],[1,62],[2,45],[3,60],[4,73], [5,50],[6,31],[7,56],[8,70],[9,63],[10,49],[11,72],[12, 76],[13,67],[14,46],[15,51],[16,69],[17,59],[18,85],[19,67],[20,56] ]
            },
            { 
                label: 'Viral channels',
                curvedLines: { apply: true },
                lines: {show: true, fill: true, fillColor: {colors: [{opacity: .7 }, {opacity: 1 } ] } },
                data: [ [2,0],[3,5],[4,20],[5,15],[6,30],[7,28],[8,25],[9,40],[10,60],[11,40],[12,43],[13,32],[14,36],[15,23],[16,12],[17,15],[18,0] ] 
            },
            { 
                label: 'Paid channels',
                curvedLines: { apply: true },
                lines: {show: true, fill: true, fillColor: {colors: [{opacity: .7 }, {opacity: 1 } ] } },
                data: [ [4,1],[5,6],[6,15],[7,8],[8,16],[9,9],[10,25],[11,12],[12,50],[13,20],[14,25],[15,12],[16,0] ] 
            }
        ];
        $scope.combo3.options = {
            colors: [$scope.color.gray, $scope.color.success, $scope.color.info,  $scope.color.info],
            series: { 
                shadowSize: 1,
                curvedLines: {active: true }
            },
            xaxis:{ font: { color: '#607685' } },
            yaxis:{ font: { color: '#607685' } },
            grid: { hoverable: true, clickable: true, borderWidth: 0, color: '#ccc' },                
            tooltip: true
        };




        // Clean Style
        sampledata1 = [[1, 70], [2, 55], [3, 68], [4, 81], [5, 56], [6, 55], [7, 68], [8, 45], [9, 35]];
        sampledata2 = [[1, 28], [2, 48], [3, 30], [4, 60], [5, 100], [6, 50], [7, 10], [8, 25], [9, 50]];
        $scope.combo1.data = [
            {
                label: " A",
                data: sampledata1,
                bars: {
                    order: 0,
                    fillColor: { colors: [{opacity: 0.3}, {opacity: 0.3} ] },
                    show: true,
                    fill: 1,
                    barWidth: 0.3,
                    align: "center",
                    horizontal: false
                }
            }, {
                data: sampledata2,
                curvedLines: {
                    apply: true
                },
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {colors: [{opacity: 0.2 }, {opacity: 0.2 } ] }
                }
            }, {
                data: sampledata2,
                label: "D",
                points: {
                    show: true
                }
            }
        ];
        $scope.combo1.options = {
            series: {
                curvedLines: {
                    active: true
                },
                points: {
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 4
                }
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.primary, $scope.color.primary]
        };

        $scope.combo2.data = [
            {
                data: sampledata1,
                curvedLines: {
                    apply: true
                },
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                        {
                            opacity: 0.2
                        }, {
                            opacity: 0.2
                        }
                        ]
                    }
                }
            }, {
                data: sampledata1,
                label: "C",
                points: {
                    show: true
                }
            }, {
                data: sampledata2,
                curvedLines: {
                    apply: true
                },
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                        {
                            opacity: 0.2
                        }, {
                            opacity: 0.2
                        }
                        ]
                    }
                }
            }, {
                data: sampledata2,
                label: "D",
                points: {
                    show: true
                }
            }
        ];
        $scope.combo2.options = {
            series: {
                curvedLines: {
                    active: true
                },
                points: {
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 4
                }
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.gray, $scope.color.primary, $scope.color.primary]
        };






        barChart = {};
        barChart.data1 = [[2009, 10], [2010, 5], [2011, 5], [2012, 20], [2013, 28]];
        barChart.data2 = [[2009, 22], [2010, 14], [2011, 12], [2012, 19], [2013, 22]];
        barChart.data3 = [[2009, 30], [2010, 20], [2011, 19], [2012, 13], [2013, 20]];
        $scope.barChartStacked.data = [
            {
                label: "Value A",
                data: barChart.data1
            }, {
                label: "Value B",
                data: barChart.data2
            }, {
                label: "Value C",
                data: barChart.data3
            }
        ];
        $scope.barChartStacked.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 0.3,
                    align: "center",
                    horizontal: false,
                    order: 1
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };
        // Vertical
        $scope.barChartVertical.data = [
        {
            label: "Value A",
            data: barChart.data1,
            bars: {
                order: 0
            }
        }, {
            label: "Value B",
            data: barChart.data2,
            bars: {
                order: 1
            }
        }, {
            label: "Value C",
            data: barChart.data3,
            bars: {
                order: 2
            }
        }
        ];
        $scope.barChartVertical.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 0.2,
                    align: "center",
                    horizontal: false
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            yaxis: {
                max: 40
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };

        barChartH = {};
        barChartH.data1 = [[85, 10], [50, 20], [55, 30]];
        barChartH.data2 = [[77, 10], [60, 20], [70, 30]];
        barChartH.data3 = [[100, 10], [70, 20], [55, 30]];
        $scope.barChartHorizontal.data = [
        {
            label: "Value A",
            data: barChartH.data1,
            bars: {
                order: 1
            }
        }, {
            label: "Value B",
            data: barChartH.data2,
            bars: {
                order: 2
            }
        }, {
            label: "Value C",
            data: barChartH.data3,
            bars: {
                order: 3
            }
        }
        ];
        $scope.barChartHorizontal.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 1,
                    align: "center",
                    horizontal: true
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };


        $scope.pieChart.data = [
            {
                label: "New User",
                data: 22
            }, {
                label: "Returning User",
                data: 78
            }
        ];
        $scope.pieChart.options = {
            series: {
                pie: {show: true }
            },
            legend: {
                show: true
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: [$scope.color.gray, $scope.color.info],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };


        $scope.donutChart.data = [
        {
            label: "Download Sales",
            data: 12
        }, {
            label: "In-Store Sales",
            data: 30
        }, {
            label: "Mail-Order Sales",
            data: 20
        }, {
            label: "Online Sales",
            data: 19
        }
        ];
        $scope.donutChart.options = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0.5
                }
            },
            legend: {
                show: true
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: [$scope.color.primary, $scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };


        $scope.donutChartHarmony.data = [
        {
            label: "Direct Traffic",
            data: 12
        }, {
            label: "Referrals Traffic",
            data: 30
        }, {
            label: "Search Traffic",
            data: 20
        }, {
            label: "Social Traffic",
            data: 19
        }, {
            label: "Mail Traffic",
            data: 15
        }
        ];
        $scope.donutChartHarmony.options = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0.55
                }
            },
            legend: {
                show: false
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: ["#1BB7A0", "#39B5B9", "#52A3BB", "#619CC4", "#6D90C5"],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };        
    }

})(); 

