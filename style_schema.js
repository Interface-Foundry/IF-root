var mongoose = require('mongoose'),
textSearch = require('mongoose-text-search');
monguurl = require('monguurl');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var styleSchema = new Schema({

		name: String,

		bodyBG_color: String, // RGB Hex
		cardBG_color: String, // RGB Hex

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
		themeFontName: String // font name

	}); 


module.exports = mongoose.model('styleModel', styleSchema, 'styles');
