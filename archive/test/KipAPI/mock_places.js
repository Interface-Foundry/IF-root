var deepcopy = require('deepcopy');

module.exports.getExample = function() {
  var i = deepcopy(module.exports.example);
  delete i._id;
  i.id = 'place' + (Math.random()*1000000000|0);
  i.name = 'Kip Boutique';
  i.testData = true;
  return i;
};

module.exports.example = {
  "id" : "",
  "type" : "clothing_store",
  "name" : "Kip Boutique",
  "hasTime" : false,
  "views" : 0,
  "valid" : true,
  "world" : true,
  "testData" : true,
  "reports" : [ ],
  "itemImageURL" : [ ],
  "itemTags" : {
    "text" : [ ],
    "categories" : [ ],
    "colors" : [ ]
  },
  "comments" : [ ],
  "rejects" : [ ],
  "faves" : [ ],
  "tags" : [
    "clothing",
    "Champs",
    "Sports"
  ],
  "widgets" : {
    "twitter" : false,
    "instagram" : false,
    "upcoming" : false,
    "category" : false,
    "streetview" : true
  },
  "source_instagram_post" : {
    "created" : "",
    "tags" : [ ],
    "local_path" : [ ]
  },
  "source_google" : {
    "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
    "price_level" : null,
    "url" : "https://plus.google.com/104017075887850409206/about?hl=en-US",
    "website" : "",
    "international_phone_number" : "+1 914-949-1412",
    "address" : "902 Broadway New York New York United States 11211",
    "place_id" : "ChIJbV9pxzeUwokRx_3FG9Z04Bc",
    "opening_hours" : [
      "Monday: 10:00 am – 7:00 pm",
      "Tuesday: 10:00 am – 7:00 pm",
      "Wednesday: 10:00 am – 7:00 pm",
      "Thursday: 10:00 am – 7:00 pm",
      "Friday: 10:00 am – 7:00 pm",
      "Saturday: 10:00 am – 7:00 pm",
      "Sunday: 11:00 am – 7:00 pm"
    ],
    "types" : [
      "shoe_store",
      "clothing_store",
      "store",
      "point_of_interest",
      "establishment"
    ]
  },
  "source_meetup" : {
    "event_hosts" : [ ]
  },
  "permissions" : {
    "ownerID" : "553e5480a4bdda8c18c1edbc",
    "hidden" : false
  },
  "resources" : {
    "hashtag" : ""
  },
  "time" : {
    "created" : ""
  },
  "style" : {
    "styleID" : "55a56410e3a415c5ba8a1e97",
    "maps" : {
      "cloudMapName" : "forum",
      "cloudMapID" : "interfacefoundry.jh58g2al",
      "localMapArray" : [ ]
    }
  },
  "landmarkCategories" : [ ],
  "category" : {
    "name" : "place",
    "avatar" : "",
    "hiddenPresent" : false
  },
  "subType" : [ ],
  "loc" : {
    "coordinates" : [
      -73.989471,
      40.739495
    ],
    "type" : "Point"
  },
  "__v" : 0
}