require('kip');

stitch = require('../../image_processing/api.js');
var async = require('async');


var stitchResultsPromise = function(items,origin) {
  logging.debug('originSTITCH ',origin)
  return new Promise((resolve, reject) => {
    stitchResults({
      origin: origin,
      amazon: items
    }, 'amazon', function(urls) {
      resolve(urls);
    })
  })
}

var stitchResults = function(data,source,callback) {

    var stitchURLs = [];
    var toStitch = [];

    //rules to get 3 image urls
    switch (source) {
        case 'amazon':
            //adding images for stiching


            //only do parallel for 3 item results
            if (data.amazon.length >= 3){

              //parallel here

              async.parallel([

                  //* * item 1 * * *//
                  function(callback){
                    buildImage(data,function(res){
                      callback(null,res);
                    },0);
                  },

                  //* * item 2 * * *//
                  function(callback){
                    buildImage(data,function(res){
                      callback(null,res);
                    },1);
                  },

                  //* * item 3 * * *//
                  function(callback){
                    buildImage(data,function(res){
                      callback(null,res);
                    },2);
                  }
              ],
              function(err, rez){
                  if (err){
                      logging.debugerror('Error: parallel scrape ',err);
                  }
                  callback(stitchURLs);

              });


            }
            else {

              var loopLame = [0,1,2].slice(0, data.amazon.length);//lol
              async.eachSeries(loopLame, function(i, callback) {


                if (data.amazon && data.amazon[i]){

                  buildImage(data,function(res){
                    callback();
                  },i);
                }else {
                  console.error('ERROR: IMAGE MISSING in Amazon result');
                  callback();
                }

              }, function done(){
                  //fireStitch();
                  callback(stitchURLs);
              });

          }


          function buildImage(data,callbackG,tracker){ //the tracker is to keep track of which URL is which in parallel process


              var origin = data.origin;

              if(!origin){
                origin = 'web';
              }

              var amazonObj = data.amazon[tracker];

              var price;

              toStitch = [];

              //if we successfully scraped real price from amazon.com
              if (amazonObj.realPrice){
                price = amazonObj.realPrice;
              }
              //resort to api price here
              else{

                //USE OFFER FIRST, then fallback to listprice

                if (!amazonObj.ItemAttributes[0].ListPrice){
                    price = ''; //price missing, show blank
                }
                else{
                    if (amazonObj.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                        price = '';
                    }
                    else {
                        // add price
                        price = amazonObj.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
                        //convert to $0.00
                        //price = addDecimal(price);
                    }
                }
              }

              //check for non price, remove
              if(price == 'Add to cart to see product details. Why?' || price == 'Too low to display' || price == 'See price in cart'){
                price = '';
              }


              var primeAvail = 0;
              if (amazonObj.Offers && amazonObj.Offers[0].Offer && amazonObj.Offers[0].Offer[0].OfferListing && amazonObj.Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime){
                  primeAvail = amazonObj.Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime[0];
              }

              var imageURL;
              //do you have this image in large?
              if (amazonObj.LargeImage && amazonObj.LargeImage[0].URL[0]){
                  imageURL = amazonObj.LargeImage[0].URL[0];
              }
              else if (amazonObj.ImageSets && amazonObj.ImageSets[0].ImageSet && amazonObj.ImageSets[0].ImageSet[0].LargeImage && amazonObj.ImageSets[0].ImageSet[0].LargeImage[0]){
                  imageURL = amazonObj.ImageSets[0].ImageSet[0].LargeImage[0].URL[0];
              }
              //do you have this image in medium?
              else if (amazonObj.MediumImage && amazonObj.MediumImage[0].URL[0]){
                  imageURL = amazonObj.MediumImage[0].URL[0];
              }
              else if (amazonObj.ImageSets && amazonObj.ImageSets[0].ImageSet && amazonObj.ImageSets[0].ImageSet[0].MediumImage && amazonObj.ImageSets[0].ImageSet[0].MediumImage[0]){
                  imageURL = amazonObj.ImageSets[0].ImageSet[0].MediumImage[0].URL[0];
              }
              //well, do you have it at all??
              else if (amazonObj.altImage){
                  imageURL = amazonObj.altImage;
              }
              //fine...here's a penguin!!!!!
              else {
                  imageURL = 'https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg'; //TEMP!!!!
              }

              //removing
              if(amazonObj.reviews && amazonObj.reviews.rating == 0){
                delete amazonObj.reviews;
              }


              //if itemattribs exists in amazon result
              if (amazonObj && amazonObj.ItemAttributes){

                var cString = [];
                var attribs = amazonObj.ItemAttributes[0];

                ///// build product details string //////
                //get size
                if (attribs.ClothingSize){
                  cString.push("Size: " + attribs.Size[0]);
                }
                else if (attribs.Size){
                  cString.push("Size: " + attribs.Size[0]);
                }

                //get artist
                if (attribs.Artist){
                  cString.push(truncate("Artist: " + attribs.Artist[0]));
                }

                // //get brand or manfacturer
                // if (attribs.Studio){
                //     cString.push(truncate("Studio: " + attribs.Studio[0]));
                // }
                // if (attribs.Publisher){
                //     cString.push(truncate("Publisher: " + attribs.Publisher[0]));
                // }


                if (attribs.Brand){
                    cString.push(truncate(attribs.Brand[0]));
                }
                // else if (attribs.Manufacturer){
                //     cString.push(truncate("Manufacturer: " + attribs.Manufacturer[0]));
                // }

                if (attribs.Author){
                    cString.push(truncate("Author: " + attribs.Author[0]));
                }

                // if (attribs.Binding){
                //     cString.push(truncate("Binding: " + attribs.Binding[0]));
                // }
                if (attribs.NumberOfPages){
                    cString.push(truncate("Pages: " + attribs.NumberOfPages[0]));
                }

                if (attribs.Director){
                    cString.push(truncate("Director: " + attribs.Director[0]));
                }
                // if (attribs.Creator){
                //     cString.push(truncate("Creator: " + attribs.Creator[0]));
                // }
                if (attribs.Edition){
                    cString.push(truncate(attribs.Edition[0]));
                }
                if (attribs.Feature){
                    cString.push(truncate(attribs.Feature[0]));
                }
                if (attribs.Genre){
                    cString.push(truncate("Genre: " + attribs.Genre[0]));
                }
                if (attribs.Year){
                    cString.push("Year: " + attribs.Year[0]);
                }
                // if (attribs.Model){
                //     cString.push(truncate("Model: " + attribs.Model[0]));
                // }

                if (attribs.Platform){
                    cString.push(truncate("Platform: " + attribs.Platform[0]));
                }else if (attribs.OperatingSystem){
                    cString.push(truncate("OS: " + attribs.OperatingSystem[0]));
                }

                if (attribs.HardwarePlatform){
                    cString.push(truncate("Platform: " + attribs.HardwarePlatform[0]));
                }
                // if (attribs.Languages){
                //     cString.push(truncate("Languages: " + attribs.Languages[0]));
                // }
                if (attribs.Length){
                    cString.push(truncate("Length: " + attribs.Length[0]));
                }
                if (attribs.Width){
                    cString.push(truncate("Width: " + attribs.Width[0]));
                }
                if (attribs.Weight){
                    cString.push(truncate("Weight: " + attribs.Weight[0]));
                }
                if (attribs.MaterialType){
                    cString.push(truncate("Material: " + attribs.MaterialType[0]));
                }
                if (attribs.Format){
                    cString.push(truncate("Format: " + attribs.Format[0]));
                }
                if (attribs.MediaType){
                    cString.push(truncate("Type: " + attribs.MediaType[0]));
                }
                // if (attribs.Color){
                //     cString.push(truncate("Color: " + attribs.Color[0],21));
                // }

                if (attribs.Quantity){
                    cString.push("Quantity: " + attribs.Quantity[0]);
                }
                // else if(attribs.PackageQuantity){
                //     cString.push("PackageQuantity: " + attribs.PackageQuantity[0]);
                // }

                if (attribs.EpisodeSequence){
                    cString.push("Episode: " + attribs.EpisodeSequence[0]);
                }
                if (attribs.ESRBAgeRating){
                    cString.push("ESRB Rating: " + attribs.ESRBAgeRating[0]);
                }
                if (attribs.HazardousMaterialType){
                    cString.push(truncate("Hazardous Type: " + attribs.HazardousMaterialType[0]));
                }

                logging.debug('cString ',cString);

                if(cString.length < 1){
                  cString.push('');
                }

                toStitch.push({
                    url: imageURL,
                    price: price,
                    prime: primeAvail, //is prime available?
                    name: cString, //TRIM NAME HERE
                    reviews: amazonObj.reviews,
                    origin: origin
                });
              }
              else {
                toStitch.push({
                    url: imageURL,
                    price: price,
                    prime: primeAvail, //is prime available?
                    name: '',
                    reviews: amazonObj.reviews,
                    origin: origin
                });
              }
              fireStitch(tracker,function(){
                callbackG();
              });

          }
        break;

    }
    function fireStitch(tracker,callback2){
        //call to stitch service
        stitch(toStitch, function(e, stitched_url){
            if(e){
                logging.debug('stitch err ',e);
            }
            if (tracker || tracker == 0){
              stitchURLs[tracker] = stitched_url;

            }else {
              stitchURLs.push(stitched_url);
            }
            callback2();
            //callback(stitched_url);
        })
    }
};


/////////// tools /////////////

//trim a string to char #
function truncate(string,count){
    if(!count){
      count = 94;
    }
   if (string.length > count)
      return string.substring(0,count)+'...';
   else
      return string;
};

/// exports
module.exports.stitchResults = stitchResults;
module.exports.stitchResultsPromise = stitchResultsPromise;
