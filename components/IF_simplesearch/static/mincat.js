function calcDistance(e,t,o,n){var i=Array.prototype.map.call(arguments,function(e){return e/180*Math.PI}),o=i[0],n=i[1],e=i[2],t=i[3],r=6372.8,a=e-o,l=t-n,s=Math.sin(a/2)*Math.sin(a/2)+Math.sin(l/2)*Math.sin(l/2)*Math.cos(o)*Math.cos(e),c=2*Math.asin(Math.sqrt(s));return r*c}function roundFloat(e,t){return"undefined"==typeof t||0===+t?Math.round(e):(e=+e,t=+t,isNaN(e)||"number"!=typeof t||t%1!==0?NaN:(e=e.toString().split("e"),e=Math.round(+(e[0]+"e"+(e[1]?+e[1]+t:t))),e=e.toString().split("e"),+(e[0]+"e"+(e[1]?+e[1]-t:-t))))}var simpleSearchApp=angular.module("simpleSearchApp",["ngHolder","angularMoment","ngRoute","angular-inview","smoothScroll"]).filter("httpsURL",function(){return function(e){if(e.indexOf("https")>-1);else{var t=/http/gi;e=e.replace(t,"https")}return e}}).filter("deCapslock",function(){return function(e){e=e.toLowerCase();var t=/\s((a[lkzr])|(c[aot])|(d[ec])|(fl)|(ga)|(hi)|(i[dlna])|(k[sy])|(la)|(m[edainsot])|(n[evhjmycd])|(o[hkr])|(pa)|(ri)|(s[cd])|(t[nx])|(ut)|(v[ta])|(w[aviy]))$/,o=e.match(t);return null!==o&&(o=o[0].toUpperCase(),e=e.replace(t,o)),e}}).factory("location",["$location","$route","$rootScope",function(e,t,o){return e.skipReload=function(){var n=t.current,i=o.$on("$locationChangeSuccess",function(){t.current=n,i()});return e},e}]).config(["$routeProvider","$locationProvider",function(e,t){e.when("/",{templateUrl:"partials/home.html",controller:"HomeCtrl"}).when("/q/:query/:lat/:lng/:cityName",{templateUrl:"partials/results.html",controller:"HomeCtrl"}).when("/t/:parentId/:mongoId",{templateUrl:"partials/item.html",controller:"HomeCtrl"}).otherwise({redirectTo:"/"}),t.html5Mode({enabled:!0,requireBase:!1})}]);simpleSearchApp.controller("HomeCtrl",["$scope","$http","$location","$document","$timeout","$interval","amMoment","$window","$routeParams","location","$rootScope","$route",function(e,t,o,n,i,r,a,l,s,c,d,u){function m(o){console.log(o),p=o.coords.latitude,g=o.coords.longitude,t.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+p+","+g+"&sensor=true").then(function(t){for(var o=0;o<t.data.results.length;o++)if("APPROXIMATE"==t.data.results[o].geometry.location_type){t.data.results[o].formatted_address=t.data.results[o].formatted_address.replace(", USA",""),e.userCity=t.data.results[o].formatted_address,h=e.userCity,e.loadingLoc=!1;break}},function(e){})}console.log("Want to API with us? Get in touch: hello@interfacefoundry.com");var p,g,h,f,I=!1,y=null,w=null;e.showGPS=!0,e.searchIndex=0,e.items=[],e.newQuery=null,e.expandedIndex=null,e.isExpanded=!1,e.outerWidth=$(window)[0].outerWidth,e.outerHeight=$(window)[0].outerHeight,e.mobileModalHeight,e.mobileFooterPos,e.mobileScreen=!1,e.mobileScreenIndex,e.showReportModal=null,e.report={},e.mobileImgIndex=0,e.mobileImgCnt=0,e.parent={},/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&(e.mobileScreen=!0),d.$on("$locationChangeState",function(e){e.preventDefault()}),e.returnHome=function(e){"home"===e?(o.path("/"),i(function(){u.reload()},0),u.reload()):e._id&&(o.path("/t/"+e.parent._id+"/"+e._id),i(function(){u.reload()},0))},e.emptyQuery=function(){e.query=""},e.sayHello=function(){I||e.searchQuery()},e.closeMobileWrapper=function(t){if(e.mobileScreen){var o=$(".expandMobileWrapper.mWrapper"+t);o.css({width:""+e.outerWidth+"px",height:"0"}),e.mobileScreenIndex=null}},e.chooseImage=function(t){e.mobileImgIndex=t},e.singleItemMobile=function(t,o,n){i(function(){e.mobileModalHeight=$("#expandedModal"+t)[0].clientHeight+40*(o-1);var n=$("#thumbContainer"+t);n.css({bottom:e.mobileModalHeight})},100)},e.expandContent=function(t,o,n){e.mobileScreen?"close"===o?(e.mobileScreenIndex=null,$("body").removeClass("modalOpen"),$("html").removeClass("modalOpen"),$("div.container-fluid").removeClass("modalOpen"),$(window).off(),$(window).off(),e.mobileImgIndex=0,e.mobileModalHeight=0):(i(function(){e.mobileModalHeight=$("#expandedModal"+t)[0].clientHeight+40*(n-1);var o=$("#thumbContainer"+t);o.css({bottom:e.mobileModalHeight})},100),e.mobileScreenIndex=t,$("body").addClass("modalOpen"),$("html").addClass("modalOpen"),$("div.container-fluid").addClass("modalOpen"),$(window).on("touchstart",function(e){y=e.originalEvent.targetTouches[0].clientX,w=e.originalEvent.targetTouches[0].clientY})):e.expandedIndex===t?(e.expandedIndex=null,$(".row"+t).removeClass("expand"),e.isExpanded=!1):null!==e.expandedIndex?($(".row"+e.expandedIndex).removeClass("expand"),$(".row"+t).addClass("expand"),e.expandedIndex=t):($(".row"+t).addClass("expand"),e.expandedIndex=t)},$(window).on("click",function(t){"collapsedContent"===t.target.className&&($(".row"+e.expandedIndex).removeClass("expand"),e.expandedIndex=null)}),e.enlargeImage=function(t,o){e.mobileScreen?$(".mobileImg"+t).css({"background-image":"url("+o+")"}):$(".largeImage"+t).css({"background-image":"url("+o+")"})},$("#locInput").geocomplete({details:"form",types:["geocode"]}).bind("geocode:result",function(t,o){e.userCity=o.formatted_address,e.newQuery=!0}),e.getGPSLocation=function(){e.loadingLoc=!0,navigator.geolocation?navigator.geolocation.getCurrentPosition(m):console.log("no geolocation support")},document.onclick=function(t){e.itemHighlight="form-grey",e.locationHighlight="form-grey"},e.scrollTop=function(){o.hash("topQueryBar"),$anchorScroll()},e.randomSearch=function(t){var o=["70s","vintage","fur","orange","health goth"];e.query=o[Math.floor(Math.random()*o.length)],e.searchQuery()},e.searchThis=function(t){e.query=t,e.searchQuery()},e.searchQuery=function(o){if("button"===o&&(e.items=[],e.searchIndex=0,$("input").blur()),I=!0,e.userCity!==h){h=e.userCity;var n=encodeURI(h);t.get("https://maps.googleapis.com/maps/api/geocode/json?address="+n+"&key=AIzaSyCABdI8Lpm5XLQZh-O4SpmShqMEKqKteUg").then(function(t){t.data.results[0]&&t.data.results[0].geometry&&(p=t.data.results[0].geometry.location.lat,g=t.data.results[0].geometry.location.lng),e.searchItems()},function(e){})}else e.searchItems()},e.searchItems=function(){var r=null,a=null,r=encodeURI(e.query),a=encodeURI(e.userCity);o.path("/q/"+r+"/"+p+"/"+g+"/"+a),e.newQuery&&(e.newQuery=!1),t.post("https://kipapp.co/styles/api/items/search?page="+e.searchIndex,{text:e.query,loc:{lat:p,lon:g},radius:5}).then(function(t){if(c.skipReload().path("/q/"+r+"/"+p+"/"+g+"/"+a).replace(),e.items=e.items.concat(t.data.results),e.items.length<1&&(e.noResults=!0,console.log("no results")),e.items&&e.items.length){e.noResults=!1;for(var o=0;o<e.items.length;o++){if(e.items[o].owner||e.items.splice(o,1),e.items[o].itemImageURL.length>6){var l=(e.items[o].itemImageURL.length-6,e.items[o].itemImageURL),s=l.length/2;l=l.splice(s,2)}if(e.items[o].parent.tel){var d=e.items[o].parent.tel;d=d.replace(/[+-\s]/g,""),11===d.length&&(d=d.replace(/^1/g,"")),e.items[o].parent.tel=d.slice(0,3)+"-"+d.slice(2,5)+"-"+d.slice(6)}if(e.items[o].loc&&!e.items[o].profileID){e.items[o].directionsURL=e.items[o].loc.coordinates[1]+","+e.items[o].loc.coordinates[0];var u=calcDistance(e.items[o].loc.coordinates[1],e.items[o].loc.coordinates[0],p,g);e.items[o].distanceKM=roundFloat(u,1);var m=1e3*u;m=.000621371192*m,e.items[o].distanceMI=roundFloat(m,1)}else o>-1&&e.items.splice(o,1)}}e.showQueryBar=!0,e.windowHeight=n[0].body.scrollHeight,i(function(){$("img.holderPlace").lazyload(),e.searchIndex++,f=$("div.resultsContainer"),f=f[0].clientHeight,I=!1},500),$("#locInputTop").geocomplete({details:"form",types:["geocode"]}).bind("geocode:result",function(t,o){e.userCity=o.formatted_address,e.newQuery=!0})},function(e){})},e.searchOneItem=function(){e.mongoId=e.mongoId.replace(/[^\w\s]/gi,""),e.mongoId=e.mongoId.replace(/\s+/g," ").trim();var i=encodeURI(e.mongoId);e.parentId=e.parentId.replace(/[^\w\s]/gi,""),e.parentId=e.parentId.replace(/\s+/g," ").trim();var r=encodeURI(e.parentId);o.path("/t/"+r+"/"+i),t.get("https://kipapp.co/styles/api/items/"+e.mongoId,{}).then(function(t){if(e.items=e.items.concat(t.data.item),e.items.length<1&&(e.noResults=!0,console.log("no results")),e.items&&e.items.length){e.noResults=!1;for(var o=0;o<e.items.length;o++){if(e.items[o].parent.tel){var i=e.items[o].parent.tel;i=i.replace(/[+-\s]/g,""),11===i.length&&(i=i.replace(/^1/g,"")),e.items[o].parent.tel=i.slice(0,3)+"-"+i.slice(2,5)+"-"+i.slice(6)}if(e.items[o].loc&&!e.items[o].profileID){e.items[o].directionsURL=e.items[o].loc.coordinates[1]+","+e.items[o].loc.coordinates[0];var r=calcDistance(e.items[o].loc.coordinates[1],e.items[o].loc.coordinates[0],p,g);e.items[o].distanceKM=roundFloat(r,1);var a=1e3*r;a=.000621371192*a,e.items[o].distanceMI=roundFloat(a,1)}else o>-1&&e.items.splice(o,1)}}e.showQueryBar=!0,e.windowHeight=n[0].body.scrollHeight,$("#locInputTop").geocomplete({details:"form",types:["geocode"]}).bind("geocode:result",function(t,o){e.userCity=o.formatted_address,e.newQuery=!0})},function(e){})},e.reportItem=function(o,n,r){"open"===o?e.showReportModal=r:"close"===o?e.showReportModal=null:"submit"===o&&t.post("https://kipapp.co/styles/api/items/"+n._id+"/report",{timeReported:new Date,comment:e.report.comment,reason:e.report.reason}).then(function(t){i(function(){e.showReportModal=null},15e3),t.data.err})},s.query?(e.query=decodeURI(s.query),e.userCity=decodeURI(s.cityName),p=s.lat,g=s.lng,e.searchItems()):s.mongoId?(e.mongoId=decodeURI(s.mongoId),e.parentId=decodeURI(s.parentId),e.searchOneItem()):(t.get("https://kipapp.co/styles/api/geolocation").then(function(o){return 38===o.data.lat?void $("#locInput").geocomplete("find","NYC"):(p=o.data.lat,g=o.data.lng,void t.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+o.data.lat+","+o.data.lng+"&sensor=true").then(function(t){for(var o=0;o<t.data.results.length;o++)if("APPROXIMATE"==t.data.results[o].geometry.location_type){t.data.results[o].formatted_address=t.data.results[o].formatted_address.replace(", USA",""),e.userCity=t.data.results[o].formatted_address,h=e.userCity,e.loadingLoc=!1;break}},function(){}))},function(t){e.getGPSLocation()}),/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&(e.getGPSLocation(),e.hideGPSIcon=!0)),angular.element(document).ready(function(){e.windowHeight=l.height+"px",e.windowWidth=window.width+"px"})}]),simpleSearchApp.directive("autoFocus",["$timeout",function(e){return{restrict:"AC",link:function(t,o){e(function(){o[0].focus()},0)}}}]),simpleSearchApp.directive("afterResults",["$document",function(e){return{restrict:"E",replace:!0,scope:{windowHeight:"="},link:function(t,o,n){console.log(t.$parent.windowHeight),t.$parent.$last&&(t.windowHeight=e[0].body.clientHeight,console.log(t.windowHeight))}}}]),simpleSearchApp.directive("selectOnClick",["$window",function(e){return{restrict:"A",link:function(t,o,n){o.on("click",function(){e.getSelection().toString()||this.setSelectionRange(0,this.value.length)})}}}]),simpleSearchApp.directive("ngEnter",function(){return function(e,t,o){t.bind("keydown keypress",function(t){13===t.which&&(e.$apply(function(){e.$eval(o.ngEnter,{event:t})}),t.preventDefault())})}}),simpleSearchApp.directive("tooltip",function(){return{restrict:"A",link:function(e,t,o){$(t).hover(function(){$(t).tooltip("show")},function(){$(t).tooltip("hide")})}}}),simpleSearchApp.service("searchQuery",function(){var e=[],t=function(t){e=[],e.push(t)},o=function(){return e};return{addSearch:t,getSearch:o}});