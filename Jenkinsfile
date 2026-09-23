```groovy
pipeline {
    agent any

    stages {

        stage('Resolve Deployment Configuration') {
            steps {
                script {

                    def branch
                    def appName
                    def appPort
                    def networkName
                    def dbName

                    if (params.ENVIRONMENT == 'DEV') {
                        branch = 'develop'
                        appName = 'customer-app-dev'
                        appPort = '8081'
                        networkName = 'customer-dev-net'
                        dbName = 'customer-db-dev'

                    } else if (params.ENVIRONMENT == 'UAT') {
                        branch = 'release'
                        appName = 'customer-app-uat'
                        appPort = '8082'
                        networkName = 'customer-uat-net'
                        dbName = 'customer-db-uat'

                    } else if (params.ENVIRONMENT == 'PRODUCTION') {
                        branch = 'main'
                        appName = 'customer-app-prod'
                        appPort = '8083'
                        networkName = 'customer-prod-net'
                        dbName = 'customer-db-prod'

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

                    echo '========================================'
                    echo 'RESOLVED DEPLOYMENT CONFIGURATION'
                    echo '========================================'
                    echo "Environment : ${params.ENVIRONMENT}"
                    echo "Action      : ${params.ACTION}"
                    echo "Version     : ${params.VERSION}"
                    echo "Run Tests   : ${params.RUN_TESTS}"
                    echo "Git Branch  : ${branch}"
                    echo "Application : ${appName}"
                    echo "Host Port   : ${appPort}"
                    echo "Network     : ${networkName}"
                    echo "Database    : ${dbName}"
                    echo '========================================'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Task 2 parameter test completed successfully!'
            }
        }
    }
}
```
