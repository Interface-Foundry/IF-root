// IF Global Settings

var userLat;
var userLon;
var global_mapCenter;

var local_icons = {
    defaultIcon: {},
    yellowIcon: {
    
      iconUrl: 'img/marker-icon.png',
      shadowUrl: 'img/marker-shadow.png',
      iconSize:     [25, 41], // size of the icon
      shadowSize:   [41, 41], // size of the shadow
      iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
      shadowAnchor: [12, 40],  // the same for the shadow
      popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor

    },
    leafIcon: {
        iconUrl: 'img/leaf-green.png',
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    },
    orangeLeafIcon: {
        iconUrl: 'img/leaf-orange.png',
      shadowUrl: 'img/leaf-shadow.png',
      iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    },
    divIcon: {
        type: 'div',
      iconSize: [200, 0],
      popupAnchor:  [0, 0],
        html: 'Using <strong>Bold text as an icon</strong>:'
    }
}




var tilesDict = {
    openstreetmap: {
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    mapbox: {
        url: 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
        options: {
            attribution: '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
            minZoom: 1,
            maxZoom: 23,
            reuseTiles: true
        }
    },
    amc: {
        url: '1.0.0/amc2013/{z}/{x}/{y}.png',
        options: {
            minZoom: 1,
            maxZoom: 20,
            tms: 'true',
            reuseTiles: true
        }
    }
};




//----------- THIS LOADS A CLOUD MAP --------//

var mapSelect = 'cloud'; //loading 'cloud' setting as specified in: js/angular-leaflet-directive.js
// var global_mapCenter = { //this is the "center" of your community or event, for mapping purposes
//     lat: 40.676752,
//     lng: -74.004618,
//     zoom: 15
// };

//--------------------------------------------------//

// //AN EXAMPLE using local AMC2013 map
 //----------- THIS LOADS A LOCAL MAP -----------------//

  // var mapSelect = 'amc2013'; //loading 'amc2013' local map setting as specified in: js/angular-leaflet-directive.js
  // var global_mapCenter = {
  //     lat: 42.356886,
  //     lng: -83.069523,
  //     zoom: 14
  // };

//----------------------------------------------------//


//---------- TWEET STREAM -------//
//one or more hashtags for base twitter gathering 
var global_hashtag = "#awards";
//can also be multiple:
//var global_hashtag = '#lol,#what,#soitgoes';
//-------------------------------//


var eventCategories = ['Lecture','Show'];

var placeCategories = ['Lecture','Show','Award Nominee'];


var globalEditLoc = {}; //this is a temp variable for an issue with angular leaflet directive in landmark-edit

//parsing node.js usage of file
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports.hashtag = global_hashtag;
}

var mainWindow;

// $(document).ready(function() {

//   mainWindow = $(window).height();

//   $('#main').css('height', mainWindow + 'px');
//   $('#wrapper').css('height', mainWindow + 'px');

// });


        



//------ SHELF PAN CONTROL ------//

var he;


 // $(window).resize(function() {

 //    var mainWindow = $(window).height();

 //    $('#main').css('height', mainWindow + 'px');
 //    $('#wrapper').css('height', mainWindow + 'px');

 //  });


function shelfPan(amount){



    // leafletData.getMap().then(function(map) {
    //     // map.panTo( [$scope.landmark.loc[0], $scope.landmark.loc[1]] );
    //     // map.setZoom(16);
    //     map.invalidateSize();
    // });


  
    if (amount == 'return'){

      console.log(amount);


      if ( $("body").hasClass("lense2") ) {

        $('body').toggleClass('lense2');


        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });

      }

      if ( $("body").hasClass("lense") ) {
        $('body').toggleClass('lense');


        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });
      }


    }


    if (amount == 'full'){

  
  
      if ( $("body").hasClass("lense") ) {

        console.log(amount);
        console.log('lense');

        $('body').toggleClass('lense');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });



      }

      else if ( $("body").hasClass("lense2") ) {

        console.log(amount);
        console.log('lense2');

        he = $(window).height();

        he = he - 128;

        $('body').toggleClass('lense2');
        $('body').toggleClass('lense');
       // $("#shelf").css({"-webkit-transform": "translateY(" + he + "px" + ")"});

        $("#shelf").css({
          "-webkit-transform": "translateY(" + he + "px" + ")",
          "-moz-transform": "translateY(" + he + "px" + ")", 
          "-ms-transform": "translateY(" + he + "px" + ")", 
          "-o-transform": "translateY(" + he + "px" + ")",
          "transform": "translateY(" + he + "px" + ")"
        });

        // var testHe = $(window).height();

        // testHe = testHe - 128;

        // console.log(testHe);

        $("#leafletmap").css({"height": he + "px" });

        // $("#leafletmap").css({
        //   "height":"1100px; !important"
        //   "transform": "translateY(" + 1000 + "px" + ")"
        // });


      }

      else {

        console.log(amount);
        console.log('noclass');

        he = $(window).height();

        he = he - 128;

        $('body').toggleClass('lense');
       // $("#shelf").css({"-webkit-transform": "translateY(" + he + "px" + ")"});

        $("#shelf").css({
          "-webkit-transform": "translateY(" + he + "px" + ")",
          "-moz-transform": "translateY(" + he + "px" + ")", 
          "-ms-transform": "translateY(" + he + "px" + ")", 
          "-o-transform": "translateY(" + he + "px" + ")",
          "transform": "translateY(" + he + "px" + ")"
        });

        $("#leafletmap").css({"height": he + "px" });

       
      }

    }


    if (amount == 'partial'){


      if ( $("body").hasClass("lense") ) {

        console.log(amount);
        console.log('lense');

        $('body').toggleClass('lense');
        // $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });
        //$('body').toggleClass('lense2');

        $("#leafletmap").css({"height": 183 + "px" });
      }

      else if ( $("body").hasClass("lense2") ) {

        console.log(amount);
        console.log('lense2 else if');
        $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 0 + "px" + ")",
          "-moz-transform": "translateY(" + 0 + "px" + ")", 
          "-ms-transform": "translateY(" + 0 + "px" + ")", 
          "-o-transform": "translateY(" + 0 + "px" + ")",
          "transform": "translateY(" + 0 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });
      }

      else {
        console.log(amount);
        console.log('lense2 else');
        $('body').toggleClass('lense2');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 180 + "px" + ")",
          "-moz-transform": "translateY(" + 180 + "px" + ")", 
          "-ms-transform": "translateY(" + 180 + "px" + ")", 
          "-o-transform": "translateY(" + 180 + "px" + ")",
          "transform": "translateY(" + 180 + "px" + ")"
        });

        $("#leafletmap").css({"height": 183 + "px" });

      }


    }

    if (amount == "new"){

        $('body').toggleClass('lense');

        $("#shelf").css({
          "-webkit-transform": "translateY(" + 250 + "px" + ")",
          "-moz-transform": "translateY(" + 250 + "px" + ")", 
          "-ms-transform": "translateY(" + 250 + "px" + ")", 
          "-o-transform": "translateY(" + 250 + "px" + ")",
          "transform": "translateY(" + 250 + "px" + ")"
        });

        $("#leafletmap").css({"height": 250 + "px" });

    }



  }

  //---------------------//