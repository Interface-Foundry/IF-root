var _ = require('lodash');

function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

var emojis = {
  1: '①',
  2: '②',
  3: '③'
};


module.exports = function(message) {
  return '<ul>' + JSON.parse(message.amazon).map((r, i) => {
    return `<li>
      <div><a class="item_title" href="${r.shortened_url}">${emojis[i+1]}: ${truncate(_.get(r, 'ItemAttributes[0].Title[0]'))}</a></div>
      <div><img src="${r.picstitch_url}"></div>
    </li>`;
  }).join('') + '</ul>';
}
