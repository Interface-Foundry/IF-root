var co = require('co')
var path = require('path')
var child_process = require('child_process')
require('kip')

var repo_root = process.env.NODE_ENV === 'development' ? '/data/kip/IF-root/src' : '/home/kip/IF-root/src'

//
// Tools
//

// run scripts in the repo root directory
var _exec = require('promised-exec')
var exec = function (text) {
  kip.debug(text.gray)
  return _exec(`cd ${repo_root} && ${text}`)
}

// run scripts in the repo root but stream the output
var exec_with_stream = function(text) {
  throw new Error('not implemented')
}

// run scripts in the repo root and discard the output
var exec_no_output = function(text) {
  kip.debug(text.gray)
  return new Promise((resolve, reject) => {
    var p = child_process.spawn('sh', ['-c', text], {
      stdio: 'ignore'
    });

    p.on('close', (code) => {
      if (code === 0)
        resolve()
      else
        reject(`command "${text}" exited with non-zero exit code ${code}`)
    });
  });
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
// Gets the commit hashes for the version running for each deployment
//
function get_deployed_commits () {
  kip.debug('getting deployments')
  var deployment_names = ['replylogic', 'facebook', 'skype', 'web', 'nlp', 'picstitch']
  return deployment_names.map(d => {
    return co(function * () {
      var json = yield exec(`kubectl get deployment ${d} -o json`)
      return {
        service: d,
        commit: JSON.parse(json).spec.template.spec.containers[0].image.match(/:[^\ ]+"/g)[0]
      }
    })
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
    yield db.Metrics.log('deploy', {
      service: s,
      commit: commit
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
      return exec_no_output(build_cmd);
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
  co(function * () {
    return build_latest(['web'])
  }).catch(e => {
    console.log('error')
    console.log(JSON.stringify(e, null, 2))
  })
  
  // deploy_latest(['web']).catch(e => {
  //   console.log('error')
  //   console.log(JSON.stringify(e, null, 2))
  // })
  // co(function * () {
  //   // var commits = yield get_commits()
  //   // console.log(commits)
  // }).catch(e => {
  //   console.log(JSON.stringify(e, null, 2))})
}

module.exports = {
  get_commits: get_commits,
  get_deployed_commits: get_deployed_commits,
  deploy_latest: deploy_latest,
  deploy_commit: deploy_commit
}
