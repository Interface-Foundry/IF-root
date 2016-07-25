console.log("IT'S LIT🔥")

if (window.localStorage.access_token !== 'undefined' && typeof window.localStorage.access_token !== 'undefined') {
  window.location.href = "/groups?access_token=" + window.localStorage.access_token;
}

document.querySelector('#litten').addEventListener('click', function() {
  console.log('hell yeah, it\'s LIT🔥')
  var parameters = 'height=400,width=400,left=' + (window.innerWidth - 400)/2 + ',top=' + (window.innerHeight - 400)/2;
  window.open('https://oauth.groupme.com/oauth/authorize?client_id=gkqCTrVDNsutmR83xDXTX1cjrnF6pfek4ZS8pEfNjQa7CD4m', '_blank', parameters);
})
