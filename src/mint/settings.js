//
// Front-end settings
//

const production = process.env.NODE_ENV === 'production'

const settings = {
  PRODUCTION: production,
  KIP_PAY_ENABLED: (!production) || flag(process.env.KIP_PAY_ENABLED),
  STRIPE_KEY: testOrProd('pk_test_8bnLnE2e1Ch7pu87SmQfP8p7', 'pk_live_0LCJqLkmMCFKYDwbPCrhQknH'),
  PAYPAL_KEY: testOrProd('AW4Qaa3xF5SKI1Ysz6kTkFWq0c7AGBtpUXlJEkkO8SMhMO5Kn', 'AVr0hZHU5vDLj1MVHlVchyeDCOrcmFPCT2pxv3A0zLjntjmiwT4wP'),
  GA_ENABLED: flag(testOrProd(process.env.GA, true)),
  SHIPPING_OPTIONS_ENABLED: false
}

/**
 * JSON stringify everything
 * @type {[type]}
 */
module.exports = Object.keys(settings).reduce((o, k) => {
  o[k] = JSON.stringify(settings[k])
  return o
}, {});

console.log(module.exports)

function testOrProd(test, prod) {
  if (production) return prod
  else return test
}

/**
 * turns some random value into true/false boolean.
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function flag(string) {
  if (!string) {
    return false
  }

  if (typeof string === 'boolean') {
    return string
  }

  if (typeof string === 'number') {
    return string > 0
  }

  if (typeof string === 'string') {
    switch (string.toLowerCase()) {
    case 'false':
    case 'f':
    case 'no':
    case 'n':
    case '0':
      return false
    default:
      return true
    }
  }

  // default return false
  return false
}
