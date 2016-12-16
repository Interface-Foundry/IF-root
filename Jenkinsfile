node {
    def nodeHome = tool name: 'node7.2.1', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
    env.PATH = "${nodeHome}/bin:${env.PATH}"
    def GIT_REVISION = env.GIT_REVISION
    def slackToken = 'ar0E6BOSOqHZe8o1ZmynkBRf'

    try {
        stage('check environment') {
            sh('node -v')
            sh('npm -v')
        }

        stage('checkout') {
            checkout scm
            // sh('echo using git hash: ${GIT_REVISION}')
        }
        // stage('build docker images') {
        //     sh('docker build -t gcr.io/kip-styles/facebook:666 -f Dockerfiles/facebook.Dockerfile .')
        // }

        // stage('push to gcloud') {
        //     sh('gcloud auth activate-service-account --key-file=Dockerfiles/gcloud.json')
        //     sh('gcloud docker push gcr.io/kip-styles/facebook:666')
        // }

        stage('npm install') {
            sh('npm install')
            sh('npm install --only=dev')
            sh('npm install -g mocha')
        }

        stage('tests') {
            sh('NODE_ENV=test PRINT_DATA=true mocha --require should --reporter spec tests/parser/parser.test.js')
        }


        stage('slackInfo') {
           slackSend (channel: '#ci', color: 'good', message: 'hey we pushed a docker image', teamDomain: 'kipsearch', token: slackToken)
        }
    }

    catch (err) {
        throw err
    }
}