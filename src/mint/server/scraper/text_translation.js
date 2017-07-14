const Translate = require('@google-cloud/translate')

module.exports.translateText = async function (s){

	//single string array to send for tranlsation
	var t = []

	//collect text to translate into a single arr for google translate API
	if(s.original_name.value){
		t.push(s.original_name.value)
	}
	if(s.original_description.value){
		t.push(s.original_description.value)
	}
	if(s.options && s.options.length > 0){
	    for (var i = 0; i < s.options.length; i++) {
			if(s.options[i].original_name.value && s.options[i].type !== 'size'){
				t.push(s.options[i].original_name.value)
			}
		}
	}
	logging.info('about to do the actual translation')

	//send to google for translate
	var t_map = await translate(t,s.user.locale)
	//piece translation back into 
	if(s.original_name.value){
		s.name = t_map[0]
		t_map.shift()
	}
	if(s.original_description.value){
		s.description = t_map[0]
		t_map.shift()
	}
	if(s.options && s.options.length > 0){
		for (var i = 0; i < s.options.length; i++) {
			if(s.options[i].original_name.value){
				if(s.options[i].type == 'size'){
					s.options[i].name = s.options[i].original_name.value
				}else {
					s.options[i].name = t_map[0]
					t_map.shift()
				}
			}
		}
	}

	return s
}

/**
 * Translates one or more sentence strings into target language
 * @param {string} Text (string or array of strings) to translate
 * @param {string} Target language
 * @returns {object} A list of currencies with corresponding rates
 */
var translate = async function (text, target) {
  	// Instantiates a client
	// return [text]
	logging.info('translate called')
  	const translate = Translate()
  	var translations
	// Translates the text into the target language. "text" can be a string for
	// translating a single piece of text, or an array of strings for translating
	// // multiple texts.
  	return translate.translate(text, target)
    .then((results) => {
      translations = results[0]
      translations = Array.isArray(translations) ? translations : [translations];
			return translations
    })
    .catch((err) => {
      logging.error('ERROR:', err);
    });
    // return translations
}
