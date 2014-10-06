var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


module.exports = {
    _schema: null,

    _schema_def: {
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
			googledoc: Boolean,
			chat: Boolean,
			mailing_list:Boolean,
			icebreaker:Boolean,
			photo_share:Boolean,
			stickers:Boolean
		}
    },

    schema: function(){
        if (!module.exports._schema){

            module.exports._schema = new mongoose.Schema(module.exports._schema_def);
           
        }
        return module.exports._schema;
    },

    _model: null,

    model: function(new_instance){
        if (!module.exports._model){
            var schema = module.exports.schema();
            mongoose.model('styles', schema);
            module.exports._model = mongoose.model('styles');
        }

        return new_instance ?
            new module.exports._model() :
            module.exports._model;
    }
}