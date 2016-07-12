var emojis = require('../emojis')('slack');

var delivery = module.exports = {com: {}}



delivery.com.results = function *(message) {
  var att = [{
    text: `_yummy things near ${message.data.params.addr}_`,
    mrkdwn_in: ['text', 'pretext'],
    color: '#45a5f4'
  }];

  att = att.concat(message.data.results.map((r, i) => {
    return {
      title: `${emojis(i+1)} ${r.summary.name}`,
      color: '#45a5f4',
      image_url: r.summary.merchant_logo,
      title_link: r.summary.url.complete,
      fallback: 'Search Results'
    }
  }))
  
  console.log(att);
  return att;
}
