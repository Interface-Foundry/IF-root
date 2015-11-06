simpleSearchApp.factory('storeFactory', function() {
    return {
        store: {},
        setStore: function(newStore) {
            this.store = newStore;
        }
    };
});
