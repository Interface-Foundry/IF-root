var express = require('express')

var app = module.exports = express.createServer();
var mongoose = require('mongoose')
var ObjectId = mongoose.Types.ObjectId
var nodify = require('nodify-shopify');
var apiKey, secret;
var persistentKeys = {};
var db = require('db')
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var uniquer = require('../../IF_services/uniquer');
var tagParser = require('../../IF_services/IF_forage/tagParser');
var upload = require('../../IF_services/upload')
var config = require('./config.json');
var request = require('request')
apiKey = config.apiKey;
secret = config.secret;

async.whilst(
    function() {
        return true
    },
    function(dailyUpdate) {
        console.log('Updating Shopify Inventory')
        old_items = [];
        new_items = [];

        db.ShopifyAccount.find({}, function(err, accounts) {
            async.eachSeries(accounts, function iterator(account, finishedAccount) {
              // console.log('!!!','shopify_' + account.name.toString())
                db.Landmarks.findOne({
                    'id': 'shopify_' + account.name.toString()
                }, function(err, shop) {
                    if (err) console.log('31: ', err)
                    if (!shop) {
                        console.log('33: Shop Not found!')
                        return finishedAccount()
                    }

                    console.log('Updating inventory for: ', shop._id)
                    var sid = new ObjectId(shop._id);
                    db.Landmarks.find({
                        'parents': sid
                    }, function(err, olditems) {
                        if (err) console.log('31: ', err)
                        old_items = olditems.map(function(item){
                          return 'shopify_' + item.id.toString().trim()
                        })
                        if (!olditems || (olditems && olditems.length < 1)) {
                            console.log('46: No items found for this shop!')
                            return finishedAccount()
                        }

                        var url = 'https://' + account.shop.trim() + '/admin/products.json?scope=read_products'
                        var options = {
                            url: url,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
                                'Content-Type': 'application/json',
                                'X-Shopify-Access-Token': account.token
                            }
                        };
                        console.log('GET URL: ', url)
                        request(options, function(error, response, body) {
                            if ((!error) && (response.statusCode == 200)) {
                                body = JSON.parse(body);
                                if (!body.products || body.products.length < 1) {
                                    console.log('\n\n\nEmpty response...\n\n\n')
                                    return finishedAccount();
                                }
                                async.eachSeries(body.products, function iterator(product, finishedProduct) {
                                    if (product.variants && product.variants.length < 1) {
                                        return finishedProduct()
                                    }
                                    new_items = product.variants.map(function(variant) {
                                        return 'shopify_' + variant.id.toString().trim()
                                    })
                                    async.eachSeries(product.variants, function iterator(variant, finishedVariant) {
                                        db.Landmark.findOne({
                                            'id': 'shopify_' + variant.id.toString().trim(),
                                            'linkbackname': 'myshopify.com'
                                        }, function(err, item) {
                                            if (err) console.log('58: ', err);

                                            updateInventory(old_items, new_items).then(function() {
                                                if (variant.inventory_management == 'shopify' && variant.inventory_policy == 'deny' && variant.inventory_quantity && variant.inventory_quantity < 1) {
                                                    item.update({
                                                        $set: {
                                                            'parents': [],
                                                            'loc.coordinates': [
                                                                [0, -90]
                                                            ],
                                                            'source_generic_item.inventory_quantity': 0
                                                        }
                                                    }, function(e, result) {
                                                        if (e) {
                                                            console.log('66: ', e)
                                                        }
                                                        return finishedVariant();
                                                    })
                                                } else if (variant.inventory_quantity && variant.inventory_quantity > 0) {
                                                    item.update({
                                                        $set: {
                                                            'source_generic_item.inventory_quantity': variant.inventory_quantity
                                                        }
                                                    }, function(e, result) {
                                                        if (e) {
                                                            console.log('66: ', e)
                                                        }
                                                        return finishedVariant();
                                                    })
                                                }
                                            }).catch(function(err) {
                                                if (err) console.log('87: ', err)
                                                return finishedVariant();
                                            })
                                        })
                                    }, function finishedVariants(err) {
                                        if (err) console.log('116: ', err)
                                        console.log('Finished Variants!')
                                        finishedProduct()
                                    })
                                }, function finishedProducts() {
                                    wait(function() {
                                        finishedAccount();
                                    }, 800);
                                })
                            } else {
                                if (error) {
                                    console.log('Shopify API error ', error)
                                    wait(function() {
                                        finishedAccount();
                                    }, 800);
                                } else {
                                    console.log('bad response')
                                    wait(function() {
                                        finishedAccount();
                                    }, 800);
                                }
                            }
                        });
                    })
                })
            }, function finishedAccounts(err) {
                if (err) console.log('154: ', err)
                console.log('Finished Updating Accounts.')
                wait(dailyUpdate, 86399999); // Update Daily
            })
        })
    },
    function(err) {
        if (err) console.log('164: ', err)
    }
);

function updateInventory(old_items, new_items) {
    return new Promise(function(resolve, reject) {
        var d = _.difference(old_items, new_items);
        if (d.length < 1) {
            return resolve('No items to remove.')
        }
        db.Landmarks.remove({
            'id': {
                $in: d
            },
            'linkbackname': 'myshopify.com',
            'world': false
        }, function(err, result) {
            if (err) {
                console.log(err)
                return reject()
            } else {
                console.log('Updated inventory: ', result.result.ok, result.result.n)
                resolve()
            }
        })
    })
}

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}