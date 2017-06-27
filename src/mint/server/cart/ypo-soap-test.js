/*

got this from YPO

HTTPS Post Header & URL Info
  Username: kip
  Password: K1p0rdering

Test inbound URL’s
  Try first: SOAP 1.2: https://edigateway-test.ypo.co.uk/EdiService/WcfXmlDataServiceLibrary.YpoService.svc
  Try second if first doesn’t work: SOAP 1.1:  https://edigateway-test.ypo.co.uk/EdiServiceSoap11/WebXmlDataServiceLayer.YpoService.asmx
 */

const svcUrl11 = 'https://edigateway-test.ypo.co.uk/EdiServiceSoap11/WebXmlDataServiceLayer.YpoService.asmx'
const svcUrl12 = 'https://edigateway-test.ypo.co.uk/EdiService/WcfXmlDataServiceLibrary.YpoService.svc'
const username = 'kip'
const password = 'K1p0rdering'

const soap = require('soap')
const fs = require('fs')
const util = require('util')
const xmlOrder = `
  <cart>
    <name>Blue Team's Basket</name>
    <items>
        <item>
            <store>YPO</store>
            <code>332100</code>
            <quantity>2</quantity>
        </item>
        <item>
            <store>YPO</store>
            <code>213415</code>
            <quantity>1</quantity>
        </item>
    </items>
    <orderedBy>
        <username>alicia</username>
        <email>alicia@kipthis.com</email>
        <orderedAt>2017-05-06T17:54:37.461Z</orderedAt>
    </orderedBy>
    <order_number>100e59657b0d</order_number>
    <delivery_details>
        <account_number>39299011</account_number>
        <delivery_message>Please drop off supplies with Kelly +44 3069 990689</delivery_message>
        <voucher_code>841bEc9c</voucher_code>
    </delivery_details>
  </cart>
`.trim()

soap.createClient(svcUrl11 + '?WSDL', {
  forceSoap12Headers: false
}, function(err, client) {
  if (err) {
    console.log(err)
    return;
  }

  const args = {
    CustomerKey: username,
    Password: password,
    cXmlOrder: xmlOrder
  }

  client.SendOrderToYpo(args, function(err, result) {
    if (err) {
      console.log(err)
      debugger;
      return;
    }

    console.log(result)
    process.exit(0)
  });
});
