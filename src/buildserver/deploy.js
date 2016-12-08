var co = require('co')
var exec = require('child_process').execSync
function deploy(commit) {
  return co(function * () {
    logging.info('building commit ' + commit.green)
    var filename = './' + process.env.NODE_ENV
    var stdout = exec(filename)
    logging.info(stdout.toString())
  })
}

module.exports = deploy

if (!module.parent) {
  var commit = process.argv[2]
  if (!commit) {
    commit = 'HEAD'
    // console.log('error, no commit supplied.\n\nusage:\n  node deploy.js HEAD\n  node deploy.js a6c25e5\n  node deploy.js a6c25e55c19432a06f498ddf651952ae9bcb2775')
    // process.exit(1)
  }
  require('../kip')
  deploy(commit).then(() => {
    console.log('success'.rainbow)
    process.exit(0)
  }).catch((e) => {
    console.error('error'.red)
    console.error(e)
    process.exit(1)
  })
}
