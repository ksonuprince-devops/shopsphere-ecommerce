
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out ShopSphere from GitHub'
                checkout scm
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated API tests'

                sh '''
                    docker run --rm \
                      -v "$WORKSPACE/backend:/src:ro" \
                      -w /tmp/app \
                      node:22-alpine \
                      sh -c 'cp -R /src/. . && npm ci && npm test'
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building ShopSphere Docker image'

                sh '''
                    docker build \
                      -t shopsphere-api:${BUILD_NUMBER} \
                      -t shopsphere-api:latest \
                      backend
                '''
            }
        }

        stage('Verify Image') {
            steps {
                echo 'Verifying Express is installed in the image'

                sh '''
                    docker run --rm \
                      --entrypoint node \
                      shopsphere-api:${BUILD_NUMBER} \
                      -e "console.log(require.resolve('express'))"
                '''
            }
        }
    }

    post {
        success {
            echo 'ShopSphere CI pipeline completed successfully!'
        }

        failure {
            echo 'ShopSphere CI pipeline failed. Check the stage logs.'
        }
    }
}
