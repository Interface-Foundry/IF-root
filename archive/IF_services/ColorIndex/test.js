var getVibrantColors = require('./colorTools');

getVibrantColors
    .getVibrantColors('/Users/peter/Downloads/2899260_fpx.jpeg')
    .then(console.log.bind(console));