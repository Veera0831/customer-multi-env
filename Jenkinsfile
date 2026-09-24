pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {

        stage('Resolve Deployment Configuration') {
            steps {
                script {

                    if (params.ENVIRONMENT == 'DEV') {
                        env.GIT_BRANCH_NAME = 'develop'
                        env.APP_NAME = 'customer-app-dev'
                        env.APP_PORT = '8081'
                        env.NETWORK_NAME = 'customer-dev-net'
                        env.DB_NAME = 'customer-db-dev'

                    } else if (params.ENVIRONMENT == 'UAT') {
                        env.GIT_BRANCH_NAME = 'release'
                        env.APP_NAME = 'customer-app-uat'
                        env.APP_PORT = '8082'
                        env.NETWORK_NAME = 'customer-uat-net'
                        env.DB_NAME = 'customer-db-uat'

                    } else if (params.ENVIRONMENT == 'PRODUCTION') {
                        env.GIT_BRANCH_NAME = 'main'
                        env.APP_NAME = 'customer-app-prod'
                        env.APP_PORT = '8083'
                        env.NETWORK_NAME = 'customer-prod-net'
                        env.DB_NAME = 'customer-db-prod'

                        if (params.ACTION == 'DEPLOY' &&
                            params.CONFIRM_PROD != 'YES') {
                            error('Production deployment requires CONFIRM_PROD=YES')
                        }

                    } else {
                        error("Invalid ENVIRONMENT: ${params.ENVIRONMENT}")
                    }

                    if (!(params.ACTION in ['DEPLOY', 'ROLLBACK'])) {
                        error("Invalid ACTION: ${params.ACTION}")
                    }

                    if (!(params.RUN_TESTS in ['YES', 'NO'])) {
                        error("Invalid RUN_TESTS value: ${params.RUN_TESTS}")
                    }

                    if (!params.VERSION?.trim()) {
                        error('VERSION cannot be empty')
                    }

                    echo '========================================'
                    echo 'RESOLVED DEPLOYMENT CONFIGURATION'
                    echo '========================================'
                    echo "Environment : ${params.ENVIRONMENT}"
                    echo "Action      : ${params.ACTION}"
                    echo "Version     : ${params.VERSION}"
                    echo "Run Tests   : ${params.RUN_TESTS}"
                    echo "Git Branch  : ${env.GIT_BRANCH_NAME}"
                    echo "Application : ${env.APP_NAME}"
                    echo "Host Port   : ${env.APP_PORT}"
                    echo "Network     : ${env.NETWORK_NAME}"
                    echo "Database    : ${env.DB_NAME}"
                    echo '========================================'
                }
            }
        }

        stage('Checkout Selected Branch') {
            steps {
                echo "Checking out selected branch: ${env.GIT_BRANCH_NAME}"

                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.GIT_BRANCH_NAME}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Veera0831/customer-multi-env.git',
                        credentialsId: '04c3cc2b-dfc6-4c66-81ee-6d0c4055ab22'
                    ]]
                ])
            }
        }

        stage('Test') {
            steps {
                echo 'Task 2 parameter and branch mapping test completed successfully!'
                echo "Selected branch: ${env.GIT_BRANCH_NAME}"
            }
        }

        stage('Docker Check') {
            steps {
                bat 'docker version'
                bat 'docker ps'
            }
        }
    }
}