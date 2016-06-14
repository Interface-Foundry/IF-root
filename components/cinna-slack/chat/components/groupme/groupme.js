var path = require('path');
var fs = require('fs');
var app = require('koat');
var kip = require('../../../kip');
var request = require('request-promise');

var port = 3333; // :3 😸
var oauth_url = 'https://oauth.groupme.com/oauth/authorize?client_id=gkqCTrVDNsutmR83xDXTX1cjrnF6pfek4ZS8pEfNjQa7CD4m';
var my_name = 'Litten';
var my_id = '38088185';


app.listen(3333);
var art = `

_             _
| '-.       ,-'|
\\'-.'-"""-',-'/
 |= _:'.':_ =|
 \\  💬    💬   /
 |=   |_|   =|
 >\\:.  "  .:/<
  /'-,_^_,-'\\


it's LIT 🔥


groupme button listening on port 3333
`.red;

kip.log(art)

var oauth_pingback = fs.readFileSync(path.join(__dirname, 'oauth_pingback.html')).toString();
app.get('/oauth', function*() {
  kip.debug('got pingback from oauth');
  this.body = oauth_pingback.replace('$ACCESS_TOKEN', this.query.access_token);
  this.type = 'text/html';
})

var groups_html = fs.readFileSync(path.join(__dirname, 'groups.html')).toString();
app.get('/groups', function*() {
  kip.debug('modifying groups');
  var res = yield request('https://api.groupme.com/v3/groups?token=' + this.query.access_token);
  if (typeof res === 'string') {
    res = JSON.parse(res);
  }
  if (res.response && res.meta.code === 200) {
    var groups = res.response;
  }
  console.log(groups);
  var list = '<ul>' + groups.map(g => {
    return `<li><a class="group" href="#" group-id="${g.id}"><img src="${g.image_url}">${g.name}</a></li>`
  }).join('\n') + '</ul>';

  if (!groups || groups.length === 0) {
    list = "<p>You didn't have any groups.  That's okay, we'll add you to one of ours!</p>";
  }

  this.body = groups_html.replace('$LIST', list);
  this.type = 'text/html';
})

app.get('/join', function*() {
  kip.debug('joining group');
  if (!this.query.id || !this.query.access_token) {
    throw new Error('missing group id or access token');
  }

  console.log(this.query);

  var res = yield request({
    uri: `https://api.groupme.com/v3/groups/${this.query.id}/members/add?token=${this.query.access_token}`,
    method: 'POST',
    body: {
      members: [{
        nickname: my_name,
        user_id: my_id
      }]
    },
    json: true
  });

  console.log(res);
  this.body = '👌';
})

app.static(path.join(__dirname, 'public'));
