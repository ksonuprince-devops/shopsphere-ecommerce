
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

	
        stage('Deploy') {
            steps {
                echo 'Deploying the verified ShopSphere image'

                sh '''
                    # Remove only the previous ShopSphere container
                    docker rm -f shopsphere-api 2>/dev/null || true

                    # Deploy the image built by this Jenkins run
                    docker run -d \
                      --name shopsphere-api \
                      --restart unless-stopped \
                      -p 3001:3001 \
                      shopsphere-api:${BUILD_NUMBER}

                    # Verify the application inside the container
                    docker exec shopsphere-api node -e '
                      fetch("http://127.0.0.1:3001/health")
                        .then(async r => {
                          const data = await r.json();
                          console.log("Health response:", data);
                          if (!r.ok || data.status !== "UP") process.exit(1);
                        })
                        .catch(err => {
                          console.error(err);
                          process.exit(1);
                        });
                    '
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
