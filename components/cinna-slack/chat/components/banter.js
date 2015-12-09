
var checkForCanned = function(input,callback) {
   
	var res;

    //pre-sort canned banter
    switch (true) {
        //basic weight system for percentage similarity for string matching
        case textSimilar(input,'hi') > 60:
        case textSimilar(input,'hello') > 60:
            res = 'Hello!';
            break;
        case textSimilar(input,'sup') > 60:
            res = 'nm, u?';
            break;
        case textSimilar(input,'are you a bot') > 60:
            res = 'yep, are you human?';
            break;
        // case 'what\'s the meaning of life?':
        //     data.msg = 'life, the multiverse and whatever';
        //     outgoingResponse(data,'txt');
        //     break;
        // case 'how do i shot web?':
        //     data.msg = 'https://memecrunch.com/image/50e9ea9cafa96f557e000030.jpg?w=240';
        //     outgoingResponse(data,'image');
        //     break;
        // case 'u mad bro?':
        //     data.msg = 'http://ecx.images-amazon.com/images/I/41C6NxhQJ0L._SY498_BO1,204,203,200_.jpg';
        //     outgoingResponse(data,'image');
        //     break;
        // case 'How Is babby formed?':
        //     data.msg = 'girl get pragnent';
        //     outgoingResponse(data,'txt');
        //     break;
        // case 'Drink Me':
        //     data.msg = 'http://www.victorianweb.org/art/illustration/tenniel/alice/1.4.jpg';
        //     outgoingResponse(data,'image');
        //     break;
        // case 'deja vu':
        //     data.msg = 'Didn\'t you just ask me that?';
        //     outgoingResponse(data,'txt');
        //     break;
        // case 'die':
        //     data.msg = '😭';
        //     outgoingResponse(data,'txt');
        //     break;
        // case 'cool':
        //     data.msg = '😎';
        //     outgoingResponse(data,'txt');
        //     break;
        // case 'skynet':
        //     data.msg = 'April 19, 2011';
        //     outgoingResponse(data,'txt');
        //     break;
        // case '4 8 15 16 23 42':
        //     data.msg = 'http://static.wixstatic.com/media/43348a_277397739d6a21470b52bc854f7f1d81.gif';
        //     outgoingResponse(data,'image');
        //     break;
        // case 'What is the air-speed velocity of an unladen swallow?':
        //     data.msg = 'http://style.org/unladenswallow/';
        //     outgoingResponse(data,'txt');
        //     break;

        // case 'help':
        //     data.msg = 'type things like VVVVXBXVXVX and BBBXBXCBC to search';
        //     outgoingResponse(data,'txt');
        //     break;

        // case '1':
        //     data.msg = 'this will recall history and select focus on N item';
        //     outgoingResponse(data,'txt');
        //     break;

        // case '2':
        //     data.msg = 'this will recall history and select focus on N item';
        //     outgoingResponse(data,'txt');
        //     break;

        // case '3':
        //     data.msg = 'this will recall history and select focus on N item';
        //     outgoingResponse(data,'txt');
        //     break;


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
        // case textSimilar(data.msg,'save') > 60:
        //     var res = {};
        //     res.bucket = 'purchase';
        //     res.channel = data.channelId;
        //     res.org = data.orgId;
        //     res.action = 'save';
        //     res.searchSelect = [1];
        //     res.tokens = data.msg;
        //     incomingAction(res);
        //     break;

        // case textSimilar(data.msg,'checkout') > 60:
        //     var res = {};
        //     res.bucket = 'purchase';
        //     res.channel = data.channelId;
        //     res.org = data.orgId;
        //     res.action = 'checkout';
        //     //res.searchSelect = [1];
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

  	callback(res);
};


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
