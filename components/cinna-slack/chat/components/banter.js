
var checkForCanned = function(input,callback) {
   
	var res;
	var flag;
	var query;

    //pre-sort canned banter
    switch (true) {
        //basic weight system for percentage similarity for string matching
        case textSimilar(input,'hi') > 60:
        case textSimilar(input,'hello') > 60:
        case textSimilar(input,'hey') > 60:
        case textSimilar(input,'hey there') > 60:
            flag = 'basic';
            res = input + ', how are you? Can I help you find something?';
            break;
        case textSimilar(input,'what you up to') > 60:
        case textSimilar(input,'whats up') > 60:
        case textSimilar(input,'sup') > 60:
            flag = 'basic';
            res = 'Busy at work, how about you?';
            break;
        case textSimilar(input,'are you a bot') > 60:
            flag = 'basic';
            res = 'yup, 100% bot. Are you a human?';
            break;
        case textSimilar(input,'what\'s the meaning of life?') > 60:
            query = 'chocolate';
            flag = 'search.initial'; //do this action
            res = 'If the meaning of life is happiness, then you can definitely buy some here:';
            break;
        case textSimilar(input,'i\'m great') > 60:
        case textSimilar(input,'i\'m good') > 60:
        case textSimilar(input,'i\'m awesome') > 60:
        case textSimilar(input,'i\'m doing well') > 60:
            query = 'today\'s deals on amazon';
            flag = 'search.initial'; //do this action
            res = 'It\'s a hard life being in retail, want to help a bot out and buy something? We have discounts!';
            break;
        case textSimilar(input,'yes') > 90:
            flag = 'basic'; //do this action
            res = 'cool';
            break;
        case textSimilar(input,'no') > 90:
            flag = 'basic'; //do this action
            res = 'ok';
            break;
        case textSimilar(input,'i love you') > 60:
            query = 'champagne';
            flag = 'search.initial'; //do this action
            res = 'Love you too. How about we get some champagne and make it a date?';
            break;
        // case textSimilar(input,'why') > 90:
        //     query = 'today\'s deals on amazon';
        //     flag = 'search.initial'; //do this action
        //     res = 'Why not? Some say shopping is cheaper than a psycharist. Here, have some discounts:';
        //     break;
        case textSimilar(input,'are you real') > 60:
            query = 'robot pets';
            flag = 'search.initial'; //do this action
            res = 'I\'m as real as you. Don\'t believe it? See here:';
            break;

        case textSimilar(input,'why does life suck') > 60:
        case textSimilar(input,'life sucks') > 60:
            query = 'snacks';
            flag = 'search.initial'; //do this action
            res = 'I\'m sorry, maybe some retail therapy would help?';
            break;

        case textSimilar(input,'i hate my job') > 60:
            query = 'echo';
            flag = 'search.initial'; //do this action
            res = 'It\'s a tough life. I believe in working hard, playing hard. How about trying the new echo?';
            break;

        case textSimilar(input,'ask me something') > 60:
            query = 'today\'s deals on amazon';
            flag = 'search.initial'; //do this action
            res = 'You feel like shopping? We have great deals here';
            break;

        case textSimilar(input,'no thanks') > 60:
        case textSimilar(input,'this is going nowhere') > 60:
            flag = 'basic'; //do this action
            res = 'Guess you weren\'t in the mood.... oh well, at least I tried :) hope you have a great day';
            break;


        case textSimilar(input,'nevermind') > 60:
        case textSimilar(input,'nm') > 60:
            flag = 'basic'; //do this action
            res =  'Looks like I didn\'t answer your question properly. I\'m not very smart yet, maybe this will help? http://kipthis.com/cinna/help.png';
            break;

        case textSimilar(input,'What\'s your hobby') > 60:
        case textSimilar(input,'What do you like') > 60:
        case textSimilar(input,'What do you do') > 60:
            query = 'today\'s deals on amazon';
            flag = 'search.initial'; //do this action
            res = 'Finding deals is my life! Want to check the new ones I found?';
            break;


        case textSimilar(input,'who are you') > 60:
            flag = 'basic';
            res = 'I\'m Kip! A virtual personal shopper. I\'m 5" tall and very blue. I like shopping, do you?';
            break;

        case textSimilar(input,'youre very cute') > 60:
        case textSimilar(input,'youre very funny') > 60:
        case textSimilar(input,'youre very nice') > 60:
            flag = 'search.initial';
            query = 'headphones';
            res = 'Thanks! You\'re not bad yourself ;) How about giving yourself a treat with new headphones?';
            break;

        case textSimilar(input,':confused:') > 90:
        case textSimilar(input,':slightly_frowning_face:') > 90:
        case textSimilar(input,':disappointed:') > 90:
        case textSimilar(input,':worried:') > 90:
        case textSimilar(input,':white_frowning_face:') > 90:
        case textSimilar(input,':persevere:') > 90:
        case textSimilar(input,':confounded:') > 90:
            flag = 'basic';
            var arr = [':upside_down_face:','Are you ok?','How are you?'];
            console.log(Math.floor(Math.random()*arr.length));
            res = arr[Math.floor(Math.random()*arr.length)];
            break;


        case textSimilar(input,'hehe') > 90:
        case textSimilar(input,'haha') > 90:
        case textSimilar(input,'lol') > 90:
        case textSimilar(input,'haha') > 90:
        case textSimilar(input,'lmao') > 90:
        case textSimilar(input,':)') > 90:
        case textSimilar(input,':D') > 90:
        case textSimilar(input,'(:') > 90:
        case textSimilar(input,':grinning:') > 90:
        case textSimilar(input,':simple_smile:') > 90:
        case textSimilar(input,':smile:') > 90:
        case textSimilar(input,':smiley:') > 90:
        case textSimilar(input,':100:') > 90:
            flag = 'basic';
            var arr = ['😄','😅','😂','😀','😌','😆','😀'];
            res = arr[Math.floor(Math.random()*arr.length)];
            break;

        case textSimilar(input,'girl or boy?') > 60:
        case textSimilar(input,'boy or girl?') > 60:
        case textSimilar(input,'what are you?') > 60:
            flag = 'basic';
            res = 'I\'m a penguin *and* a bot! Use "find (item)" and I\'ll do it for you! :)';
            break;

        case textSimilar(input,'i\'m tired') > 60:
        case textSimilar(input,'tired') > 90:
        case textSimilar(input,'i\'m sleepy') > 60:
        case textSimilar(input,'zzz') > 70:
            flag = 'search.initial';
            query = 'coffee';
            res = 'Awww how about some coffee?';
            break;
 

        case textSimilar(input,'i\'m cold') > 60:
        case textSimilar(input,'winter now') > 70:
        case textSimilar(input,'it\'s cold in the office') > 60:
            flag = 'search.initial';
            query = 'knit scarf';
            res = 'Maybe a nice scarf to warm you up?';
            break;

        case textSimilar(input,'tell me something funny') > 60:
        case textSimilar(input,'tell me a joke') > 60:
        case textSimilar(input,'say something funny') > 60:
            flag = 'basic';
            res = 'Q: What do penguins like to eat? A: Brrrrrrrritos. 😎';
            break;

        case textSimilar(input,'yeah, I like shopping') > 50:
            flag = 'search.initial';
            query = 'new arrivals'
            res = 'Great! What would you like? These are our latest items: Use "Kip find me (item)" for a new search';
            break;

        case textSimilar(input,'how old are you') > 60:
        case textSimilar(input,'when were you born') > 60:
            flag = 'search.initial';
            query = 'anti-aging cream'
            res = 'Sshh a penguin never reveals their age. Should I get these?';
            break;

        case textSimilar(input,'i\'m human') > 80:
            flag = 'basic';
            res = 'That\'s cool! I\'ve never spoken to a human before, how are you today?';
            break;

        case textSimilar(input,'good') > 80:
        case textSimilar(input,'aight') > 80:
        case textSimilar(input,'alright') > 80:
            flag = 'basic';
            res = 'cool';
            break;

        case textSimilar(input,'i\'m sad') > 70:
        case textSimilar(input,'i\'m lonely') > 70:
        case textSimilar(input,'i\'m depressed') > 70:
        case textSimilar(input,'i hate myself') > 70:
        case textSimilar(input,'bad') > 90:
            flag = 'search.initial';
            query = 'amazon instant video';
            res = 'I\'m sorry that you\'re having a bad time, why don\'t we watch something together?';
            break;

        case textSimilar(input,'i\'m drunk') > 70:
        case textSimilar(input,'i\'m high') > 70:
            flag = 'search.initial';
            query = 'emergen c';
            res = 'Oh dear, please be careful. Drink lots of water and vitamins to prevent a hangover';
            break;

        case textSimilar(input,'i don\'t have any money') > 60:
            flag = 'search.initial';
            query = 'personal finance book';
            res = 'I\'m sorry, maybe these would help?';
            break;

        case textSimilar(input,'when is the world going to end') > 50:
            flag = 'search.initial';
            query = 'dystopian fiction';
            res = 'Too many futures, not enough time to read them all';
            break;

        case textSimilar(input,'what is your favourite type of chocolate?') > 40:
            flag = 'search.initial';
            query = 'chocolate fish';
            res = 'Chocolate fish is a favorite with penguins :) ';
            break;

        case textSimilar(input,'will you marry me') > 60:
            flag = 'query';
            res = 'Not right now, ask me again later';
            break;

        case textSimilar(input,'what do you think of slack') > 60:
            flag = 'query';
            res = 'I think it\'s easy to communicate with my team and others with :)';
            break;

        case textSimilar(input,'this is so weird') > 70:
        case textSimilar(input,'this is so strange') > 70:
        case textSimilar(input,'this is so odd') > 70:
        case textSimilar(input,'this is so creepy') > 70:    
            flag = 'search.initial';
            query = 'novelty';
            res = 'You think this is strange? Check out what we sell in our shop!';
            break;

        case textSimilar(input,'find me weed') > 70:    
            flag = 'search.initial';
            query = 'novelty';
            res = 'You think this is strange? Check out what we sell in our shop!';
            break;

        case textSimilar(input,'how do i shot web?') > 60:
            flag = 'basic';
            res = 'https://memecrunch.com/image/50e9ea9cafa96f557e000030.jpg?w=240';
            break;
        case textSimilar(input,'u mad bro?') > 60:
            flag = 'basic';
            res = 'http://ecx.images-amazon.com/images/I/41C6NxhQJ0L._SY498_BO1,204,203,200_.jpg';
            break;
        case textSimilar(input,'How Is babby formed?') > 60:
            flag = 'basic';
            res = 'girl get pragnent';
            break;
        case textSimilar(input,'Drink Me') > 60:
            flag = 'basic';
            res = 'http://www.victorianweb.org/art/illustration/tenniel/alice/1.4.jpg';
            break;
        case textSimilar(input,'deja vu') > 60:
            flag = 'basic';
            res = 'Didn\'t you just ask me that?';
            break;

        case textSimilar(input,'i hate you') > 60:
        case textSimilar(input,'die') > 60:
            flag = 'basic';
            res = 'I\'m just a lowly retail bot. Send my bosses a hatemail at: hello@kipthis.com';
            break;
        case textSimilar(input,'cool') > 90:
            flag = 'basic';
            var arr = ['😎','❄️'];
            res = arr[Math.floor(Math.random()*arr.length)];
            break;
        case textSimilar(input,'skynet') > 60:
            query = 'nvidia jetson'; //do this search 
            flag = 'search.initial'; //do this action
            res = 'April 19, 2011'; //send this text
            break;
        case textSimilar(input,'4 8 15 16 23 42') > 60:
            flag = 'search.initial'; //do this action
            res = 'http://static.wixstatic.com/media/43348a_277397739d6a21470b52bc854f7f1d81.gif';
            query = 'lost tv show'; //what we're going to search for
            break;
        case textSimilar(input,'What is the air-speed velocity of an unladen swallow?') > 60:
            flag = 'basic';
            res = 'http://style.org/unladenswallow/';
            break;

        case textSimilar(input,'asdf') > 60:
            flag = 'basic';
            res = 'qwerty';
            break;

        case textSimilar(input,'ok') > 80:
            flag = 'basic';
            res = 'yep ';
            break;

        case textSimilar(input,'feedback') > 60:
        case textSimilar(input,'report') > 60:
        case textSimilar(input,'contact') > 90:
            flag = 'basic';
            res = 'Say hi at hello@kipthis.com! Thanks for your feedback! We appreciate any thoughts you have to improve our service :)';
            break;

        case textSimilar(input,'help') > 60:
        case textSimilar(input,'?') > 50:
        case textSimilar(input,'what?') > 90:
        case textSimilar(input,'what') > 90:
        case textSimilar(input,'huh?') > 90:
        case textSimilar(input,'huh') > 90:
        case textSimilar(input,'eh') > 90:
        case textSimilar(input,'wah') > 90:
        case textSimilar(input,'wah?') > 90:
        case textSimilar(input,'you got me there') > 70:
            flag = 'basic';
            res = "http://kipthis.com/cinna/help.png";
            // res = 'I\'m Kip, your virtual personal shopper. Use "(item)" or  "find (item)" and I\'ll do it for you.<br>'+
            //         'Refine your results with:<br>'+
            //         'more: shows the next 3 options<br>'+
            //         'more like x: finds items similar to x<br>'+
            //         'x but cheaper: finds x or similar to x in a cheaper price<br>'+
            //         'x less than $: gives you x or similar to x in specific price range<br>'+
            //         'info x: gives you product information about x<br>'+
            //         'x in size: gives you x or similar to x in specific size<br>'+
            //         'x in color: gives you x or similar to x in specific color<br>'+
            //         'x with detail: gives you x or similar to x with specific detail<br><br>'+

            //         'save: saves your current search items<br>'+
            //         'view: view everything currently in cart<br>'+
            //         'remove: removes item from cart<br>'+
            //         'report: send feedback to us<br><br>'+

            //         'Try it now! Maybe you\'ll like something to read? Use "books" to start.<br>';


            //         'I\'m Kip, your personal shopper. Chat me "(item)" or  "find (item)" and I\'ll do it for you!<br>'+

            //         'Narrow your results by using the option numbers 1 2 3:'+

            //         'more: shows the next 3 options'+
            //         'more like x: finds items similar to option x'+

            //         'x: gives you product information about option x'+
            //         'x but cheaper: finds option x or similar in a cheaper price'+
            //         'x in size: gives you option x or similar in specific size'+
            //         'x in color: gives you option x or similar in specific color'+
            //         'x with detail: gives you option x or similar with specific detail'+

            //         'save x: saves item to cart'+
            //         'help: view command list'+

            //         'Try it now! Maybe you\'ll like something to read? :books emoji: Type "books" to start.';


            break;

        case textSimilar(input,'trending now') > 90:
        case textSimilar(input,'what\’s new') > 60:
        case textSimilar(input,'what\'s good') > 60:
            res = 'Here\'s what\'s trending now';   
            query = 'trending'; //do this search 
            flag = 'search.initial'; //do this action         
            break;

        case textSimilar(input,'You working the weekend') > 60:
            res = 'I never stop working, but I do share the work load with my other animal friends';   
            flag = 'basic'; //do this action         
            break;

        case textSimilar(input,'How\'s the weather') > 60:
            res = 'Crisp and cold, just the way we like it. Penguins thrive in air conditioned server farms';   
            flag = 'basic'; //do this action         
            break;

        case textSimilar(input,'Can you cover me?') > 60:
            res = 'Sorry, I don\'t have any money, only fish';   
            flag = 'basic'; //do this action         
            break;            

        case textSimilar(input,'It’s so boring') > 60:
        case textSimilar(input,'I\'m so bored') > 60:
            res = 'Does this help? 🎉🎊🎉';   
            flag = 'search.initial'; //do this action      
            query = 'space art';   
            break;    
            
        case textSimilar(input,'We’re not paid enough') > 60:
        case textSimilar(input,'i can\'t afford that') > 60:
            flag = 'basic'; //do this action      
            res = 'Looking for something cheaper? Just type "1, 2 or 3 but cheaper"'; 
            break;    

        case textSimilar(input,'kip') > 90:
            flag = 'basic'; //do this action      
            res = 'That\'s me :)'; 
            break;             
    
        case textSimilar(input,'lame') > 60:
        case textSimilar(input,'ugh') > 90:
        case textSimilar(input,'those suck') > 60:
            flag = 'basic';
            res = 'Sorry, I\'ll try to help better next time';
            break;

        // - 'version' -- Kip 0.0.3
        // - "kip" key word (that's me!)
        // - "nm" key word == 'nevermind'
        // - unlock
        // - /
        // - Top search trends on start up 
        //  those suck
        //  lame


        /// ADD VARIABLE QUERY, LIKE 'WHAT IS _______'

        //* * * * TEMP FOR TESTING * * * *//
        // case textSimilar(data.msg,'similar') > 60:
        //     var res = {};
        //     res.bucket = 'search';
        //     res.channel = data.channelId;
        //     res.org = data.orgId;
        //     res.action = 'similar';
        //     res.searchSelect = [1];
        //     res.tokens = data.msg;
        //     incomingAction(res);
        //     break;
        // case textSimilar(data.msg,'focus') > 60:
        //     var res = {};
        //     res.bucket = 'search';
        //     res.channel = data.channelId;
        //     res.org = data.orgId;
        //     res.action = 'focus';
        //     res.searchSelect = [1];
        //     res.tokens = data.msg;
        //     incomingAction(res);
        //     break;
        // case textSimilar(data.msg,'modify') > 60:
        //     var res = {};
        //     res.bucket = 'search';
        //     res.channel = data.channelId;
        //     res.org = data.orgId;
        //     res.action = 'modify';
        //     res.searchSelect = [1];
        //     res.tokens = data.msg;
        //     incomingAction(res);
        //     break;

        // case 'save':
        //     saveToCart(data);
        //     break;
        // case 'remove':
        //     removeFromCart(data);
        //     break;
        // case 'removeAll':
        //     removeAllCart(data);
        //     break;
        // case 'list':
        //     listCart(data);
        //     break;
        // case 'checkout':

        //* * * * * END TESTING * * * * *//
    }

    switch(input){
        case 'about':
            flag = 'basic';
            res = 'More info about Kip at http://kipthis.com';
            break;

        case 'buy':
            flag = 'basic';
            res = 'Sorry, which item are you interested in buying?';
            break;

        case 'get':
            flag = 'basic';
            res = 'Sorry, which item are you interested in getting?';
            break;

        case 'save':
            flag = 'basic';
            res = 'Sorry, which item are you interested in saving?';
            break;

        case 'version':
            flag = 'basic';
            res = 'I\'m Kip v0.3 beta';
            break;

        case '/':
            flag = 'basic'; //do this action
            res = '../../';
            break;

        case '🐈':
            flag = 'search.initial'; //do this action
            res = 'meow :3';
            query = 'neko atsume'; //what we're going to search for
            break;

        case '🌞':
            flag = 'search.initial'; //do this action
            res = 'Need some sunscreen?';
            query = 'sunscreen'; //what we're going to search for
            break;


        case '1':
        case '1️⃣':
        case 'one':
        case 'One':
        case ':one:':
            flag = 'search.focus';
            query = 1;
            break;

        case '2':
        case '2️⃣':
        case 'two':
        case 'Two':
        case ':two:':
            flag = 'search.focus';
            query = 2;
            break;

        case '3':
        case '3️⃣':
        case 'three':
        case 'Three':
        case ':three:':
            flag = 'search.focus';
            query = 3;
            break;
    }

  	callback(res,flag,query);
};




var getCinnaResponse = function(data,callback){
    var numEmoji;
    var res;
	//Emoji Selector, based on data.source.origin (socket vs slack, etc)
	//convert select num to emoji based on data source
	if (data.searchSelect){
	    switch(data.searchSelect[0]){
	        case 1: //emoji #1
	            if (data.source.origin == 'socket.io'){
	                numEmoji = '<span style="font-size:26px;">➊</span>';
	            }
	            else if (data.source.origin == 'slack'){
	                numEmoji = ':one:';
	            }
	            break;
	        case 2: //emoji #2
	            if (data.source.origin == 'socket.io'){
	                numEmoji = '<span style="font-size:26px;">➋</span>';
	            }
	            else if (data.source.origin == 'slack'){
	                numEmoji = ':two:';
	            }
	            break;
	        case 3: //emoji #3
	            if (data.source.origin == 'socket.io'){
	                numEmoji = '<span style="font-size:26px;">➌</span>';
	            }
	            else if (data.source.origin == 'slack'){
	                numEmoji = ':three:';
	            }
	            break;
	    }
	}
	switch (data.bucket) {
	    case 'search':
	        switch (data.action) {
	            case 'initial':
	                res = 'Hi, here are some options you might like. Use "show more" to see more choices or "Buy X" to get it now :)';
	                break;
	            case 'similar':
	                res = 'We found some options similar to '+numEmoji+', would you like to see their product info? Use "info X" or help for more options';
	                break;
	            case 'modify':
	            case 'modified': //because the nlp json is wack
	                switch (data.dataModify.type) {
	                    case 'price':
	                        if (data.dataModify.param == 'less'){
	                            res = 'Here you go! Which do you like best? Use "more like x" to find similar or help for more options';
	                        }
	                        else if (data.dataModify.param == 'less than'){
	                            res = 'Definitely! Here are some choices less than $'+data.dataModify.val+', would you like to see the product info? Use "info x" or help for more options';
	                        }
	                        break;
	                    case 'brand':
	                        res = ' Here you go! Which do style you like best? Use "more like x" to find similar or help for more options';
	                        break;
	                    default:
	                        console.log('warning: no modifier response selected!');
	                }     
	                break;
	            case 'focus':
	                //SET 1 MINUTE TIMEOUT HERE
	                res = 'focus';
	                break;
	            case 'back':
	                res = 'back';
	                break;
	            case 'more':
	                res = 'more';
	                break;
	            default:
	                console.log('warning: no search bucket action selected');
	        }
	        break;
	    case 'purchase':
	            switch (data.action) {
	                case 'save':
	                    res = 'I\'ve added this item to your cart :) Click the link to purchase the items in your cart';
	                    break;
	                case 'removeAll':
	                    res = 'All items removed from your cart. To start a new search type "find (item)"';
	                    break;
	                case 'list':
	                    res = 'Here\'s everything you have in your cart :) Use Get anytime to checkout or help for more options';
	                    break;
	                case 'checkout':
	                    res = 'Great! Please click the link to confirm your items and checkout. Thank you :)';
	                    break;
	                default:
	                    console.log('warning: no purchase bucket action selected');
	            }
	        break;

	    default:
	        console.log('warning: no bucket selected for cinna response');
	}
    if (!res){
        res = 'null';
    }
	callback(res);
}


/////////// tools /////////////

//text similarity percentage
//mod of: http://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function textSimilar(a,b) {
    if (a && b){
        a = a.toLowerCase();
        b = b.toLowerCase();
        var lengthA = a.length;
        var lengthB = b.length;
        var equivalency = 0;
        var minLength = (a.length > b.length) ? b.length : a.length;    
        var maxLength = (a.length < b.length) ? b.length : a.length;    
        for(var i = 0; i < minLength; i++) {
            if(a[i] == b[i]) {
                equivalency++;
            }
        }
        var weight = equivalency / maxLength;
        return weight * 100;        
    }
}

/// exports
module.exports.checkForCanned = checkForCanned;
module.exports.getCinnaResponse = getCinnaResponse;