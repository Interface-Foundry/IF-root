const request = require('request-promise')
const server = require('../server/payments/invoice-api.js')
require('should')

const PORT = process.env.PORT || 3000
const localhost = 'http://127.0.0.1:' + PORT

describe('invoice', () => {
  before(async () => {
    await server.listen(PORT)
  })

  it('make sure server is running', async () => {
    const response = await request.get({
      uri:localhost + '/test'
    })
    response.should.equal('OK')
  })

  it.skip('create an invoice for a cart', async () => {

  })
})