var kip = require('../../kip');


var search = function(input,callback) {

  console.log('INPUT ', input)

  switch(input){

      case '😀': //grinning face//
          getRandom(['glitter','lava lamp', 'watchman graphic novel', 'potato chips crisps','coloring','chocolate', 'planetarium', 'lamp', 'feel good stickers'],function(kk){
            res = kk;
          });
          break;

      case '😁': //grinning face with smiling eyes/grimace face//
          getRandom(['cartoon bandages', 'ouch plasters', 'bloopers', 'oh my god'],function(kk){
              res = kk;
          });
          break;

      case '😂': //tears of joy//
          getRandom(['sparkling wine', 'roomba', 'luxury bed sheets', 'bath bomb', 'hammock', 'kindle','amazon echo', 'coloring','belgian chocolate', 'audio headphones', 'luxury', 'bluetooth speakers', 'puns', 'dr teal', 'lego', 'pillow', 'giant stuffed animals'],function(kk){
              res = kk;
          });
          break;

      case '😃': //smiling face with open mouth/happy//
          getRandom(['sparkling wine', 'roomba', 'blanket', 'chocolate', 'pillow', 'bath bomb', 'hammock', 'kindle','amazon echo', 'coloring', 'bubble bath', 'happy planner'],function(kk){
              res = kk;
          });
          break;

      case '😄': //Smiling Face With Open Mouth and Smiling Eyes//
          getRandom(['sparkling wine', 'ice cream','roomba', 'blanket', 'chocolate', 'pillow', 'bath bomb', 'hammock', 'kindle','amazon echo', 'coloring', 'bubble bath', 'happy planner'],function(kk){
              res = kk;
          });
          break;

      case '😅': //Smiling Face With Open Mouth and Cold Sweat//
          getRandom(['towel', 'bloopers','sports bag', 'water bottle', 'self help', 'cold towel', 'sports drink'],function(kk){
              res = kk;
          });
          break;

      case '😆': //Smiling Face With Open Mouth and Tightly-Closed Eyes//
          getRandom(['sparkling wine', 'roomba', 'blanket', 'chocolate', 'pillow', 'bath bomb', 'hammock', 'kindle','amazon echo', 'coloring', 'bubble bath', 'happy planner'],function(kk){
              res = kk;
          });
          break;

      case '😉': //Winking Face//
          getRandom(['jokes', 'bloopers', 'massage oil', 'chocolate', 'joystick', 'flirting', 'essential oil', 'love game','candy', 'sweethearts', 'bubble bath', 'puns', 'romance', 'erotica'],function(kk){
              res = kk;
          });
          break;

      case '😊': //Smiling Face With Smiling Eyes//
          getRandom(['decorative tape', 'markers', 'happy stickers', 'feel good', 'belgian chocolate', 'wine', 'lava lamp', 'giant stuffed panda', 'audio headphones', 'iphone', ''],function(kk){
              res = kk;
          });
          break;

      case '😋': //Face Savouring Delicious Food//
          getRandom(['silly', 'lego','puns', 'joke', 'potato chips crisps', 'soft drinks', 'cheetos', 'cheese', 'energy bar', 'chocolate', 'fruit wrap', 'dried fruit', 'mixed nuts', 'peanut butter', 'trader joe', 'frito lay', 'kettle chips', 'doritos cool ranch'],function(kk){
              res = kk;
          });
          break;

      case '😎': //Smiling Face With Sunglasses//
          getRandom(['sunglasses', 'eyewear','cool spectacles', 'ray ban', 'oakley', 'cool stuff', 'sleeping mask', 'costume mask', 'cool toys', 'cool games', 'cool electronics'],function(kk){
              res = kk;
          });
          break;

      case '😍': //Smiling Face With Heart-Shaped Eyes//
          getRandom(['sparkling wine', 'hearts','heart-shaped', 'luxury bed sheets', 'bath bomb', 'hammock', 'kindle','amazon echo', 'coloring','belgian chocolate', 'audio headphones', 'luxury', 'bluetooth speakers', 'puns', 'dr teal', 'lego', 'pillow', 'giant stuffed animals'],function(kk){
              res = kk;
          });
          break;

      case '😘': //Face Throwing a Kiss//
          getRandom(['kiss', 'sexy', 'massage oil', 'chocolate', 'joystick', 'flirting', 'essential oil', 'love game','candy', 'sweethearts', 'bubble bath', 'valentine', 'romance', 'erotica'],function(kk){
              res = kk;
          });
          break;

      case '😗': //Kissing Face/Whistling Face/
          getRandom(['kiss', 'sexy', 'whistle', 'flute', 'war heads', 'essential oil', 'lip balm','lip stick', 'sweethearts', 'sour pucker', 'lip plumper', 'romance', 'kissing'],function(kk){
              res = kk;
          });
          break;

     case '😙': //Kissing Face With Smiling Eyes//
          getRandom(['kiss', 'sexy', 'whistle', 'flute', 'war heads', 'essential oil', 'lip balm','lip stick', 'sweethearts', 'sour pucker', 'lip plumper', 'romance', 'kissing'],function(kk){
              res = kk;
          });
          break;

     case '😚': //Kissing Face With Closed Eyes//
          getRandom(['kiss', 'sexy', 'whistle', 'flute', 'war heads', 'essential oil', 'lip balm','lip stick', 'sweethearts', 'sour pucker', 'lip plumper', 'romance', 'kissing'],function(kk){
              res = kk;
          });
          break;

     case '☺️': //White Smiling Face//
          getRandom(['decorative tape', 'markers', 'happy stickers', 'feel good', 'belgian chocolate', 'wine', 'lava lamp', 'giant stuffed panda', 'audio headphones', 'iphone', 'best seller beauty'],function(kk){
              res = kk;
          });
          break;

     case '🙂': //Slightly Smiling Face//
          getRandom(['decorative tape', 'markers', 'happy stickers', 'feel good', 'belgian chocolate', 'wine', 'lava lamp', 'giant stuffed panda', 'audio headphones', 'iphone', 'best seller beauty'],function(kk){
              res = kk;
          });
          break;


     case '🤗': //Hugging face//
          getRandom(['giant stuffed animals', 'giant stuffed panda','giant stuffed teddy', 'giant stuffed elephant', 'hug', 'plush', 'blanket', 'plush toys', 'pillow'],function(kk){
              res = kk;
          });
          break;

     case '😇': //Smiling Face With Halo//
          getRandom(['angel wings', 'angel halo','angel dress', 'angel toy', 'angel doll','reward sticker', 'angel food cake', 'glitter lamp', 'cherub statue', 'celestial'],function(kk){
              res = kk;
          });
          break;

     case '🤓': //Nerd face//
          getRandom(['quantum physics', 'big bang theory','nerd', 'nerd glasses', 'nerd gifts', 'computer accessories', 'computer', 'tablets', 'amazon echo', 'kindle', 'gaming headset', 'PC accessories', 'call of duty'],function(kk){
              res = kk;
          });
          break;

     case '🤔': //Thinking Face/Throwing Shade//
          getRandom(['asshole book', 'great thinkers','puzzles', 'rubiks', 'self help', 'anxiety', 'shades', 'thoughtful gifts', 'dont know', 'thinking'],function(kk){
              res = kk;
          });
          break;

     case '😐': //neutral face//
          getRandom(['neutral', 'poker','no emotional', 'chess', 'self help', 'surel', 'anxiety', 'no comment', 'switzerland', 'staying neutral', 'repressed feelings', 'feelings therapy'],function(kk){
              res = kk;
          });
          break;

     case '😑': //expressionless face/nocomment//
          getRandom(['neutral', 'poker','no emotional', 'chess', 'self help', 'surel', 'anxiety', 'no comment', 'switzerland', 'staying neutral', 'repressed feelings', 'feelings therapy'],function(kk){
              res = kk;
          });
          break;

     case '😶': //Face with no mouth/silent//
          getRandom(['noise canceling headphones', 'silent','silent fan', 'silent mouse', 'silent clock', 'meditation', 'mindfulness', 'silent spring', 'blank paper'],function(kk){
              res = kk;
          });
          break;

     case '🙄': //Face with Rolling eyes//
          getRandom(['ripleys', 'bloopers','true accounts', 'embarrassing', 'eye roll', 'eye care', 'eye cream', 'goggle eyes'],function(kk){
              res = kk;
          });
          break;

     case '😏': //Smirking Face Suggestive Face//
          getRandom(['sparkling wine', 'smirk', 'massage oil', 'chocolate', 'joystick', 'flirting', 'essential oil', 'love game','candy', 'sweethearts', 'bubble bath', 'puns', 'romance', 'romcom'],function(kk){
              res = kk;
          });
          break;

     case '😣': //Persevering Face Helpless Scrunched Eyes//
          getRandom(['self help', 'home repair','DIY', 'gorilla glue', 'repair', 'home solution', 'organizer', 'happy planner', 'motivational posters', 'motivational', 'motivation', 'how to help', 'life preserver', 'preserved lemons'],function(kk){
              res = kk;
          });
          break;

     case '😥': //Disappointed but Relieved Face stressful//
          getRandom(['towel', 'bloopers','sports bag', 'water bottle', 'self help', 'cold towel', 'sports drink', 'anxiety', 'handle stress', 'stressed', 'meditation', 'mindfulness', 'yoga', 'relaxing tea', 'stress relief', 'insomnia', 'pain relief'],function(kk){
              res = kk;
          });
          break;

     case '😮': //Face With Open Mouth//
          getRandom(['shock', 'gag gifts','surprise gift', 'kinder surprise', 'surprise egg', 'surprise box', 'brain surprising', 'surprised by hope', 'g shock', 'shock absorber', 'shock pen', 'shock doctor'],function(kk){
              res = kk;
          });
          break;

     case '🤐': //Zipper mouth Face//
          getRandom(['conspiracy theory books', 'illuminati','zipper wallet', 'zipper bag', 'victoria secret', 'secret', 'secret deodorant', 'secret garden', 'secret life of pets', 'keep secret', 'hush batman'],function(kk){
              res = kk;
          });
          break;

     case '😪': //Sleepy Face side tear snot bubble//
          getRandom(['snoring', 'sleep aids','pillow', 'blanket', 'facial tissue', 'insomnia', 'sleepytime', 'night light', 'night goggles', 'night stand'],function(kk){
              res = kk;
          });
          break;

     case '😫': //Tired Face fed up//
          getRandom(['tired eyes', 'tired feet', 'tired teddies', 'stress relief', 'pain relief', 'insomnia', 'energy drink', 'energy pill', 'energy gel', 'energy bar', 'meditation', 'mindfulness',],function(kk){
              res = kk;
          });
          break;

     case '😴': //Sleeping Face//
          getRandom(['snoring', 'sleep aids','luxury pillow', 'luxury blanket', 'mattress', 'sleep mask', 'insomnia', 'sleepytime', 'night light', 'tired teddies', 'night stand'],function(kk){
              res = kk;
          });
          break;

     case '😌': //Relieved Face Pleased Emoji  Content Emoji//
          getRandom(['decorative tape', 'markers', 'happy stickers', 'feel good', 'belgian chocolate', 'wine', 'lava lamp', 'giant stuffed panda', 'audio headphones', 'iphone', 'best seller beauty', 'best seller kitchen', 'best seller coffee', '90s music', 'pain relief', 'sleep aid', 'aromatherapy', 'bubble bath', 'special treats' ],function(kk){
              res = kk;
          });
          break;

     case '😛': //Face With Stuck-Out Tongue Cheeky Tongue out//
          getRandom(['cheeky', 'cheeky gifts','sexy gifts', 'jokes', 'puns', 'bloopers', 'comedy movies', 'comedy dvd', 'comedians', 'funny', 'fun toys', 'fun gifts', 'zany', 'wacky', 'wacky gifts', 'wacky toys', 'wacky games', 'wacky books', 'zany books'],function(kk){
              res = kk;
          });
          break;

     case '😜': //Face With Stuck-Out Tongue and Winking Eye//
          getRandom(['cheeky', 'cheeky gifts','sexy gifts', 'jokes', 'puns', 'bloopers', 'comedy movies', 'comedy dvd', 'comedians', 'funny', 'fun toys', 'fun gifts', 'zany', 'wacky', 'wacky gifts', 'wacky toys', 'wacky games', 'wacky books', 'zany books'],function(kk){
              res = kk;
          });
          break;

     case '😝': //Face With Stuck-Out Tongue and Tightly-Closed Eyes//
           getRandom(['cheeky', 'cheeky gifts','sexy gifts', 'jokes', 'puns', 'bloopers', 'comedy movies', 'comedy dvd', 'comedians', 'funny', 'fun toys', 'fun gifts', 'zany', 'wacky', 'wacky gifts', 'wacky toys', 'wacky games', 'wacky books', 'zany books'],function(kk){
              res = kk;
          });
          break;

     case '😒': //Unamused Face//
          getRandom(['unamused', 'grumpy mug','grumpy', 'grumpy cat', 'coffee', 'self help', 'interesting gifts', 'feel good movies', 'feel good books', 'chocolate', 'potato chips crisps', 'energy bar', 'dealing with stress', 'dealing with annoyance', 'dealing with bullshit'],function(kk){
              res = kk;
          });
          break;

     case '😔': // Pensive Face//
          getRandom(['apology gifts', 'apology card','sorry card', 'sorry board game', 'sorry beyonce', 'dealing with sadness', 'sadness funko', 'apology socrates'],function(kk){
              res = kk;
          });
          break;

     case '😕': //Confused Face//
          getRandom(['confusing situations', 'guide to living','dealing with anxiety', 'disappointment with god', 'self help', 'hitchhiker guide to galaxy', 'unexpected guide', 'anxiety', 'handle stress', 'stressed', 'meditation', 'mindfulness', 'yoga', 'relaxing tea', 'stress relief', 'insomnia', 'pain relief'],function(kk){
              res = kk;
          });
          break;

     case '🙃': //Upside-Down Face//
          getRandom(['jokes', 'bloopers', 'silly gifts', 'gag gifts', 'crazy toys', 'fun gifts', 'puns', 'bloopers','weird candy', 'LED balloons', 'bubble bath', 'puns', 'crazy gifts', 'ripleys'],function(kk){
              res = kk;
          });
          break;

     case '🤑': //Money-Mouth Face//
          getRandom(['luxury electronics', 'luxury gaming chair','luxury pillows', 'bling jewelry', 'how to make money', 'learn investing', 'lives of rich', 'sparkling wine'],function(kk){
              res = kk;
          });
          break;

      default:
          res = input;

  }

  callback(res)

}

function getRandom(items,callback){
  callback(items[Math.floor(Math.random()*items.length)]);
}

/// exports
module.exports.search = search;

