var Cloudsight = require('./cloudsightAPI');

var client = Cloudsight({
  key: 'cbP8RWIsD0y6UlX-LohPNw'
})

client.get('https://s3.amazonaws.com/if.kip.apparel.images/jupe2860/kingdom--state-digital-printed-skirt-0647ecfa_m.jpg', function (e, r) {
  console.log(e);
  console.log(r);
})


client.get('https://s3.amazonaws.com/if.kip.apparel.images/montmartre1140/pink-owl-watercolor-roses-dress-d3d6cfeb_m.jpg')
  .then(function(result){
    console.log(result)
  }).catch(console.log.bind(console))
