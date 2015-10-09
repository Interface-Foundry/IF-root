var mongoose = require('mongoose');
var _ = require('lodash');

/**
 * schema for trainnig neural networks or other classifiers
 */
var trainingSchema = mongoose.Schema({
  // optional id if this training data sample comes from our own database
  landmarkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landmark'
  },

  // obvious text fields
  name: String,
  description: String,

  // List of tags, hopefully from our own list of fashion tags (like button_down)
  tags: [String],

  // list of image urls, hopefully pointing to S3
  images: [String],

  // could potentially be of use somehow
  price: Number,

  // defines which set of points this belongs to (see descriptions)
  trainingset: {
    type: String,
    enum: [
      'TRAINING', // the set of all samples used to train algorithms
      'DEV', // the set of all samples used to test accuracy during development
      'TEST' // the set of "real world" samples for final accuracy testing (to avoid overfitting hyperparameters with the dev set)
    ],
    default: 'TRAINING'
  },

  // source for this sample, such as "shoptiques"
  source: String,

  // basically any other meta data you want
  meta: {}
});

// adds a sample and autmatically assigns it to TRAINING/DEV/TEST setvar schema = new Schema(..);
trainingSchema.pre('save', function(next) {
  // training set is 80% of samples,
  // dev and test are 10% each
  var r = Math.random();
  if (r > .9) {
    this.trainingset = 'TEST';
  } else if (r > .8) {
    this.trainingset = 'DEV';
  } else {
    this.trainingset = 'TRAINING';
  }

  next();
});

var TrainingData = mongoose.model('TrainingData', trainingSchema, 'trainingdata');

// helper method
var getSet = function(length, set, callback) {
  var query = TrainingData.find({
    trainingset: set
  }).select('-meta -source')

  if (length > 0) {
    query = query.limit(length);
  }

  query.exec(function(e, samples) {
    if (e) return callback(e);
    callback(null, _.shuffle(samples));
  })
}

/**
 * Gets a training set
 */
TrainingData.getTrainingData = function(length, callback) {
  // length is optional
  if (typeof length === 'function') {
    callback = length;
    length = 0;
  }

  getSet(length, 'TRAINING', callback);
}

TrainingData.getDevSet = function(length, callback) {
  // length is optional
  if (typeof length === 'function') {
    callback = length;
    length = 0;
  }

  getSet(length, 'DEV', callback);
}

TrainingData.getTestSet = function(length, callback) {
  // length is optional
  if (typeof length === 'function') {
    callback = length;
    length = 0;
  }

  getSet(length, 'TEST', callback);
}

module.exports = TrainingData;
