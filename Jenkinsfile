
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
        echo 'Copying source into the test container and running API tests'

        sh '''
            tar -C "$WORKSPACE/backend" -cf - . | \
            docker run --rm -i \
              --entrypoint sh \
              node:22-alpine \
              -c '
                set -e
                mkdir -p /tmp/app
                tar -xf - -C /tmp/app
                cd /tmp/app

                echo "=== Verify package files ==="
                ls -l package.json package-lock.json

                echo "=== Install dependencies ==="
                npm ci

                echo "=== Run API tests ==="
                npm test
              '
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
