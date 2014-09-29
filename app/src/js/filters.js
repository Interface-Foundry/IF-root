'use strict';

/* Filters */

angular.module('tidepoolsFilters', []).filter('hashtag', function() {
  return function(input) {

  //http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript
  return input.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
    var tag = t.replace("#","");
    return t.link("#/talk/"+tag);
  });
  };
})

//Filtering youtube links to auto-display
.filter('youtubestrip', function() {
  return function(input) {

      //Filtering normal youtube link
      if(input){
        var newstr = input.replace(/^[^_]*=/, "");
        return newstr;
        //return youtube_parser(input);
      }
      
     function youtube_parser(url){
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match&&match[7].length==11){
              return match[7];
          }else{
              console.log("The video link doesn't work :(");
          }
      }

  };
})

.filter('url', function() {
  return function(input) {
    //http://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return input.replace(urlRegex, function(url) {  
        return '<a href="' + url + '">' + url + '</a>';  
    })  
              
  };
})

//validate html
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})

//convert from http to https urls
.filter('httpsify', function() {
    return function(val) {
        return val.replace(/^http:\/\//i, 'https://');
    };
})

.filter('userName', function() {
	return function(name) {
		var i;
		if (typeof name == 'string') {
		i = name.indexOf('@');
			if (i != -1) {
				return name.substr(0,i);
			} else {return name;}
		} else { return name; }
	}	
})


.filter('datetime', function($filter)
{
 return function(input)
 {
  if(input == null){ return ""; } 
 
  var _date = $filter('date')(new Date(input),
                              'hh:mm a - MMM dd, yyyy');
 
  return _date.toUpperCase();

 };
});
