node {
    def nodeHome = tool name: 'node7.2.1', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
    env.PATH = "${nodeHome}/bin:${env.PATH}"

    try {
        stage('check environment') {
            sh('node -v')
            sh('npm -v')
        }

        stage('checkout') {
            checkout scm
        }

        stage('git info') {
            def env = build.getEnvironment()
            def gitCommit = env.GIT_COMMIT
            def shortGitCommit = gitCommit[0..6]
            sh('echo using git hash  ${shortGitCommit}')
        }

        stage('npm install') {
            sh('npm install')
            sh('npm install --only=dev')
            sh('npm install -g mocha')
        }

        stage('tests') {
            sh('NODE_ENV=test PRINT_DATA=true mocha --require should --reporter spec tests/parser/parser.test.js')
        }
    }

    catch (err) {
        throw err
    }
}