var mongoose = require('mongoose');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var styleSchema = new Schema({

		name: String,

		bodyBG_color: String, // RGB Hex
		cardBG_color: String, // RGB Hex #FFF 
		titleBG_color: String, //RGB Hex
		navBG_color: String, //RGB Hex
		
		cardBorder: Boolean, // off by default
		cardBorder_color: String, // RGB Hex
		cardBorder_corner: Number, // px to round

		worldTitle_color: String, // RGB Hex
		landmarkTitle: Boolean, // off by default
		landmarkTitle_color: String, // RGB Hex
		categoryTitle: Boolean, // off by default
		categoryTitle_color: String, // RGB Hex
		accent: Boolean, // off by default
		accent_color: String, // RGB Hex
		bodyText: Boolean, // off by default
		bodyText_color: String, // RGB Hex

		bodyFontName: String, // font name
		bodyFontFamily: String, // font family
		themeFont: Boolean, // off by default
		themeFontName: String, // font name
		
		widgets: {
			twitter: Boolean,
			instagram: Boolean,
			upcoming: Boolean,
			category: Boolean,
			messages: Boolean,
			presents: Boolean,
			streetview: Boolean,
			nearby: Boolean
		}
	}); 


module.exports = mongoose.model('styleModel', styleSchema, 'styles');
