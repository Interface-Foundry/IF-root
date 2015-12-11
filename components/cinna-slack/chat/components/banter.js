
var checkForCanned = function(input,callback) {
   
	var res;
	var flag;
	var query;

    //pre-sort canned banter
    switch (true) {
        //basic weight system for percentage similarity for string matching
        case textSimilar(input,'hi') > 60:
        case textSimilar(input,'hello') > 60:
            flag = 'basic';
            res = 'Hello!';
            break;
        case textSimilar(input,'sup') > 60:
            flag = 'basic';
            res = 'nm, u?';
            break;
        case textSimilar(input,'are you a bot') > 60:
            flag = 'basic';
            res = 'yep, are you human?';
            break;
        case textSimilar(input,'what\'s the meaning of life?') > 60:
            flag = 'basic';
            res = 'life, the multiverse and whatever';
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
        case textSimilar(input,'die') > 60:
            flag = 'basic';
            res = '😭';
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

        case textSimilar(input,'help') > 60:
            flag = 'basic';
            res = 'type things like VVVVXBXVXVX and BBBXBXCBC to search';
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
	                numEmoji = '<span style="font-size:32px;">➊</span>';
	            }
	            else if (data.source.origin == 'slack'){
	                numEmoji = ':one:';
	            }
	            break;
	        case 2: //emoji #2
	            if (data.source.origin == 'socket.io'){
	                numEmoji = '<span style="font-size:32px;">➋</span>';
	            }
	            else if (data.source.origin == 'slack'){
	                numEmoji = ':two:';
	            }
	            break;
	        case 3: //emoji #3
	            if (data.source.origin == 'socket.io'){
	                numEmoji = '<span style="font-size:32px;">➌</span>';
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