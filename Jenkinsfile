pipeline {
    agent any

    stages {
        stage('npm install') {
            steps {sh "npm install"
                echo 'ess..'
            }
        }
        stage('run') { 
            steps{sh "ng serve &> /dev/null &"
                echo 'run..'
                }
        }
        stage('Test') {
            steps {script{
                withEnv(['BUILD_ID=dontkill']) {
                     sh "ng serve &"
                }
            }}
        }
       
        }
    }

