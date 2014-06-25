//parent
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope, leafletData) {

	$scope.pageIndex = 0;
	$scope.pageClass = [];
	$scope.pageClass[0] = 'current';
	$scope.pageClass[1] = 'right';
	$scope.pageClass[2] = 'right';
	$scope.pageClass[3] = 'right';
	$scope.pageClass[4] = 'right';

    $scope.world = { 
        stats: { 
            avatar: "img/tidepools/default.jpg" 
        }
    };
	
	$('.color').spectrum({
		color: '#0000ff'
	});
	
	angular.element('#fileupload').fileupload({
        url: '/api/upload',
        dataType: 'text',
        progressall: function (e, data) {  

            $('#progress .bar').css('width', '0%');

            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .bar').css(
                'width',
                progress + '%'
            );
        },
        done: function (e, data) {

            $('#uploadedpic').html('');
            $('#preview').html('');
            $('<p/>').text('Saved: '+data.originalFiles[0].name).appendTo('#uploadedpic');
            $('<img src="'+ data.result +'">').load(function() {
              $(this).width(150).height(150).appendTo('#preview');
            });
            $scope.world.stats.avatar = data.result;
        }
    });

	
	$scope.nextPage = function () {
		if ($scope.pageIndex<($scope.pageClass.length-1)) {
			$scope.pageClass[$scope.pageIndex] = 'left';
		
			$scope.pageIndex += 1;
			$scope.pageClass[$scope.pageIndex] = 'current';
		}
	};
	
	$scope.prevPage = function() {
		if ($scope.pageIndex>0) {
			$scope.pageClass[$scope.pageIndex] = 'right';
			$scope.pageIndex = $scope.pageIndex - 1; 
			$scope.pageClass[$scope.pageIndex] = 'current';
		}
	}
	
	function refreshMap(){ 
        leafletData.getMap('worldDetailMap').then(function(map) {
            map.invalidateSize();
        });
    }

	
    if (navigator.geolocation) {

        // Get the user's current position
        navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:50000});

        function showPosition(position) {

            userLat = position.coords.latitude;
            userLon = position.coords.longitude;

            console.log(userLat);

            $scope.center = {
                    lat: userLat,
                    lng: userLon,
                    zoom: 12
                };
            $scope.tiles = tilesDict.mapbox;
            
            $scope.markers = {
                    m: {
                        lat: userLat,
                        lng: userLon,
                        message: "<p style='color:black;'>Drag to Location on map</p>",
                        focus: true,
                        draggable: true,
                        icon: local_icons.yellowIcon
                    }
                };
			

            refreshMap();
        }

        function locError(){

            console.log('no loc');
        }

    } else {
        
    }
}