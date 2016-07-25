var db = require('db');

function next() {
	db.Landmarks.findOne({world: false, owner: {$exists: false}}, function(e, l) {
		if (e) { console.error(e); process.exit(1) }
		if (!l) {
			console.log("finished with landmarks");
			return updateActivities();
		}
		
		console.log('processing landmark', l._id.toString())
		
		db.Users.findOne({profileID: l.parent.id}, function(e, o) {
			if (e) { console.error(e); }
			if (o) {
				l.owner = {
					mongoId: o._id.toString(),
					profileID: o.profileID,
					name: o.name
				}
				l.save(function() {
					next()
				});
			} else {
				var u = new db.User({
					profileID: l.parent.id,
					name: l.parent.name,
				})
				u.save(function(e, o) {
					l.owner = {
						mongoId: o._id.toString(),
						profileID: o.profileID,
						name: o.name
					}
					l.save(function() {
						next()
					})
				})
			}
		})
	});
}

next();

function updateActivities() {
	db.Activities.findOne({'data.item.mongoId': {$exists: true}, 'data.owner.mongoId': {$exists: false}}, function(e, a) {
		if (e) { console.error(e); process.exit(1); }
		if (!a) {
			console.log('finished');
			process.exit(0);
		}
		console.log("updating activity", a._id.toString());
		db.Landmarks.findById(a.data.item.mongoId, function(e, l) {
			a.data.owner = l.owner;
			a.markModified('data');
			a.save(function(e, a) {
				if (e) { console.log(e)}
				updateActivities();
			})
		})
	})
}
