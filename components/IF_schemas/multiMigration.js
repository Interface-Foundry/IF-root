// run this directly in mongo with
// mongo <host>/foundry --eval "`cat multiMigration.js`"
db.landmarks.dropIndexes();
db.landmarks.find({world: false}).forEach(function(w) {
    w.parents = [w.parent.mongoId];
    delete w.parent;
    w.loc = {type: 'MultiPoint', coordinates: [w.loc.coordinates]};
    db.landmarks.save(w);
})
