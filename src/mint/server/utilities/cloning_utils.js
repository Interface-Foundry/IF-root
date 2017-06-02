var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var clone = function * (cart_id, user_id) {
  var original = yield db.Carts.findOne({id: cart_id}).populate('items').populate('clones')
  var originalJson = original.toJSON();

  // delete association fields that do not carry over to the clone
  // social metrics like views and checkouts will only be stored on the original
  delete originalJson.id
  delete originalJson.items
  delete originalJson.original
  delete originalJson.clones
  delete originalJson.checkouts
  delete originalJson.members
  delete originalJson.leader
  delete originalJson.views

  // create new cart
  var clone = yield db.Carts.create(originalJson)

  // change leader
  clone.leader = user_id
  clone.dirty = false;

  console.log(original.items)
  // clone items in the cart
  yield original.items.map(function * (item) { //this line is throwing a weird exception for some reason?

    item = yield db.Items.findOne({id: item.id}).populate('details')
    console.log('item:', item)

    //create new item
    var itemJson = item.toJSON();

    delete itemJson.id
    delete itemJson.options
    delete itemJson.reactions
    delete itemJson.added_by
    delete itemJson.cart
    delete itemJson.details

    //create new item
    var clonedItem = yield db.Items.create(itemJson)
    clonedItem.cart = clone.id
    clonedItem.added_by = user_id
    clonedItem.details = item.details.id

    yield clonedItem.save()

    clone.items.add(clonedItem.id)
  })

  // set original
  clone.original = (original.original ? original.original : original.id)
  yield clone.save()

  // logging.info('clone.original', clone.original)

  // set new as clone of old
  original = yield db.Carts.findOne({id: clone.original}).populate('clones')
  original.clones.add(clone.id)
  yield original.save()

  clone = yield db.Carts.findOne({id: clone.id}).populate('items').populate('original')
  return clone;
}

module.exports = {
  clone: clone
}
