var mongoose = require('mongoose');
var Dog = mongoose.model('dog', mongoose.Schema({
  name: String,
  favoriteBodyPartToChew: String
}));

mongoose.connect('mongodb://localhost:27017/test', function(err) {
    if (err) {
      console.error(err);
    }
    console.log('connected');
});

var count = 0;
while (count < 1) {
  count++;
  var dog = new Dog({
    name: process.env.DOG_NAME,
    favoriteBodyPartToChew: 'ankles'
  });

  console.log(dog._id);

  if (count%1000 == 0) {
    console.log(process.env.DOG_NAME, count);
  }
}
