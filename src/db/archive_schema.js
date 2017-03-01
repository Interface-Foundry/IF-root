var mongoose = require('mongoose')
var co = require('co')

// stores any sort of archives
var archivesSchema = mongoose.Schema({

  //
  // required stuff: collection name, _id, and json
  //
  original_collection: {
    type: String,
    index: true,
    required: true
  },

  original_id_str: {
    type: String,
    index: true,
    required: true
  },

  original_object: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  //
  // optional stuff: for ease of searching or possible recovery
  //
  team_id: String,

  //
  // automagic stuff: date of archive operation
  //
  archive_date: {
    type: Date,
    default: Date.now
  }
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Archives', archivesSchema)

//
// Archives a document in the database
//
module.exports.archive = function (document) {
  if (!document._id || !document.collection || !document.toObject) {
    throw new Error('cannot archive something that is not a database document')
  }

  return co(function * () {
    var obj = {
      original_collection: document.collection.name,
      original_id_str: document._id.toString(),
      original_object: document.toObject(),
      team_id: document.team_id
    }

    obj = new module.exports(obj)
    yield obj.save()
    yield document.remove()
    return obj
  })
}

//
// Undo for the archive operation above
//
module.exports.unarchive = function (document) {
  if (!document._id || !document.collection || document.collection.name !== 'archives') {
    throw new Error('can only unarchived documents in the archives collection')
  }

  return co(function * () {
    var obj = document.original_object
    obj = new db[document.original_collection](obj)
    yield obj.save()
    return obj
  })
}
