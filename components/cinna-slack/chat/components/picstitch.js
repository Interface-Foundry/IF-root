stitch = require('../../image_processing/api.js');
var async = require('async');

var stitchResults = function(data,source,callback) {

    //rules to get 3 image urls
    switch (source) {
        case 'amazon':
            //adding images for stiching
            var toStitch = [];
            var loopLame = [0,1,2];//lol

            async.eachSeries(loopLame, function(i, callback) {
                if (data.amazon[i]){

                    var price;

                    if (!data.amazon[i].ItemAttributes[0].ListPrice){
                        price = ''; //price missing, show blank
                    }
                    else{
                        if (data.amazon[i].ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                            price = '';
                        }
                        else {
                            // add price
                            price = data.amazon[i].ItemAttributes[0].ListPrice[0].FormattedPrice[0];
                            //convert to $0.00
                            //price = addDecimal(price);
                        }
                    }

                    var primeAvail = 0;
                    if (data.amazon[i].Offers && data.amazon[i].Offers[0].Offer && data.amazon[i].Offers[0].Offer[0].OfferListing && data.amazon[i].Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime){
                        primeAvail = data.amazon[i].Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime[0];
                    }

                    var imageURL;
                    if (data.amazon[i].MediumImage && data.amazon[i].MediumImage[0].URL[0]){
                        imageURL = data.amazon[i].MediumImage[0].URL[0];
                    }
                    else {
                        imageURL = 'https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg'; //TEMP!!!!
                    }

                    toStitch.push({
                        url: imageURL,
                        price: price,
                        prime: primeAvail, //is prime available?
                        name: truncate(data.amazon[i].ItemAttributes[0].Title[0]), //TRIM NAME HERE
                        reviews: data.amazon[i].reviews
                    });
                }
                else {
                    console.log('IMAGE MISSING!',data.amazon[i]);
                }
                callback();
            }, function done(){
                fireStitch();
            });
            break;
    }
    function fireStitch(){
        //call to stitch service
        stitch(toStitch, function(e, stitched_url){
            if(e){
                console.log('stitch err ',e);
            }
            callback(stitched_url);
        })
    }
};


/////////// tools /////////////

//trim a string to char #
function truncate(string){
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

/// exports
module.exports.stitchResults = stitchResults;
