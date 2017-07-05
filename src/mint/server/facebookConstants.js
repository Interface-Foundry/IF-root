const devhannah = {
  clientID: 855809247908300,
  clientSecret: '9d0d946d5096bde7395d7e6256399a4c'
}

const production = {
  clientId: 1401271990193674,
  clientSecret: '8d7c6cb160c60bd656d8a944d8f1f2bd'
}

if (process.env.NODE_ENV === 'production') module.exports = production
else module.exports = devhannah
