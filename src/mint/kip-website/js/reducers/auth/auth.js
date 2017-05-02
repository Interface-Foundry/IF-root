const initialState = {
  loaded: false,
  loading: true,
  myCarts: [],
  otherCarts: []
};

export default function reducer(state = initialState, action = {}) {
  	switch (action.type) {
  		case 'SESSION_SUCCESS':
	  		return {
	  			...state,
	  			...action.response
	  		}
      case 'CARTS_SUCCESS':
        return {
          ...state,
          myCarts: _.filter(action.response, (c, i) => c.leader.email_address === state.user_account.email_address),
          otherCarts: _.filter(action.response, (c, i) => c.leader.email_address !== state.user_account.email_address)
        }
    	default:
      		return state;
  	}
}

// [  
//    {  
//       "members":[  
//          {  
//             "email_address":"koh@kipthis.com",
//             "createdAt":"2017-04-24T16:37:30.468Z",
//             "updatedAt":"2017-04-24T16:37:30.468Z",
//             "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//          },
//          {  
//             "email_address":"komangwluce@gmail.com",
//             "createdAt":"2017-04-24T19:26:28.887Z",
//             "updatedAt":"2017-04-24T19:26:28.887Z",
//             "id":"a840a26a-55f6-460e-bbcf-b76df11acd88"
//          }
//       ],
//       "items":[  
//          {  
//             "store":"amazon",
//             "name":"Danby DWC1233BL-SC 12 Bottle Wine Cooler - Black",
//             "asin":"B0033X29CI",
//             "description":"Maitre'D 12-bottle capacity countertop wine cooler with clear glass door and blue LED interior light,Features energy efficient semi-conductor cooling technology - Does not use refrigerants,Silent operation and no vibration to disturb the wine,Intuitive push button thermostat can be set from 50F-64.4F (10C-18C),3 contoured chrome storage shelves cradle wine bottles",
//             "price":165.99,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/41t%2BO6UAL7L._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/61CqYnDj1RL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-27T15:15:44.539Z",
//             "updatedAt":"2017-04-27T15:15:46.296Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"4ba2030df526",
//             "id":"0c0cbef7-0acc-4452-8337-4833fe295582"
//          },
//          {  
//             "store":"amazon",
//             "name":"Danby DWC032A2BDB 36 Bottle Wine Cooler, Black",
//             "asin":"B01CLEK0ZM",
//             "description":"High Gloss Door Frame with Full Smoked Glass,Energy efficient Blue LED interior lights,Adjustable Coated Black Wire Shelves,Seamless full length door handle and reversible door,Worktop with hidden hinge for smooth look",
//             "price":211.69,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/41ANn-cI0LL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/71vsFmXaNwL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T19:25:06.414Z",
//             "updatedAt":"2017-04-25T14:35:02.955Z",
//             "added_by":"a840a26a-55f6-460e-bbcf-b76df11acd88",
//             "cart":"492e37d4892e",
//             "id":"79064401-a805-4cfe-bb92-4f454e06a7cd"
//          },
//          {  
//             "store":"amazon",
//             "name":"Diablo III: Ultimate Evil Edition",
//             "asin":"B00GLZQR96",
//             "description":"For PlayStation owners, Diablo III: Reaper of Souls - Ultimate Evil Edition offers 'The Last of Us' Nephalem Rift, a randomized dungeon swarming with Stalkers, Clickers and Bloaters in hand-picked environments with a unique 'The Last of Us' yellow spore effect. Also included is the 'Guise of the Colossi' Unique Armor; a unique transmogrification plan that unlocks six armors that are inspired by 'Shadow of the Colossus' and work for all classes.,This Ultimate Evil Edition contains both Diablo III and the Reaper of Souls expansion set, together in one definitive volume.,Play solo or form a party of up to four other heroes.",
//             "price":27.99,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/41RS0RZtESL._SL160_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/61BbI2CfqIL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T21:08:09.662Z",
//             "updatedAt":"2017-04-27T16:32:05.762Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"4ba2030df526",
//             "id":"be86042a-7aa7-44aa-af35-c1ad83b2f71b"
//          },
//          {  
//             "store":"amazon",
//             "name":"HERCULES Series 24/7 Intensive Use, Multi-Shift, Big & Tall 500 lb. Capacity Black Fabric Executive Swivel Chair with Loop Arms",
//             "asin":"B014FJYACK",
//             "description":"Contemporary 24/7 Multi-Shift Use Office Chair,500 lb Weight Capacity,High Back Design with Headrest,Built-In Lumbar Support,Tilt Lock Mechanism",
//             "price":165.32,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/416K10QWjnL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/81M26ywNUML.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T19:27:35.774Z",
//             "updatedAt":"2017-04-24T21:02:39.753Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"4ba2030df526",
//             "id":"dc8e1283-7674-4455-9e27-c440e32b1edd"
//          },
//          {  
//             "store":"amazon",
//             "name":"ASUS E200HA Portable Lightweight 11.6-inch Intel Quad-Core Laptop, 4GB RAM, 32GB Storage, Windows 10 with 1 Year Microsoft Office 365 Subscription",
//             "asin":"B01LT692RK",
//             "description":"11.6 inches ultra-compact design (2.2 lbs) with Windows 10 Pre-installed and 1 year Office 365,Intel Quad-Core Atom Z8350 1.44 GHz (Turbo to 1.92 GHz) Processor, 32GB eMMC storage, 4GB DDR3 RAM,Free 1-Year subscription to Microsoft Office 365 Personal ($69.99 value). Access to Word, Excel, PowerPoint, Onenote, Outlook, Publisher, and more.,Full-size chiclet keyboard with intuitive Smart Gesture input and large trackpad, 802.11ac WiFi with Multi-user MIMO for the strongest wireless connection,All-day battery, 2Cells 38 Whrs Polymer Battery rated up to 13 hours of video playback,Product Dimensions -   7.6 x 11.3 x 0.7 inches",
//             "price":199,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/310AVHszUmL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/51tOI2wolcL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T21:00:36.325Z",
//             "updatedAt":"2017-04-24T21:01:28.862Z",
//             "added_by":"a840a26a-55f6-460e-bbcf-b76df11acd88",
//             "cart":"4ba2030df526",
//             "id":"ed767d5c-7f7f-43b9-9a7a-be275ad21e71"
//          }
//       ],
//       "leader":{  
//          "email_address":"koh@kipthis.com",
//          "createdAt":"2017-04-24T16:37:30.468Z",
//          "updatedAt":"2017-04-24T16:37:30.468Z",
//          "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//       },
//       "createdAt":"2017-04-24T16:37:26.006Z",
//       "updatedAt":"2017-04-27T15:15:46.307Z",
//       "thumbnail_url":"https://res.cloudinary.com/kipthis-com/image/upload/v1493062093/vze1quepu2hmkxks7ebc.gif",
//       "name":"The Cake Is A Lie",
//       "addingItem":false,
//       "locked":false,
//       "cart_id":"4ba2030df526",
//       "id":"4ba2030df526"
//    },
//    {  
//       "members":[  
//          {  
//             "email_address":"koh@kipthis.com",
//             "createdAt":"2017-04-24T16:37:30.468Z",
//             "updatedAt":"2017-04-24T16:37:30.468Z",
//             "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//          },
//          {  
//             "email_address":"komangwluce@gmail.com",
//             "createdAt":"2017-04-24T19:26:28.887Z",
//             "updatedAt":"2017-04-24T19:26:28.887Z",
//             "id":"a840a26a-55f6-460e-bbcf-b76df11acd88"
//          }
//       ],
//       "items":[  
//          {  
//             "store":"amazon",
//             "name":"PlayStation 4 Slim 500GB Console - Uncharted 4 Bundle",
//             "asin":"B01LRLJV28",
//             "description":"Includes a new slim 500GB PlayStation®4 system, a matching DualShock 4 Wireless Controller, and Uncharted 4: A Thief's End on Blu-ray disc.,Play online with your friends, get free games, save games online and more with PlayStation Plus membership (sold separately).,Connect with your friends to broadcast and celebrate your epic moments at the press of the Share button to Twitch, YouTube, Facebook and Twitter.",
//             "price":234,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/21ou%2BmHMUbL._SL160_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/51LA%2BnLOalL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T22:18:33.723Z",
//             "updatedAt":"2017-04-24T22:18:35.673Z",
//             "added_by":"a840a26a-55f6-460e-bbcf-b76df11acd88",
//             "cart":"4ee58f321d8c",
//             "id":"6eef2e55-6b6e-4b5e-82b9-c1f2115dbc14"
//          },
//          {  
//             "store":"amazon",
//             "name":"Danby DWC032A2BDB 36 Bottle Wine Cooler, Black",
//             "asin":"B01CLEK0ZM",
//             "description":"High Gloss Door Frame with Full Smoked Glass,Energy efficient Blue LED interior lights,Adjustable Coated Black Wire Shelves,Seamless full length door handle and reversible door,Worktop with hidden hinge for smooth look",
//             "price":211.69,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/41ANn-cI0LL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/71vsFmXaNwL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T19:25:06.414Z",
//             "updatedAt":"2017-04-25T14:35:02.955Z",
//             "added_by":"a840a26a-55f6-460e-bbcf-b76df11acd88",
//             "cart":"492e37d4892e",
//             "id":"79064401-a805-4cfe-bb92-4f454e06a7cd"
//          },
//          {  
//             "store":"amazon",
//             "name":"Odessey and Oracle",
//             "asin":"B002KFJWBG",
//             "description":null,
//             "price":6.99,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/61y0bXvSx5L._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/81jCcNqNAOL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T22:00:54.135Z",
//             "updatedAt":"2017-04-24T22:00:58.997Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"4ee58f321d8c",
//             "id":"ee7ebb87-348e-4114-af93-d6e2ad36cc94"
//          }
//       ],
//       "leader":{  
//          "email_address":"koh@kipthis.com",
//          "createdAt":"2017-04-24T16:37:30.468Z",
//          "updatedAt":"2017-04-24T16:37:30.468Z",
//          "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//       },
//       "createdAt":"2017-04-24T21:59:46.230Z",
//       "updatedAt":"2017-04-25T21:18:07.752Z",
//       "name":"Koh's zombie cart",
//       "addingItem":true,
//       "cart_id":"4ee58f321d8c",
//       "locked":false,
//       "thumbnail_url":"https://res.cloudinary.com/kipthis-com/image/upload/v1493062093/vze1quepu2hmkxks7ebc.gif",
//       "id":"4ee58f321d8c"
//    },
//    {  
//       "members":[  
//          {  
//             "email_address":"koh@kipthis.com",
//             "createdAt":"2017-04-24T16:37:30.468Z",
//             "updatedAt":"2017-04-24T16:37:30.468Z",
//             "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//          },
//          {  
//             "email_address":"komangwluce@gmail.com",
//             "createdAt":"2017-04-24T19:26:28.887Z",
//             "updatedAt":"2017-04-24T19:26:28.887Z",
//             "id":"a840a26a-55f6-460e-bbcf-b76df11acd88"
//          }
//       ],
//       "items":[  
//          {  
//             "store":"amazon",
//             "name":"David's Cookies Chocolate Fudge Birthday Cake, 7”",
//             "asin":"B000UVCRYQ",
//             "description":"7\" 6-8 Servings, Weight: 1 lb 14 oz,IDEAL BIRTHDAY CAKE - Make someone feel special with this unforgettably delicious delight!,FINEST INGREDIENTS - This moist chocolate cake is layered with a creamy filling and topped with a decadent ganache.,NO ADDED PRESERVATIVES - This birthday cake has no artificial preservatives added. It tastes just like you baked it at home!,KOSHER DESSERT - Our cake is OU-D certified, the most respected kosher certification in the United States.",
//             "price":37.93,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/51RnRSSEyZL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/51RnRSSEyZL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T22:01:30.782Z",
//             "updatedAt":"2017-04-24T22:01:35.197Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"0a50df86955f",
//             "id":"bb2c6127-c79d-43a0-9710-527723948c73"
//          },
//          {  
//             "store":"amazon",
//             "name":"More [Blu-ray]",
//             "asin":"B0051URX04",
//             "description":"More ( Gier nach Lust ) ( More - Mehr, immer mehr ),More,Gier nach Lust,More - Mehr, immer mehr",
//             "price":15.37,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/5157oPIP7cL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/71qfG26MF4L.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-24T22:17:50.164Z",
//             "updatedAt":"2017-04-24T22:17:52.408Z",
//             "added_by":"a840a26a-55f6-460e-bbcf-b76df11acd88",
//             "cart":"0a50df86955f",
//             "id":"d8522979-c841-4c45-b72b-5943f1198c75"
//          }
//       ],
//       "leader":{  
//          "email_address":"koh@kipthis.com",
//          "createdAt":"2017-04-24T16:37:30.468Z",
//          "updatedAt":"2017-04-24T16:37:30.468Z",
//          "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//       },
//       "createdAt":"2017-04-24T22:01:26.420Z",
//       "updatedAt":"2017-04-24T22:17:52.413Z",
//       "name":"I believe in cakes",
//       "id":"0a50df86955f"
//    },
//    {  
//       "members":[  
//          {  
//             "email_address":"koh@kipthis.com",
//             "createdAt":"2017-04-24T16:37:30.468Z",
//             "updatedAt":"2017-04-24T16:37:30.468Z",
//             "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//          }
//       ],
//       "items":[  
//          {  
//             "store":"amazon",
//             "name":"Danby DWC032A2BDB 36 Bottle Wine Cooler, Black",
//             "asin":"B01CLEK0ZM",
//             "description":"High Gloss Door Frame with Full Smoked Glass,Energy efficient Blue LED interior lights,Adjustable Coated Black Wire Shelves,Seamless full length door handle and reversible door,Worktop with hidden hinge for smooth look",
//             "price":259,
//             "thumbnail_url":"https://images-na.ssl-images-amazon.com/images/I/41ANn-cI0LL._SL75_.jpg",
//             "main_image_url":"https://images-na.ssl-images-amazon.com/images/I/71vsFmXaNwL.jpg",
//             "quantity":1,
//             "locked":false,
//             "createdAt":"2017-04-26T19:43:36.615Z",
//             "updatedAt":"2017-04-26T19:43:37.928Z",
//             "added_by":"061f8d56-bb92-4c44-8769-44679df8e741",
//             "cart":"77a3f2e64879",
//             "id":"7996ad96-0c2e-4968-95d0-e79ffa355d44"
//          }
//       ],
//       "leader":{  
//          "email_address":"koh@kipthis.com",
//          "createdAt":"2017-04-24T16:37:30.468Z",
//          "updatedAt":"2017-04-24T16:37:30.468Z",
//          "id":"061f8d56-bb92-4c44-8769-44679df8e741"
//       },
//       "createdAt":"2017-04-26T19:42:43.588Z",
//       "updatedAt":"2017-04-26T19:44:13.244Z",
//       "name":"Doom Hammer",
//       "thumbnail_url":"https://res.cloudinary.com/kipthis-com/image/upload/v1493235852/vveh6ba42kcpoihtawqa.gif",
//       "id":"77a3f2e64879"
//    }
// ]