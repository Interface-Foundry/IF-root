var differenceInDays = require('date-fns/difference_in_calendar_days')

module.exports = function check_asin(rows, items, mintitems, view) {
	    var entries = JSON.parse(rows);
	    var results = [];
	    if(view == 'Store'){
	    	entries.map((row) => {
                var matches = items.filter(function(i){return i.ASIN == row.ASIN});
                for(var i = 0; i<row.Qty ; i++){
                	var closestMatch = 0;
                	var closestDistance;
                	if(matches[0] && matches[0].added_date){
                		closestDistance = Math.abs(differenceInDays(row.Date, matches[0].added_date))
                	} else {
                        closestDistance = 1000;
                	}
                	
                	for (var j = 0; j<matches.length;j++){
                		if(matches[j] && matches[j].added_date){
                			if(Math.abs(differenceInDays(row.Date, matches[j].added_date)<closestDistance)){
		                      	closestDistance = Math.abs(differenceInDays(row.Date, matches[j].added_date))
		                      	closestMatch = j;
		                    }
                		}
                	}
                  	if(matches[closestMatch]){
                  		results.push([matches[closestMatch],row]); // match refers to the entry from kip,row refers to amazon's csv entry
                      	matches.splice(closestMatch,1);
                  	}
                }
        	});
        	return results;
	    } else if (this.state.view == 'Cafe'){
	    	entries.map((row) => {
                var matches = mintitems.filter(function(i){return i.asin == row.ASIN});
                for(var i = 0; i<row.Qty ; i++){
                	var closestMatch = 0;
                	var closestDistance;
                	if(matches[0] && matches[0].createdAt){
                		closestDistance = Math.abs(differenceInDays(row.Date, matches[0].createdAt))
                	} else {
                        closestDistance = 1000;
                	}
                	
                	for (var j = 0; j<matches.length;j++){
                		if(matches[j] && matches[j].createdAt){
                			if(Math.abs(differenceInDays(row.Date, matches[j].createdAt)<closestDistance)){
		                      	closestDistance = Math.abs(differenceInDays(row.Date, matches[j].createdAt))
		                      	closestMatch = j;
		                    }
                		}
                	}
                  	if(matches[closestMatch]){
                  		results.push([matches[closestMatch],row]); // match refers to the entry from kip,row refers to amazon's csv entry
                      	matches.splice(closestMatch,1);
                  	}
                }
        	});
        	return results;
	    }
        
};
