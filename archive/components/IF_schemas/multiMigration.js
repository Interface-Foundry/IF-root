// run this directly in mongo with
// mongo <host>/foundry --eval "`cat multiMigration.js`"
db.landmarks.find({world: false}).forEach(function(w) {
    w.parents = [w.parent.mongoId];
    w.loc = {type: 'MultiPoint', coordinates: [w.loc.coordinates]};
    db.landmarks.save(w);
})
