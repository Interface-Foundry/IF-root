module.exports = function (handler) {
  var score = '000';
  handler = handler.split('.');

  for (var i = 1; i <= handler.length; i++) {
    score += assign_score(handler.slice(0, i).join('.'));
  }
  return score;
}

function assign_score(h) {
  switch (h) {
  
  }
}
