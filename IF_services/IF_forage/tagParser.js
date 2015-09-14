var urlify = require('urlify').create({
    spaces: "",
    nonPrintable: "",
    trim: true
});


module.exports = {
    parse: function(array, common) {
        var common = ['the', 'it', 'is', 'a', 'an', 'and', 'by', 'to', 'he', 'she', 'they', 'we', 'i', 'are', 'to', 'for', 'of', 'with']
        var finalTags = [];
        var uniqueArray = eliminateDuplicates(array);
        var commonString = common.join();
        for (var i = 0; i < uniqueArray.length; i++) {
            var tag = urlify(uniqueArray[i]).toLowerCase();
            if (commonString.indexOf(tag) == -1) {
                //Process tag
                if (tag == 'man') {
                    tag = 'mens'
                } else if (tag == 'woman') {
                    tag = 'womens'
                } else if (tag == 'tshirt') {
                    tag = 't-shirt'
                }
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
