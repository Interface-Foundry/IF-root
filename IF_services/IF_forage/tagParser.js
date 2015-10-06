var urlify = require('urlify').create({
    spaces: "",
    nonPrintable: "",
    trim: true
});


module.exports = {
    parse: function(array) {
        var common = ['the', 'it', 'is', 'a', 'an', 'and', 'by', 'to', 'he', 'she', 'they', 'we', 'i', 'are', 'to', 'for', 'of', 'with']
        var finalTags = [];
        var tags = array.join(' ')
        tags = tags.replace(/'s/g, ''); //get rid of 's stuff (apostrophes and plurals, like "women's" or "men's". this removes the 's)
        tags = tags.replace(/[^\w\s]/gi, ''); //remove all special characters
        tags = tags.replace(/\s+/g, ' ').trim(); //remove extra spaces from removing chars
        tags = tags.removeStopWords(); //remove all stop words
        array = tags.split(' ')

        var uniqueArray = eliminateDuplicates(array);
        var commonString = common.join();
        for (var i = 0; i < uniqueArray.length; i++) {
            var tag = urlify(uniqueArray[i]).toLowerCase();
            if (commonString.indexOf(tag) == -1) {
                finalTags.push(tag);
            }
        }

        finalTags = categorize(finalTags);
        finalTags = eliminateDuplicates(finalTags);
        finalTags = finalTags.map(function(tag) {
            return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
        })

        return finalTags;
    },
    colorize: function(tags) {

        var hexCodes = [{
            'red': '#ea0000'
        }, {
            'orange': '#f7a71c'
        }, {
            'yellow': '#fcda1f'
        }, {
            'green': '#89c90d'
        }, {
            'aqua': '#7ce9ed'
        }, {
            'blue': '#00429c'
        }, {
            'purple': '#751ed7'
        }, {
            'pink': '#f75dc4'
        }, {
            'white': '#ffffff'
        }, {
            'grey': '#999999'
        }, {
            'black': '#000000'
        }, {
            'brown': '#663300'
        }]
        var colors = []
        var color = '';
        hexCodes.forEach(function(hash) {
            for (var key in hash) {
                if (hash.hasOwnProperty(key)) {

                    if (tags instanceof Array) {
                        tags.forEach(function(tag) {
                            if (key.toLowerCase().trim() == tag.toLowerCase().trim()) {
                                colors.push(hash[key]);
                            }
                        })
                    } else if (tags instanceof String) {
                        if (key.toLowerCase().trim() == tag.toLowerCase().trim()) {
                            color = hash[key];
                        }
                    }
                }
            }
        })
        var result
        if (colors && colors.length > 0) {
            result = colors
        } else if (color && color.length > 0) {
            result = color
        } else {
            result = null
        }
        return result
    }
}


function categorize(tags) {
    // outerwear, dresses, tops, skirts, pants, underwear, activewear (formerly swimwear), tights & leggings, shoes, bags, accessories, jewelry
    var newCategories = [];
    var categories = [{
        'Tops': [
            'top',
            'shirt',
            'sweater',
            'tshirt',
            't-shirt',
            'sleeveless',
            'long-sleeve',
            'longsleeve',
            'vest',
            'jersey',
            'dress-shirt',
            'dressshirt',
            'button-down',
            'buttondown',
            'polo',
            'polo-shirt',
            'tank',
            'tanktop',
            'tank-top',
            'blouse',
            'henley',
            'crop',
            'croptop',
            'crop-top',
            'tube',
            'tubetop',
            'tube-top',
            'jeantop',
            'jean-top',
            'halter',
            'haltertop',
            'turtle',
            'turtleneck',
            'turtle-neck'
        ]
    }, {
        'Dresses': [
            'dress',
            'sundress',
            'wedding',
            'maxi',
            'gown',
            'bubble',
            'tiered',
            'corset',
            'tea',
            'teadress',
            'wrap',
            'wrapdress',
            'blouson',
            'halter',
            'babydoll',
            'bodycon'
        ]
    }, {
        'Outerwear': [
            'jacket',
            'coat',
            'blazer',
            'hoodie',
            'suit',
            'windbreaker',
            'parka',
            'leather-jacket',
            'leatherjacket',
            'harrington',
            'harrington-jacket',
            'harringtonjacket',
            'poncho',
            'robe',
            'shawl',
            'tuxedo',
            'overcoat',
            'over-coat',
            'sport-coat',
            'sportcoat',
            'waistcoat',
            'waist-coat',
            'duffle',
            'dufflecoat',
            'duffle-coat',
            'peacoat',
            'pea',
            'britishwarm',
            'british-warm',
            'ulster',
            'ulster-coat',
            'winterjacket',
            'winter-jacket',
            'puffer',
            'puffer-jacket',
            'cagoule',
            'chesterfield',
            'cover-coat',
            'covercoat',
            'duffle-coat',
            'bomber',
            'bomber-jacket',
            'bomberjacket',
            'trench',
            'trenchcoat',
            'trench-coat',
            'rain',
            'raincoat',
            'guardjacket',
            'guard-jacket',
            'mess',
            'mess-jacket',
            'messjacket',
            'opera',
            'operacoat',
            'opera-coat',
            'shrug'
        ]
    }, {
        'Pants': [
            'shorts',
            'pants',
            'pant',
            'jeans',
            'jean',
            'trousers',
            'trouser',
            'chaps',
            'cargo',
            'capri',
            'palazzo',
            'palazzos',
            'chinos',
            'chino',
            'khaki',
            'khakis',
            'overalls',
            'yoga-pants',
            'yogapants',
            'lowrise',
            'lowrise-pants',
            'lowrisepants',
            'sweatpants',
            'sweat-pants',
            'parachute',
            'phat',
            'pedal-pushers',
            'pedalpushers',
            'dresspants',
            'dress-pants',
            'bellbottoms',
            'bell-bottoms',
            'cycling',
            'highwater',
            'high-water',
            'bermuda',
            'windpants',
            'wind-pants'
        ]
    }, {
        'Shoes': [
            'shoe',
            'shoes',
            'sneaker',
            'sneakers',
            'boot',
            'boots',
            'slipper',
            'slippers',
            'sandal',
            'sandals',
            'spat',
            'spats',
            'croc',
            'crocs',
            'dress-shoes',
            'boot',
            'boots',
            'flip-flops',
            'flip-flop',
            'sandal',
            'heels',
            'high-heels',
            'highheels'
        ]
    }, {
        'Skirts': [
            'skirt',
            'miniskirt',
            'mini-skirt',
            'a-line',
            'aline',
            'aline-skirt',
            'ballerina',
            'ballerina-skirt',
            'denimskirt',
            'denim-skirt',
            'jobskirt',
            'job-skirt',
            'job',
            'microskirt',
            'micro-skirt',
            'pencil-skirt',
            'pencilskirt',
            'praire',
            'praire-skirt',
            'praireskirt',
            'rah-rah',
            'rahrah',
            'tutu',
            'wrap-skirt',
            'wrapskirt',
            'leatherskirt',
            'leather-skirt'
        ]
    }, {
        'Bags': [
            'backpack',
            'handbag',
            'hand-bag',
            'handbags',
            'chanel',
            'duffel',
            'satchel',
            'tote',
            'messenger',
            'saddle',
            'clutch',
            'wristlet'
        ]
    }, {
        'Accessories': [
            'sunglasses',
            'watch',
            'wristwatch',
            'scarf',
            'sash',
            'headband',
            'glasses',
            'cufflink',
            'tie',
            'necktie',
            'bow',
            'bowtie',
            'belt',
            'bandana',
            'suspenders',
            'wallet'
        ]
    }, {
        'Activewear': [
            'swim',
            'swimwear',
            'swim-wear',
            'swimsuit',
            'swim-suit',
            'swim-briefs',
            'swimbriefs',
            'wet',
            'wetsuit',
            'wet-suit',
            'surfer',
            'surf',
            'trunks',
            'bikini',
            'boardshorts',
            'board',
            'drysuit',
            'dry',
            'one-piece',
            'onepiece',
            'rashguard',
            'rash',
            'yoga',
            'sports'
        ]
    }, {
        'Jewelry': [
            'earrings',
            'earring',
            'necklace',
            'ring',
            'brooch',
            'brooches',
            'bracelet',
            'bracelets',
            'amethyst',
            'emerald',
            'jade',
            'jasper',
            'ruby',
            'sapphire',
            'diamond',
            'gold'
        ]
    }, {
        'Underwear': [
            'brassiere',
            'underwear',
            'underpants',
            'boxers',
            'briefs',
            'boxer',
            'brief',
            'panties',
            'slip',
            'hoisery',
            'bra',
            'bras'
        ]
    }, {
        'Tights & Leggings': [
            'tights',
            'leggings',
            'legging'
        ]
    }]
    categories.forEach(function(category) {
        for (var key in category) {
            if (category.hasOwnProperty(key)) {
                tags.forEach(function(tag) {
                    for (var i = 0; i < category[key].length; i++) {
                        if (category[key][i].trim() == tag.trim()) {
                            newCategories.push(key);
                        }
                    }
                })
            }
        }
    })

    tags.concat(newCategories)
    return tags
}



function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}

String.prototype.removeStopWords = function() {
    var x;
    var y;
    var word;
    var stop_word;
    var regex_str;
    var regex;
    var cleansed_string = this.valueOf();
    var stop_words = new Array(
        'a',
        'about',
        'above',
        'across',
        'after',
        'again',
        'against',
        'all',
        'almost',
        'alone',
        'along',
        'already',
        'also',
        'although',
        'always',
        'among',
        'an',
        'and',
        'another',
        'any',
        'anybody',
        'anyone',
        'anything',
        'anywhere',
        'are',
        'area',
        'areas',
        'around',
        'as',
        'ask',
        'asked',
        'asking',
        'asks',
        'at',
        'away',
        'b',
        'be',
        'became',
        'because',
        'become',
        'becomes',
        'been',
        'before',
        'began',
        'behind',
        'being',
        'beings',
        'best',
        'better',
        'between',
        'both',
        'but',
        'by',
        'c',
        'came',
        'can',
        'cannot',
        'case',
        'cases',
        'certain',
        'certainly',
        'clearly',
        'come',
        'could',
        'd',
        'did',
        'differ',
        'different',
        'differently',
        'do',
        'does',
        'done',
        'downing',
        'downs',
        'during',
        'e',
        'each',
        'early',
        'either',
        'end',
        'ended',
        'ending',
        'enough',
        'evenly',
        'ever',
        'every',
        'everybody',
        'everyone',
        'everything',
        'everywhere',
        'f',
        'fact',
        'facts',
        'far',
        'find',
        'finds',
        'first',
        'for',
        'four',
        'from',
        'fully',
        'further',
        'furthered',
        'furthering',
        'furthers',
        'g',
        'gave',
        'general',
        'generally',
        'get',
        'gets',
        'give',
        'given',
        'gives',
        'go',
        'going',
        'got',
        'h',
        'had',
        'has',
        'have',
        'having',
        'he',
        'her',
        'here',
        'him',
        'his',
        'how',
        'however',
        'i',
        'if',
        'important',
        'in',
        'interest',
        'interested',
        'interesting',
        'interests',
        'into',
        'is',
        'it',
        'its',
        'itself',
        'j',
        'just',
        'k',
        'keep',
        'keeps',
        'kind',
        'knew',
        'know',
        'known',
        'knows',
        'l',
        'largely',
        'last',
        'later',
        'latest',
        'least',
        'less',
        'let',
        'lets',
        'like',
        'likely',
        'longer',
        'longest',
        'm',
        'made',
        'make',
        'making',
        'many',
        'might',
        'more',
        'most',
        'mostly',
        'much',
        'must',
        'my',
        'myself',
        'n',
        'necessary',
        'need',
        'needed',
        'needing',
        'needs',
        'never',
        'new',
        'new',
        'newer',
        'newest',
        'next',
        'no',
        'nobody',
        'non',
        'noone',
        'not',
        'nothing',
        'now',
        'nowhere',
        'o',
        'of',
        'often',
        'on',
        'once',
        'one',
        'only',
        'opens',
        'or',
        'order',
        'ordered',
        'ordering',
        'orders',
        'other',
        'others',
        'our',
        'out',
        'over',
        'p',
        'per',
        'perhaps',
        'place',
        'places',
        'pointing',
        'points',
        'possible',
        'present',
        'presented',
        'presenting',
        'presents',
        'problem',
        'problems',
        'put',
        'puts',
        'q',
        'quite',
        'r',
        'rather',
        'really',
        'right',
        'right',
        'room',
        'rooms',
        's',
        'said',
        'same',
        'saw',
        'say',
        'says',
        'second',
        'seconds',
        'see',
        'seem',
        'seemed',
        'seeming',
        'seems',
        'sees',
        'several',
        'shall',
        'should',
        'show',
        'showed',
        'shows',
        'side',
        'sides',
        'since',
        'so',
        'some',
        'somebody',
        'someone',
        'something',
        'somewhere',
        'state',
        'states',
        'still',
        'still',
        'such',
        'sure',
        't',
        'take',
        'taken',
        'than',
        'that',
        'the',
        'their',
        'them',
        'then',
        'there',
        'therefore',
        'these',
        'they',
        'thing',
        'things',
        'think',
        'thinks',
        'this',
        'those',
        'though',
        'thought',
        'thoughts',
        'through',
        'thus',
        'to',
        'together',
        'too',
        'took',
        'toward',
        'turn',
        'turned',
        'turning',
        'turns',
        'u',
        'under',
        'undefined',
        'until',
        'up',
        'upon',
        'us',
        'use',
        'used',
        'uses',
        'v',
        'very',
        'w',
        'want',
        'wanted',
        'wanting',
        'wants',
        'was',
        'way',
        'ways',
        'we',
        'well',
        'wells',
        'went',
        'were',
        'what',
        'when',
        'where',
        'whether',
        'which',
        'while',
        'who',
        'whole',
        'whose',
        'why',
        'will',
        'with',
        'within',
        'without',
        'work',
        'worked',
        'working',
        'works',
        'would',
        'x',
        'y',
        'year',
        'years',
        'yet',
        'z'
    )

    // Split out all the individual words in the phrase
    words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g)

    // Review all the words
    for (x = 0; x < words.length; x++) {

        //Remove any word with digits in them "3W" "4E" etc
        var matches = words[x].match(/\d+/g);
        if (matches !== null) {
            cleansed_string = cleansed_string.replace(words[x], "");
        }

        // For each word, check all the stop words
        for (y = 0; y < stop_words.length; y++) {
            // Get the current word
            word = words[x].replace(/\s+|[^a-z]+/ig, ""); // Trim the word and remove non-alpha

            // Get the stop word
            stop_word = stop_words[y];

            // If the word matches the stop word, remove it from the keywords
            if (word.toLowerCase() == stop_word) {
                // Build the regex
                regex_str = "^\\s*" + stop_word + "\\s*$"; // Only word
                regex_str += "|^\\s*" + stop_word + "\\s+"; // First word
                regex_str += "|\\s+" + stop_word + "\\s*$"; // Last word
                regex_str += "|\\s+" + stop_word + "\\s+"; // Word somewhere in the middle
                regex = new RegExp(regex_str, "ig");
                // Remove the word from the keywords
                cleansed_string = cleansed_string.replace(regex, " ");
            }
        }
    }
    return cleansed_string.replace(/^\s+|\s+$/g, "");
}