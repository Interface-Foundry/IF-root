var co = require('co')
var path = require('path')
require('kip')

var repo_root = process.env.NODE_ENV === 'development' ? '/data/kip/IF-root/src' : '/git/IF-root/src'

//
// Tools
//

// run scripts in the repo root directory
var _exec = require('promised-exec')
var exec = function (text) {
  kip.debug(text.gray)
  return _exec(`cd ${repo_root} && ${text}`)
}

// gets the last 200 commits
// returns {commit: "68d7fb7", author: "Peter Brandt", date: 1469818960}
function get_commits () {
  kip.debug('getting list of commits')
  return co(function * () {
    yield exec('git reset --hard HEAD && git pull origin master')
    return exec('git log --pretty=format:\'{commit: "%h", author: "%an", date: %at}\' -200')
  })
}

//
// Deploying code
//
function deploy_latest (services) {
  kip.debug('deploying latest for services', services.join(', ').yellow)
  return co(function * () {
    yield exec('git reset --hard HEAD && git pull origin master')
    var commit = yield exec("git log --pretty=format:'%h' -n 1")
    return deploy_commit(services, commit)
  })
}

function deploy_commit (services, commit) {
  kip.debug('deploying commit', commit.red, 'for services', services.join(', ').yellow)
  return co(function * () {
    yield build_commit(services, commit)
    kip.debug('built successfully')
    yield services.map(s => {
      return exec(`kubectl rolling-update ${s} --image=gcr.io/kip-styles/${s}:${commit}`)
    })
  })
}

//
// Building containers
//
function build_latest (services) {
  kip.debug('building latest for services', services.join(', ').yellow)
  // get the tag for the latest commit and then pass to build_commit
  return build_commit(services, 'HEAD')
}

function build_commit (services, commit) {
  kip.debug('building commit', commit.red, 'for services', services.join(', ').yellow)
  return co(function * () {
    // always rebuild because yeah it's just easier that way
    yield exec(`git fetch origin master && git reset --hard ${commit}`)
    yield services.map(s => {
      var build_cmd = `docker build -t gcr.io/kip-styles/${s}:${commit} -f Dockerfiles/${s}.Dockerfile . && gcloud docker push gcr.io/kip-styles/${s}:${commit}`; 
      kip.debug('running', build_cmd)
      return exec(build_cmd);
    })
  })
}

// these shell scripts will be run to build each service. $VERSION will replaced with the commit hash
var build_templates = {
  'replylogic': 'docker build -t gcr.io/kip-styles/reply_logic:$VERSION -f Dockerfiles/reply_logic.Dockerfile . && gcloud docker push gcr.io/kip-styles/reply_logic:$VERSION',
  'facebook': 'docker build -t gcr.io/kip-styles/facebook:$VERSION -f Dockerfiles/facebook.Dockerfile . && gcloud docker push gcr.io/kip-styles/facebook:$VERSION',
  'web': '',
  'skype': '',
  'picstitch': '',
  'nlp': ''
}

if (!module.parent) {
  deploy_latest(['web']).catch(e => {
    console.log('error')
    console.log(JSON.stringify(e, null, 2))
  })
  // co(function * () {
  //   // var commits = yield get_commits()
  //   // console.log(commits)
  // }).catch(e => {
  //   console.log(JSON.stringify(e, null, 2))})
}

module.exports = {
  get_commits: get_commits,
  deploy_latest: deploy_latest,
  deploy_commit: deploy_commit
}
