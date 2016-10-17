var request = require("request")

var json = {
    "origin": "slack",
    "cuisines": [
                "American",
                "Burgers",
                "Sandwiches",
                "Diner"
            ],
     "name": ["Size: Large", "Amoluv", "Amoluv owns its own trademarks.Trademark number:86522196, The package contains Amoluv Tag"],
     "location": {
          "distance":0.39104587028574
     },
     "ordering":{ 
          "availability":{
                "delivery_estimate": 45
                    },
            "delivery_charge":0,
            "minimum":10
      },
     "summary": {"star_ratings": 4, "num_ratings": "21"},
     "prime": 0,
     "url": "https://static.delivery.com/merchant_logo.php?id=75965&w=500&h=500"
}
     // "data": {
     //    "location":{
     //        "distance":0.39104587028574
     //    },
     //    "ordering":{ 
     //        "availability":{
     //                "delivery_estimate": 45
     //                },
     //        "delivery_charge":0,
     //        "minimum":10
     //        }
     //    },
     //    "summary":{
     //        "merchant_logo_raw" : "https://static.delivery.com/merchant_logo.php?w=0&h=0&id=62236",
     //        "merchant_logo" : "https://static.delivery.com/merchant_logo.php?id=62236",
     //        "num_ratings":21,
     //        "star_ratings": 4, 
     //        "cuisines" : [
     //            "American",
     //            "Burgers",
     //            "Sandwiches",
     //            "Diner"
     //        ]
     //    },
     //    "name" : "Zafis Luncheonette"
     //    }
    
// var json = 
// {
//     data: {
//         "location":{
//             "distance":0.39104587028574
//         },
//         "ordering":{ 
//             "availability":{
//                     "delivery_estimate": 45,
//                     },
//             "delivery_charge":0,
//             "minimum":10
//             }
//         },
//         "summary":{
//             "merchant_logo_raw" : "https://static.delivery.com/merchant_logo.php?w=0&h=0&id=62236",
//             "merchant_logo" : "https://static.delivery.com/merchant_logo.php?id=62236",
//             "num_ratings":21,
//             "star_ratings": 4, 
//             "cuisines" : [
//                 "American",
//                 "Burgers",
//                 "Sandwiches",
//                 "Diner"
//             ],
//         },
//         "name" : "Zafis Luncheonette"
// }


request({
  method: "POST",
  url: "http://192.168.1.2:5000",
  json: true,
  body: json
}, function(e, r, b) {

  console.log(b)
})
