require('shelljs/global');
const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const path = _.get(argv,'_');

if (!which('mosql')) {
	echo('mosql is not installed on this system.');
	return
} 

console.log('path is : ', path);

async function run(path) {
		async function yml(path) {
		  // Run external tool synchronously
			if (exec('mosql -c ' + path + ' --sql postgres://localhost:5432/postgres --mongo mongodb://localhost:27017/foundry --only-db foundry --reimport').code !== 0) {
			  echo('Error: mosql command failed');
			  exit(1);
			} else {
				console.log('finished migrating')
				return true
			}
		}
	 path.map( async p  => {
	 	  await yml(p);
	 })
} 

run(path);




