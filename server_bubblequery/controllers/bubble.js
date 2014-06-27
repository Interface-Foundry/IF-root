var helper = require('../constants/helper');

exports.listBubbles = function(currentDateTimeUser, userCoordinate, callback) {
  var functionName = 'listBubbles';

  var bubbleList = [];

  var bubblesLiveInside = [];
  var bubblesLive = [];
  var bubblesUpcomingLive = [];

  helper.listBubblesNearCoordinate(userCoordinate, function(err, data) {

    if(err) {
      helper.log(functionName, err);
      return callback(err, data);
    }

    var bubbleObject;
    for(var d in data) {
      bubbleObject = data[d];

      //console.log(bubbleObject);

      var isInBubble = helper.isInBubble(bubbleObject['dis']);


      var liveStatusSeconds = helper.bubbleLiveStatus(currentDateTimeUser,
        bubbleObject['obj']);
      bubbleObject = helper.returnBubbleObject(bubbleObject['obj']);

      // If user is physically inside bubble and bubble is live
      if(isInBubble && liveStatusSeconds === 0) {
        bubblesLiveInside.push(bubbleObject)
        continue;
      }

      // If bubble is live, sorted by the distance
      if(liveStatusSeconds === 0) {
        bubblesLive.push(bubbleObject)
        continue;
      }

      if(liveStatusSeconds === -1) // If bubble expired, do not add
        continue;

      bubblesUpcomingLive.push({ 'bubble':bubbleObject,
      'upcoming': liveStatusSeconds});
    }

    bubblesUpcomingLive.sort(helper.compareUpcomingBubbles);

    // .map() is used to get only the bubbles
    var bubblesUpcomingLiveMapped = bubblesUpcomingLive.map(function(bubble) {
      return bubble['bubble'];
    });

    // Merge all lists together
    /*
    bubbleList = bubblesLiveInside.concat(bubblesLive);
    bubbleList = bubbleList.concat(bubblesUpcomingLiveMapped);
    */

    bubbleList = {
      "liveAndInside": bubblesLiveInside,
      "live": bubblesLive,
      "upcoming": bubblesUpcomingLiveMapped
    }

    return callback(err, bubbleList);
  });

}

exports.createBubble = function(req, res) {
  var bubbles = req.body['bubbles'];
  var bubble;
  for(var b in bubbles) {
    bubble = bubbles[b];
    helper.saveBubble(bubble['loc'],
      bubble['startTime'],
      bubble['endTime']);
  }
  return {'isCreated':true};
}
