
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
            flag = 'basic'; //do this action
            res =   'Looks like I didn\'t answer your question properly. I\'m not very smart yet, maybe this will help?<br>'+
                    'Refine your results with:<br>'+
                    'more: shows the next 3 options<br>'+
                    'more like x: finds items similar to x<br>'+
                    'x but cheaper: finds x or similar to x in a cheaper price<br>'+
                    'x less than $: gives you x or similar to x in specific price range<br>'+
                    'info x: gives you product information about x<br>'+
                    'x in size: gives you x or similar to x in specific size<br>'+
                    'x in color: gives you x or similar to x in specific color<br>'+
                    'x with detail: gives you x or similar to x with specific detail<br><br>'+

                    'save: saves your current search items<br>'+
                    'view: view everything currently in cart<br>'+
                    'remove: removes item from cart<br>'+
                    'report: send feedback to us<br><br>'+

                    'Try it now! Maybe you\'ll like something to read? Use "books" to start.';
            break;

        case textSimilar(input,'who are you') > 60:
            flag = 'basic';
            res = 'I\'m Kip! An AI powered personal shopper. I\'m 5" tall and very blue. I like shopping, do you?';
            break;

        case textSimilar(input,'youre very cute') > 60:
        case textSimilar(input,'youre very funny') > 60:
        case textSimilar(input,'youre very nice') > 60:
            flag = 'search.initial';
            query = 'headphones';
            res = 'Thanks! You\'re not bad yourself ;) How about giving yourself a treat with new headphones?';
            break;

        case textSimilar(input,'hehe') > 90:
        case textSimilar(input,'haha') > 90:
        case textSimilar(input,'lol') > 90:
        case textSimilar(input,'haha') > 90:
        case textSimilar(input,'lmao') > 90:
            flag = 'basic';
            res = ':D';
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
        case textSimilar(input,'cool') > 60:
            flag = 'basic';
            res = '😎';
            break;
        case textSimilar(input,'skynet') > 60:
            query = 'nvidia jetson';
            flag = 'search.initial'; //do this action
            res = 'April 19, 2011';
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

        case textSimilar(input,'help') > 60:
        case textSimilar(input,'?') > 70:
        case textSimilar(input,'what?') > 90:
        case textSimilar(input,'what') > 90:
        case textSimilar(input,'huh?') > 90:
        case textSimilar(input,'huh') > 90:
        case textSimilar(input,'eh') > 90:
        case textSimilar(input,'wah') > 90:
        case textSimilar(input,'wah?') > 90:
            flag = 'basic';
            res = 'I\'m Kip, your AI personal shopper. Use "(item)" or  "find (item)" and I\'ll do it for you.<br>'+
                    'Refine your results with:<br>'+
                    'more: shows the next 3 options<br>'+
                    'more like x: finds items similar to x<br>'+
                    'x but cheaper: finds x or similar to x in a cheaper price<br>'+
                    'x less than $: gives you x or similar to x in specific price range<br>'+
                    'info x: gives you product information about x<br>'+
                    'x in size: gives you x or similar to x in specific size<br>'+
                    'x in color: gives you x or similar to x in specific color<br>'+
                    'x with detail: gives you x or similar to x with specific detail<br><br>'+

                    'save: saves your current search items<br>'+
                    'view: view everything currently in cart<br>'+
                    'remove: removes item from cart<br>'+
                    'report: send feedback to us<br><br>'+

                    'Try it now! Maybe you\'ll like something to read? Use "books" to start.';
            break;



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
            console.log('SHOW ABOUT CINNA HERE. Link to kipthis.com');
            break;

        case '1':
            flag = 'search.focus';
            query = 1;
            break;

        case '2':
            flag = 'search.focus';
            query = 2;
            break;

        case '3':
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
	                    res = 'I\'ve added this item to your cart :) Use "Get" anytime to checkout or "help" for more options';
	                    break;
	                case 'removeAll':
	                    res = 'All items removed from your cart. To start a new search type "find (item)"';
	                    break;
	                case 'list':
	                    res = 'Here\'s everything you have in your cart :) Use Get anytime to checkout or help for more options';
	                    break;
	                case 'checkout':
	                    res = 'Great! Please click the link to confirm your items and checkout. {{link}} Thank you:)';
	                    break;
	                default:
	                    console.log('warning: no purchase bucket action selected');
	            }
	        break;

	    default:
	        console.log('warning: no bucket selected for cinna response');
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