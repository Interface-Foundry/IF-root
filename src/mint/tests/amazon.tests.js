require('co-mocha');
var _ = require('lodash');
var assert = require('chai').assert;
var expect = require('chai').expect;


var amazon = require('../server/cart/amazon_cart.js');

var test_item = 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1';

var test = {}


describe('testing amazon to our cart system', () => {
  it('get item asin from various urls', function * () {
    const items = {
      B010S9N6OO: 'https://www.amazon.com/AmazonBasics-Apple-Certified-Lightning-Cable/dp/B010S9N6OO/ref=sr_1_1?ie=UTF8&qid=1490132282&sr=8-1',
      B00L8IVWQ4: 'https://www.amazon.com/dp/B00L8IVWQ4/ref=twister_B00PZKJJ5W',
      B01K1IO3QW: 'https://www.amazon.com/Acer-E5-575-33BM-15-6-Inch-Processor-Generation/dp/B01K1IO3QW/ref=sr_1_4?s=pc&ie=UTF8&qid=1491408499&sr=1-4&keywords=laptop',
      B01KPW0UF2: 'https://www.amazon.com/Misfit-Ray-Fitness-Tracker-Stainless/dp/B01KPW0UF2/ref=sr_1_1?ie=UTF8&qid=1493748463&sr=8-1&keywords=B01KPW0UF2',
      B01DORE8GC: 'https://www.amazon.com/gp/product/B01DORE8GC/ref=s9_acsd_aas_bw_c_x_1_w?ie=UTF8&pd_rd_r=C89PKSMDTK3MDR7TRENK&pd_rd_w=EH95W&pd_rd_wg=cP41Z&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-1&pf_rd_r=C89PKSMDTK3MDR7TRENK&pf_rd_r=C89PKSMDTK3MDR7TRENK&pf_rd_t=101&pf_rd_p=2b20b3ce-7494-42e5-9acd-14c3e0df0f17&pf_rd_p=2b20b3ce-7494-42e5-9acd-14c3e0df0f17&pf_rd_i=16313234011',
      B01DORE8GC: 'https://www.amazon.com/gp/product/B01DORE8GC/ref=s9_acsd_aas_bw_c_x_1_w?ie=UTF8&pd_rd_r=C89PKSMDTK3MDR7TRENK&pd_rd_w=EH95W&pd_rd_wg=cP41Z&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-1&pf_rd_r=C89PKSMDTK3MDR7TRENK&pf_rd_r=C89PKSMDTK3MDR7TRENK&pf_rd_t=101&pf_rd_p=2b20b3ce-7494-42e5-9acd-14c3e0df0f17&pf_rd_p=2b20b3ce-7494-42e5-9acd-14c3e0df0f17&pf_rd_i=16313234011'
    }

    Object.keys(items).map(k => {
      const item = amazon.getAsin(items[k])
      assert.equal(item, k)
    })
  });

  it('should get item from ItemLookup using url ', function * () {
    this.timeout(3000)
    var item = yield amazon.getAmazonItem(test_item, 'US');
    expect(item).to.exist;
  })

  it('check item price on item with lower cost but higher shipping', function * () {
    // price should be like 26.65 and not lowest price which might
    //  be 21.90 + 9.99 shipping
    var item = yield amazon.getAmazonItem('https://www.amazon.com/dp/B00I3PN2NQ/', 'US')
    expect(parseInt(item.Item.Offers.Offer.OfferListing.Price.Amount)/100).to.be.above(25)
  })


  it('create a cart', function * () {
    // var item = yield amazon.getAmazonItem(test_item);
    var cart = yield amazon.createAmazonCart({asin: 'B010S9N6OO'}, 'US');
    expect(cart).to.exist;
    expect(cart.HMAC).to.exist;
    expect(cart.CartId).to.exist;
    expect(cart.PurchaseURL).to.exist;

    // create a pretend cart in the db
    test.cart = {
      amazon_cartid: cart.CartId,
      amazon_hmac: cart.HMAC,
      amazon_purchaseurl: cart.PurchaseURL
    }
  })


  it('get a cart', function * () {
    var cart = yield amazon.getAmazonCart(test.cart);
    expect(cart).to.exist;
    expect(cart.HMAC).to.exist;
    expect(cart.CartId).to.exist;
    expect(cart.PurchaseURL).to.exist;
    assert.equal(cart.HMAC, test.cart.amazon_hmac);
    assert.equal(cart.CartId, test.cart.amazon_cartid);
    assert.equal(cart.PurchaseURL, test.cart.amazon_purchaseurl);
    assert.equal(cart.CartItems.CartItem instanceof Array, false, 'CartItems.CartItem should not be an array if only one item in cart')
  })

  it.skip('add another item to cart', function * () {
    this.timeout(3000)
    var cart = yield amazon.addAmazonItemToCart({asin: 'B01BYO79UE', quantity: 1}, test.cart);
    expect(cart.CartItems.CartItem.length).to.equal(2);
    test.amazonCart = cart
  })

  it.skip('add another of an item that was already added to cart to increase quantity', function * () {
    this.timeout(3000)
    var cart = yield amazon.addAmazonItemToCart({asin: 'B01BYO79UE', quantity: 1}, test.cart);
    expect(cart.CartItems.CartItem.length).to.equal(2); // because same item
    cart.CartItems.CartItem.map(i => {
      if (i.ASIN === 'B01BYO79UE') {
        assert.equal(i.Quantity, '2')
      } else {
        assert.equal(i.Quantity, '1')
      }
    })
    test.amazonCart = cart
  })

  it('should sync up a messed up cart', function * () {
    this.timeout(5000)
    var messedUpCart = {
      id: 'dummy',
      amazon_cartid: test.cart.amazon_cartid,
      amazon_hmac: test.cart.amazon_hmac,
      items: [{
        asin: 'B01BYO79UE',
        quantity: 4
      }, {
        asin: 'B007KFXICK',
        quantity: 2
      }]
    }

    var cart = yield amazon.syncAmazon(messedUpCart)
    expect(cart).to.exist;
    expect(cart.HMAC).to.exist;
    expect(cart.CartId).to.exist;
    expect(cart.PurchaseURL).to.exist;
    assert.equal(cart.HMAC, test.cart.amazon_hmac);
    assert.equal(cart.CartId, test.cart.amazon_cartid);
    assert.equal(cart.PurchaseURL, test.cart.amazon_purchaseurl);
    cart.CartItems.CartItem.map(i => {
      if (i.ASIN === 'B01BYO79UE') {
        assert.equal(i.Quantity, '4')
      } else if (i.ASIN === 'B007KFXICK') {
        assert.equal(i.Quantity, '2')
      } else {
        throw new Error('Item not property deleted from cart')
      }
    })
  })

})
