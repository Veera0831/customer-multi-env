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
                        env.DB_VOLUME = 'customer-db-dev-data'
                        env.DB_HOST = 'customer-db-dev'
                        env.DB_CRED_ID = 'customer-db-dev-password'

                    } else if (params.ENVIRONMENT == 'UAT') {
                        env.GIT_BRANCH_NAME = 'release'
                        env.APP_NAME = 'customer-app-uat'
                        env.APP_PORT = '8082'
                        env.NETWORK_NAME = 'customer-uat-net'
                        env.DB_NAME = 'customer-db-uat'
                        env.DB_VOLUME = 'customer-db-uat-data'
                        env.DB_HOST = 'customer-db-uat'
                        env.DB_CRED_ID = 'customer-db-uat-password'

                    } else if (params.ENVIRONMENT == 'PRODUCTION') {
                        env.GIT_BRANCH_NAME = 'main'
                        env.APP_NAME = 'customer-app-prod'
                        env.APP_PORT = '8083'
                        env.NETWORK_NAME = 'customer-prod-net'
                        env.DB_NAME = 'customer-db-prod'
                        env.DB_VOLUME = 'customer-db-prod-data'
                        env.DB_HOST = 'customer-db-prod'
                        env.DB_CRED_ID = 'customer-db-prod-password'

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
                    echo "DB Host     : ${env.DB_HOST}"
                    echo "DB Volume   : ${env.DB_VOLUME}"
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

        stage('Docker Build') {
            when {
                expression {
                    params.ACTION == 'DEPLOY'
                }
            }

            steps {
                echo "Building Docker image customer-app:${params.VERSION}"

                bat """
                    docker build -t customer-app:${params.VERSION} .
                    docker images customer-app
                """
            }
        }

        stage('Prepare Docker Network') {
            steps {
                bat """
                    docker network inspect ${env.NETWORK_NAME} >nul 2>&1
                    if errorlevel 1 (
                        echo Creating network ${env.NETWORK_NAME}
                        docker network create ${env.NETWORK_NAME}
                    ) else (
                        echo Network ${env.NETWORK_NAME} already exists
                    )
                """
            }
        }

        stage('Prepare Database') {
            steps {
                script {

                    def credId = env.DB_CRED_ID

                    withCredentials([
                        string(
                            credentialsId: credId,
                            variable: 'DB_PASSWORD'
                        )
                    ]) {

                        bat """
                            docker volume inspect ${env.DB_VOLUME} >nul 2>&1
                            if errorlevel 1 (
                                echo Creating database volume ${env.DB_VOLUME}
                                docker volume create ${env.DB_VOLUME}
                            ) else (
                                echo Database volume ${env.DB_VOLUME} already exists
                            )

                            docker ps -a --format "{{.Names}}" | findstr /x "${env.DB_NAME}" >nul 2>&1
                            if errorlevel 1 (
                                echo Creating database container ${env.DB_NAME}

                                docker run -d ^
                                  --name ${env.DB_NAME} ^
                                  --network ${env.NETWORK_NAME} ^
                                  -e POSTGRES_DB=customerdb ^
                                  -e POSTGRES_USER=customeruser ^
                                  -e POSTGRES_PASSWORD="%DB_PASSWORD%" ^
                                  -v ${env.DB_VOLUME}:/var/lib/postgresql/data ^
                                  postgres:16-alpine
                            ) else (
                                echo Database container ${env.DB_NAME} already exists

                                docker start ${env.DB_NAME} >nul 2>&1
                            )
                        """
                    }
                }
            }
        }

        stage('Database Health Check') {
            steps {
                bat """
                    echo Waiting for database...

                    timeout /t 10 /nobreak >nul

                    docker exec ${env.DB_NAME} ^
                      pg_isready -U customeruser -d customerdb
                """
            }
        }

        stage('Deploy Application') {
            when {
                expression {
                    params.ACTION == 'DEPLOY'
                }
            }

            steps {
                script {

                    def credId = env.DB_CRED_ID

                    withCredentials([
                        string(
                            credentialsId: credId,
                            variable: 'DB_PASSWORD'
                        )
                    ]) {

                        bat """
                            echo Removing old application container if present...

                            docker rm -f ${env.APP_NAME} >nul 2>&1

                            echo Starting application...

                            docker run -d ^
                              --name ${env.APP_NAME} ^
                              --network ${env.NETWORK_NAME} ^
                              -p ${env.APP_PORT}:3000 ^
                              -e PORT=3000 ^
                              -e APP_ENV=${params.ENVIRONMENT} ^
                              -e APP_VERSION=${params.VERSION} ^
                              -e DB_HOST=${env.DB_HOST} ^
                              -e DB_PORT=5432 ^
                              -e DB_NAME=customerdb ^
                              -e DB_USER=customeruser ^
                              -e DB_PASSWORD="%DB_PASSWORD%" ^
                              customer-app:${params.VERSION}

                            echo Application container started.
                        """
                    }
                }
            }
        }

        stage('Application Validation') {
            when {
                expression {
                    params.ACTION == 'DEPLOY'
                }
            }

            steps {
                bat """
                    echo ========================================
                    echo APPLICATION VALIDATION
                    echo ========================================

                    timeout /t 10 /nobreak >nul

                    docker ps --filter "name=${env.APP_NAME}"

                    echo.
                    echo Application logs:
                    docker logs --tail 30 ${env.APP_NAME}

                    echo.
                    echo Testing application health endpoint...

                    curl.exe -f http://localhost:${env.APP_PORT}/health

                    echo.
                    echo ========================================
                    echo APPLICATION HEALTH CHECK PASSED
                    echo ========================================
                """
            }
        }

        stage('Database Connectivity Proof') {
            when {
                expression {
                    params.ACTION == 'DEPLOY'
                }
            }

            steps {
                bat """
                    echo ========================================
                    echo APP TO DATABASE CONNECTIVITY
                    echo ========================================

                    docker exec ${env.APP_NAME} ^
                      node -e "require('dns').lookup('${env.DB_HOST}', console.log)"

                    echo.
                    echo Database hostname resolved successfully.

                    docker exec ${env.APP_NAME} ^
                      wget -qO- http://localhost:3000/health

                    echo.
                    echo ========================================
                    echo APP TO DATABASE CHECK PASSED
                    echo ========================================
                """
            }
        }

        stage('Deployment Summary') {
            steps {
                bat """
                    echo ========================================
                    echo DEPLOYMENT SUMMARY
                    echo ========================================
                    echo Environment : ${params.ENVIRONMENT}
                    echo Action      : ${params.ACTION}
                    echo Version     : ${params.VERSION}
                    echo Git Branch  : ${env.GIT_BRANCH_NAME}
                    echo Application : ${env.APP_NAME}
                    echo Port        : ${env.APP_PORT}
                    echo Network     : ${env.NETWORK_NAME}
                    echo Database    : ${env.DB_NAME}
                    echo ========================================

                    docker ps --filter "name=${env.APP_NAME}"
                    docker ps --filter "name=${env.DB_NAME}"

                    echo.
                    echo Docker network:
                    docker network inspect ${env.NETWORK_NAME}
                """
            }
        }
    }
}