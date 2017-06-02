var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var clone = function * (cart_id, user_id) {
  var original = yield db.Carts.findOne({id: cart_id}).populate('items').populate('clones').populate('ancestors')
  var originalJson = original.toJSON();

  // delete association fields that do not carry over to the clone
  // social metrics like views and checkouts will only be stored on the original
  delete originalJson.id
  delete originalJson.items
  delete originalJson.ancestors
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

  // clone items in the cart
  yield original.items.map(function * (item) { //this line is throwing a weird exception for some reason?

    item = yield db.Items.findOne({id: item.id}).populate('details')

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
  logging.info('original.ancestors', original.ancestors)

  if (original.ancestors) {
    yield original.ancestors.map(function * (a) {
      var ancestor = yield db.Carts.findOne({id: a.id}).populate('clones')
      clone.ancestors.add(a.id)
      ancestor.clones.add(clone.id)
      yield ancestor.save()
    })
  }

  // logging.info('clone:', clone)
  clone.ancestors.add(original.id)
  yield clone.save()
  original.clones.add(clone.id)
  yield original.save()

  clone = yield db.Carts.findOne({id: clone.id}).populate('items').populate('ancestors')
  return clone;
}

module.exports = {
  clone: clone
}
