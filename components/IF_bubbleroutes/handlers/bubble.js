var helper = require('../constants/helper');
var integers = require('../constants/integers');
var strings = require('../constants/strings');
var lists = require('../constants/lists');
var bubble = require('../controllers/bubble');
var Response = require('../response');

exports.listBubbles = function(req, res) {
  helper.log('listBubbles', 'From handler listing bubbles');

  var parameterList = lists.PARAMETERS_LIST_BUBBLES;
  var listBubblesResponse;

  try {

    console.log(req.query);
    var parameterCheck = helper.checkParameters(parameterList, req.query);

    if (!parameterCheck['result']) {
      listBubblesResponse = new Response(integers.CODE_ERROR_MISSING_PARAMETER,
        parameterCheck['missingKey']);
      return res.send(listBubblesResponse);
    }

    var listBubblesRequest = req.query;

    var localTime = listBubblesRequest.localTime;
    var userCoordinate = listBubblesRequest['userCoordinate'];

    // Normalize date from string to date
    localTime = helper.normalizeDateTime(localTime);

    // Normalize coordinates from string to coordinate array
    userCoordinate = helper.normalizeCoordinate(userCoordinate);

    var bubbleList = bubble.listBubbles(localTime, userCoordinate,
      function onListBubbles(err, data) {
        if(err) {
          listBubblesResponse = new Response(integers.CODE_ERROR,
            err.message,
            null);
          console.log(listBubblesResponse);
          return res.send([data]);
        }
        listBubblesResponse = new Response(integers.CODE_SUCCESS,
          strings.MESSAGE_SUCCESS,
          data);
        console.log(listBubblesResponse);
        return res.send([data]);
      });
  }
  catch (err) {
    listBubblesResponse = new Response(integers.CODE_ERROR,
      err.message,
      null);
      console.log(listBubblesResponse);
      return res.send(listBubblesResponse);
  }
}

exports.createBubble = function(req, res) {
  helper.log('createBubbles', 'From handler listing bubbles');
  var createBubbleResponse = {};

  try {
    var createBubbleResponse = bubble.createBubble(req, res);
    createBubbleResponse = new Response(integers.CODE_SUCCESS,
      strings.MESSAGE_SUCCESS, createBubbleResponse);
    return res.send(createBubbleResponse);
  }
  catch (err) {
    createBubbleResponse = new Response(integers.CODE_ERROR,
      err.message,
      null);
    return res.send(createBubbleResponse);
  }
}
