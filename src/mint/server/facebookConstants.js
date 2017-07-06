const dev = {
  clientID: 855809247908300,
  clientSecret: '9d0d946d5096bde7395d7e6256399a4c',
  baseUrl: 'https://0cc99afe.ngrok.io'
}

const production = {
  clientID: 1401271990193674,
  clientSecret: '8d7c6cb160c60bd656d8a944d8f1f2bd',
  baseUrl: 'http://kipthis.com'
}

const mintdev = {
  clientID: 110797492886495,
  clientSecret: '951492bf9890049723b9808b09e643bb',
  baseUrl: 'http://mint-dev.kipthis.com'
}

if (process.env.NODE_ENV === 'production') module.exports = production
else if (process.env.NODE_ENV === 'development_chris') module.exports = dev
else module.exports = mintdev
