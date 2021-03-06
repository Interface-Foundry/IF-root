var http = require('http')
var os = require('os')
var path = require('path')
var exec = require('child_process').execSync
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/', secret: 'Hvjw1Oa2lA4GpJPu' })
var _ = require('lodash')
require('colors')

const branch = 'refs/heads/mint'
const channel = 'D1GGV0CMU'
const PORT = 7777
const server = 'mint-dev'
//var Professor = require('../monitoring/prof_oak').Professor
//var prof = new Professor(channel)


function deploy() {
  console.log('running deploy')
  return new Promise((resolve, reject) => {
    // doing this sync for now, maybe async later
    var stdout = exec('git fetch origin && git reset --hard origin/mint', {
      cwd: path.join(__dirname, '../../')
    })
    console.log(stdout.toString())

    stdout = exec('yarn', {
      cwd: __dirname
    })
    console.log(stdout.toString())

    stdout = exec('yarn build', {
      cwd: __dirname,
      env: _.merge(process.env, {
        NODE_PATH: './react'
      })
    })
    console.log(stdout.toString())

    stdout = exec('pm2 restart mint', {
      cwd: __dirname
    })
    console.log(stdout.toString())

    resolve()
  })
}

// function deploy() {
//   return new Promise((resolve, reject) => {
//     // doing this sync for now, maybe async later
//     var stdout = exec('git fetch origin && git reset --hard origin/mint', {
//       cwd: path.join(__dirname, '../../')
//     })
//     console.log(stdout.toString())
//     stdout = exec('yarn', {
//       cwd: __dirname
//     })
//     console.log(stdout.toString())
//     stdout = exec('yarn build', {
//       cwd: __dirname,
//       env: _.merge(process.env, {
//         NODE_PATH: './react'
//       })
//     })
//     console.log(stdout.toString())
//     stdout = exec('yarn', {
//       cwd: path.join(__dirname, 'kip-website')
//     })
//     console.log(stdout.toString())
//     resolve()
//   })
// }

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(PORT)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  if (event.payload.ref !== branch) {
    return
  } else {
    console.log(`Got a push to ${branch}, will deploy new code [${new Date()}]`)
  }

  var message = _.get(event, 'payload.head_commit.message', '[no commit message]')

  deploy('HEAD').then(() => {
    var successChat = `Deployed to ${server} - "${message}"`
    //prof.say(successChat)
  }).catch((e) => {
    var errorChat = `Error deploying to ${server}- "${message}"\n${e}`
    //prof.say(errorChat)
  })


})

console.log('listening for incoming git webhooks on lucky port number ' + PORT.toString().green)
