simpleSearchApp.service('searchQuery', function() {
        var searchParams = [];

        var addSearch = function(newObj) {
            searchParams = [];
            searchParams.push(newObj);
        };

        var getSearch = function() {
            return searchParams;
        };

        return {
            addSearch: addSearch,
            getSearch: getSearch
        };

    });