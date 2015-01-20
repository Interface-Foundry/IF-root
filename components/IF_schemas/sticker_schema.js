var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var stickerSchema = new Schema({

	name: String,
	loc: { type: {type: String }, coordinates: []},
	time: { type: Date, default: Date.now },
	message: String,
	stickerKind: String, //map based
	stickerAction: String, //open map and pan to it.
	href: String,
	stats: {
		alive: Boolean,
		age: Number,
		important: Boolean,
		clicks: Number
	},
	stickerID: String, //placeholder for url-friendly sticker id, different from unique id
	ownerID: { type: String, index: true},
	ownerName: String,
	roomID: { type: String, index: true}, //objectID for parent room
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
