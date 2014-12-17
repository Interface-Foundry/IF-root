var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var stickerSchema = new Schema({

	name: String,
	loc: { type: {type: String }, coordinates: []},
	time: { type: Date, default: Date.now },
	message: String,
	stickerKind: String,
	stickerAction: String,
	href: String,
	stats: {
		alive: Boolean,
		age: Number,
		important: Boolean,
		clicks: Number
	},
	stickerID: String,
	ownerID: { type: String, index: true},
	ownerName: String,
	worldID: { type: String, index: true},
	iconInfo: {
		iconUrl: String,
		iconRetinaUrl: String,
		iconSize: [],
		iconAnchor: [],
		popupAnchor: [],
		iconOrientation: Number        
	}
});


module.exports = mongoose.model('stickerModel', stickerSchema, 'stickers');
