
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
    docker rm -f shopsphere-api 2>/dev/null || true

    docker run -d \
      --name shopsphere-api \
      --restart unless-stopped \
      -p 3001:3001 \
      shopsphere-api:${BUILD_NUMBER}

    echo "Waiting for ShopSphere API to become healthy..."

    for i in $(seq 1 15); do
        if docker exec shopsphere-api node -e '
            fetch("http://127.0.0.1:3001/health")
              .then(async r => {
                const data = await r.json();
                console.log("Health response:", data);
                if (!r.ok || data.status !== "UP") process.exit(1);
              })
              .catch(() => process.exit(1));
        '; then
            echo "ShopSphere deployment verified successfully!"
            exit 0
        fi

        if [ "$(docker inspect -f '{{.State.Running}}' shopsphere-api 2>/dev/null)" != "true" ]; then
            echo "ERROR: ShopSphere container stopped."
            docker logs shopsphere-api
            exit 1
        fi

        echo "Attempt $i/15: API not ready; waiting 2 seconds..."
        sleep 2
    done

    echo "ERROR: Health check timed out."
    docker logs shopsphere-api
    exit 1
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
