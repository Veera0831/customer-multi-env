// ==========================================================
// TASK 2
// Multi-Environment CI/CD Pipeline
// Windows Jenkins + Docker + PostgreSQL
// ==========================================================

pipeline {

    agent any

    // ======================================================
    // PARAMETERS
    // ======================================================

    parameters {

        choice(
            name: 'ENVIRONMENT',
            choices: [
                'DEV',
                'UAT',
                'PRODUCTION'
            ],
            description: 'Select deployment environment'
        )

        choice(
            name: 'ACTION',
            choices: [
                'DEPLOY',
                'ROLLBACK'
            ],
            description: 'Select deployment action'
        )

        string(
            name: 'VERSION',
            defaultValue: '5.0',
            description: 'Application version to deploy or rollback'
        )

        choice(
            name: 'RUN_TESTS',
            choices: [
                'YES',
                'NO'
            ],
            description: 'Run application validation tests'
        )

        choice(
            name: 'CONFIRM_PRODUCTION',
            choices: [
                'NO',
                'YES'
            ],
            description: 'Production deployment requires explicit YES confirmation'
        )
    }

    // ======================================================
    // GLOBAL ENVIRONMENT VARIABLES
    // ======================================================

    environment {

        APP_IMAGE = 'customer-multi-env-app'

        GIT_URL = 'https://github.com/YOUR_USERNAME/customer-multi-env.git'

        // Change this to your Jenkins GitHub credential ID
        GIT_CREDENTIALS = 'github-credentials'
    }

    stages {

        // ==================================================
        // STAGE 1 - INITIALIZE
        // ==================================================

        stage('Initialize') {

            steps {

                script {
                    if (params.ENVIRONMENT == 'DEV') {
    env.DB_CREDENTIAL_ID = 'customer-db-dev-password'
}
else if (params.ENVIRONMENT == 'UAT') {
    env.DB_CREDENTIAL_ID = 'customer-db-uat-password'
}
else if (params.ENVIRONMENT == 'PRODUCTION') {
    env.DB_CREDENTIAL_ID = 'customer-db-prod-password'
}

                    echo ''
                    echo '=================================================='
                    echo 'TASK 2 - MULTI ENVIRONMENT CI/CD'
                    echo '=================================================='

                    echo "Selected Environment : ${params.ENVIRONMENT}"
                    echo "Selected Action      : ${params.ACTION}"
                    echo "Requested Version    : ${params.VERSION}"
                    echo "Run Tests            : ${params.RUN_TESTS}"
                    echo "Production Confirm   : ${params.CONFIRM_PRODUCTION}"

                    // --------------------------------------
                    // Validate version
                    // --------------------------------------

                    if (!(params.VERSION ==~ /^[0-9]+\.[0-9]+$/)) {

                        error(
                            "Invalid VERSION '${params.VERSION}'. " +
                            "Use format such as 5.0 or 5.1."
                        )
                    }

                    // --------------------------------------
                    // Production confirmation
                    // --------------------------------------

                    if (
                        params.ENVIRONMENT == 'PRODUCTION' &&
                        params.CONFIRM_PRODUCTION != 'YES'
                    ) {

                        error(
                            'PRODUCTION deployment rejected. ' +
                            'CONFIRM_PRODUCTION must be YES.'
                        )
                    }

                    // --------------------------------------
                    // Environment mapping
                    // --------------------------------------

                    if (params.ENVIRONMENT == 'DEV') {

                        env.DEPLOY_BRANCH = 'develop'
                        env.CONFIG_FILE = 'config/dev.env'
                        env.APP_CONTAINER = 'customer-app-dev'
                        env.DB_CONTAINER = 'customer-db-dev'
                        env.DOCKER_NETWORK = 'customer-dev-net'
                        env.DB_VOLUME = 'customer-db-dev-data'
                        env.HOST_PORT = '8081'
                        env.DB_HOST = 'customer-db-dev'
                        env.CONFIG_FILE = 'config/uat.env'

                    }

                    else if (params.ENVIRONMENT == 'UAT') {

                        env.DEPLOY_BRANCH = 'release'
                        env.CONFIG_FILE = 'config/uat.env'
                        env.APP_CONTAINER = 'customer-app-uat'
                        env.DB_CONTAINER = 'customer-db-uat'
                        env.DOCKER_NETWORK = 'customer-uat-net'
                        env.DB_VOLUME = 'customer-db-uat-data'
                        env.HOST_PORT = '8082'
                        env.DB_HOST = 'customer-db-uat'

                    }

                    else if (params.ENVIRONMENT == 'PRODUCTION') {

                        env.DEPLOY_BRANCH = 'main'
                        env.CONFIG_FILE = 'config/prod.env'
                        env.APP_CONTAINER = 'customer-app-prod'
                        env.DB_CONTAINER = 'customer-db-prod'
                        env.DOCKER_NETWORK = 'customer-prod-net'
                        env.DB_VOLUME = 'customer-db-prod-data'
                        env.HOST_PORT = '8083'
                        env.DB_HOST = 'customer-db-prod'
                        env.CONFIG_FILE = 'config/prod.env'

                    }

                    else {

                        error(
                            "Invalid environment: ${params.ENVIRONMENT}"
                        )
                    }

                    // --------------------------------------
                    // Print resolved deployment configuration
                    // --------------------------------------

                    echo ''
                    echo '=================================================='
                    echo 'RESOLVED DEPLOYMENT CONFIGURATION'
                    echo '=================================================='
                    echo "Environment       : ${params.ENVIRONMENT}"
                    echo "Action             : ${params.ACTION}"
                    echo "Version            : ${params.VERSION}"
                    echo "Git Branch         : ${env.DEPLOY_BRANCH}"
                    echo "App Container      : ${env.APP_CONTAINER}"
                    echo "DB Container       : ${env.DB_CONTAINER}"
                    echo "Docker Network     : ${env.DOCKER_NETWORK}"
                    echo "DB Volume          : ${env.DB_VOLUME}"
                    echo "DB Host            : ${env.DB_HOST}"
                    echo "Host Port          : ${env.HOST_PORT}"
                    echo "App Image          : ${env.APP_IMAGE}"
                    echo '=================================================='
                }
            }
        }

        // ==================================================
        // STAGE 2 - CHECK DOCKER
        // ==================================================

        stage('Check Docker') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Checking Docker
                    echo ==========================================

                    docker version

                    if errorlevel 1 (
                        echo ERROR: Docker is not available.
                        exit /b 1
                    )

                    docker info

                    if errorlevel 1 (
                        echo ERROR: Docker Engine is not running.
                        exit /b 1
                    )
                '''
            }
        }

        // ==================================================
        // STAGE 3 - CHECK NETWORK
        // ==================================================

        stage('Prepare Docker Network') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Preparing Docker Network
                    echo ==========================================

                    docker network inspect %DOCKER_NETWORK% >nul 2>&1

                    if errorlevel 1 (
                        echo Creating network: %DOCKER_NETWORK%
                        docker network create %DOCKER_NETWORK%
                    )
                    else (
                        echo Network already exists:
                        echo %DOCKER_NETWORK%
                    )
                '''
            }
        }

        // ==================================================
        // STAGE 4 - CHECK DATABASE VOLUME
        // ==================================================

        stage('Prepare Database Volume') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Preparing Database Volume
                    echo ==========================================

                    docker volume inspect %DB_VOLUME% >nul 2>&1

                    if errorlevel 1 (
                        echo Creating volume: %DB_VOLUME%
                        docker volume create %DB_VOLUME%
                    )
                    else (
                        echo Database volume already exists:
                        echo %DB_VOLUME%
                    )
                '''
            }
        }

        // ==================================================
        // STAGE 5 - CHECK GIT BRANCH
        // ==================================================

        stage('Checkout Selected Branch') {

            steps {

                script {

                    echo ''
                    echo '=================================================='
                    echo 'CHECKOUT SELECTED GIT BRANCH'
                    echo '=================================================='
                    echo "Environment : ${params.ENVIRONMENT}"
                    echo "Branch      : ${env.DEPLOY_BRANCH}"
                    echo '=================================================='

                    checkout([
                        $class: 'GitSCM',

                        branches: [[
                            name: "*/${env.DEPLOY_BRANCH}"
                        ]],

                        userRemoteConfigs: [[
                            url: "${env.GIT_URL}",
                            credentialsId: "${env.GIT_CREDENTIALS}"
                        ]],

                        extensions: [
                            [$class: 'CleanBeforeCheckout']
                        ]
                    ])
                }
            }
        }

        // ==================================================
        // STAGE 6 - VERIFY GIT BRANCH
        // ==================================================

        stage('Verify Git Branch') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Git Branch Verification
                    echo ==========================================

                    git branch --show-current

                    git status

                    echo.
                    echo Expected branch:
                    echo %DEPLOY_BRANCH%

                    for /f "delims=" %%B in ('git branch --show-current') do set CURRENT_BRANCH=%%B

                    if not "%CURRENT_BRANCH%"=="%DEPLOY_BRANCH%" (
                        echo ERROR: Wrong Git branch detected.
                        echo Expected: %DEPLOY_BRANCH%
                        echo Actual: %CURRENT_BRANCH%
                        exit /b 1
                    )

                    echo Git branch validation successful.
                '''
            }
        }

        // ==================================================
        // STAGE 7 - BUILD DOCKER IMAGE
        // ==================================================

        stage('Build Docker Image') {

            when {

                expression {
                    params.ACTION == 'DEPLOY'
                }
            }

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Building Docker Image
                    echo ==========================================

                    docker build ^
                      -t %APP_IMAGE%:%VERSION% ^
                      -t %APP_IMAGE%:latest ^
                      .

                    if errorlevel 1 (
                        echo ERROR: Docker image build failed.
                        exit /b 1
                    )

                    docker images %APP_IMAGE%
                '''
            }
        }

        // ==================================================
        // STAGE 8 - VERIFY IMAGE
        // ==================================================

        stage('Verify Docker Image') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Verifying Docker Image
                    echo ==========================================

                    docker image inspect %APP_IMAGE%:%VERSION% >nul 2>&1

                    if errorlevel 1 (
                        echo ERROR: Image does not exist:
                        echo %APP_IMAGE%:%VERSION%
                        exit /b 1
                    )

                    echo Image exists:
                    echo %APP_IMAGE%:%VERSION%

                    docker image inspect %APP_IMAGE%:%VERSION%
                '''
            }
        }

        // ==================================================
        // STAGE 9 - DEPLOY
        // ==================================================

        stage('Deploy Application') {

            withCredentials([
    string(
        credentialsId: env.DB_CREDENTIAL_ID,
        variable: 'DB_PASSWORD'
    )
]) }
{
    bat '''
        docker run ...
    '''
}
                    @echo off

                    echo ==========================================
                    echo Deploying Application
                    echo ==========================================

                    echo Environment : %ENVIRONMENT%
                    echo Version     : %VERSION%
                    echo App         : %APP_CONTAINER%
                    echo DB          : %DB_CONTAINER%
                    echo Network     : %DOCKER_NETWORK%
                    echo Port        : %HOST_PORT%

                    echo.
                    echo Stopping previous application container...

                    docker rm -f %APP_CONTAINER% >nul 2>&1

                    echo.
                    echo Starting database...

                    docker compose ^
                      --env-file config/%DEPLOY_BRANCH%.env ^
                      up -d db

                    if errorlevel 1 (
                        echo ERROR: Database deployment failed.
                        exit /b 1
                    )

                    echo.
                    echo Starting application...

                    docker run -d ^
                      --name %APP_CONTAINER% ^
                      --network %DOCKER_NETWORK% ^
                      -p %HOST_PORT%:3000 ^
                      -e PORT=3000 ^
                      -e APP_ENV=%ENVIRONMENT% ^
                      -e APP_VERSION=%VERSION% ^
                      -e DB_HOST=%DB_HOST% ^
                      -e DB_PORT=5432 ^
                      -e DB_NAME=customerdb ^
                      -e DB_USER=customeruser ^
                      -e DB_PASSWORD=%DB_PASSWORD% ^
                      %APP_IMAGE%:%VERSION%

                    if errorlevel 1 (
                        echo ERROR: Application deployment failed.
                        exit /b 1
                    )

                    echo Deployment command completed.
                '''
            }
        }

        // ==================================================
        // STAGE 10 - ROLLBACK
        // ==================================================

        stage('Rollback Application') {

            when {

                expression {
                    params.ACTION == 'ROLLBACK'
                }
            }

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo ROLLBACK
                    echo ==========================================

                    echo Environment : %ENVIRONMENT%
                    echo Rollback Version : %VERSION%
                    echo App : %APP_CONTAINER%

                    docker image inspect %APP_IMAGE%:%VERSION% >nul 2>&1

                    if errorlevel 1 (
                        echo ERROR: Rollback image does not exist.
                        echo Required image:
                        echo %APP_IMAGE%:%VERSION%
                        exit /b 1
                    )

                    echo Stopping current application...

                    docker rm -f %APP_CONTAINER% >nul 2>&1

                    echo Starting rollback version...

                    docker run -d ^
                      --name %APP_CONTAINER% ^
                      --network %DOCKER_NETWORK% ^
                      -p %HOST_PORT%:3000 ^
                      -e PORT=3000 ^
                      -e APP_ENV=%ENVIRONMENT% ^
                      -e APP_VERSION=%VERSION% ^
                      -e DB_HOST=%DB_HOST% ^
                      -e DB_PORT=5432 ^
                      -e DB_NAME=customerdb ^
                      -e DB_USER=customeruser ^
                      -e DB_PASSWORD=%DB_PASSWORD% ^
                      %APP_IMAGE%:%VERSION%

                    if errorlevel 1 (
                        echo ERROR: Rollback deployment failed.
                        exit /b 1
                    )

                    echo Rollback deployment started.
                '''
            }
        }

        // ==================================================
        // STAGE 11 - APPLICATION CONTAINER VALIDATION
        // ==================================================

        stage('Validate Application Container') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Application Container Validation
                    echo ==========================================

                    docker ps --filter "name=%APP_CONTAINER%"

                    docker inspect %APP_CONTAINER% >nul 2>&1

                    if errorlevel 1 (
                        echo ERROR: Application container does not exist.
                        exit /b 1
                    )

                    docker inspect -f "{{.State.Running}}" %APP_CONTAINER% | findstr "true"

                    if errorlevel 1 (
                        echo ERROR: Application container is not running.
                        echo.
                        docker logs %APP_CONTAINER%
                        exit /b 1
                    )

                    echo Application container is running.
                '''
            }
        }

        // ==================================================
        // STAGE 12 - DATABASE CONTAINER VALIDATION
        // ==================================================

        stage('Validate Database Container') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Database Container Validation
                    echo ==========================================

                    docker ps --filter "name=%DB_CONTAINER%"

                    docker inspect %DB_CONTAINER% >nul 2>&1

                    if errorlevel 1 (
                        echo ERROR: Database container does not exist.
                        exit /b 1
                    )

                    docker inspect -f "{{.State.Running}}" %DB_CONTAINER% | findstr "true"

                    if errorlevel 1 (
                        echo ERROR: Database container is not running.
                        docker logs %DB_CONTAINER%
                        exit /b 1
                    )

                    echo Database container is running.
                '''
            }
        }

        // ==================================================
        // STAGE 13 - NETWORK VALIDATION
        // ==================================================

        stage('Validate Docker Network') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Docker Network Validation
                    echo ==========================================

                    docker network inspect %DOCKER_NETWORK%

                    docker network inspect %DOCKER_NETWORK% | findstr /I "%APP_CONTAINER%"

                    if errorlevel 1 (
                        echo ERROR: Application is not connected to expected network.
                        exit /b 1
                    )

                    docker network inspect %DOCKER_NETWORK% | findstr /I "%DB_CONTAINER%"

                    if errorlevel 1 (
                        echo ERROR: Database is not connected to expected network.
                        exit /b 1
                    )

                    echo Network validation successful.
                '''
            }
        }

        // ==================================================
        // STAGE 14 - ENVIRONMENT VALIDATION
        // ==================================================

        stage('Validate Environment') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Environment Validation
                    echo ==========================================

                    echo Expected Environment:
                    echo %ENVIRONMENT%

                    echo Actual Application Environment:

                    docker exec %APP_CONTAINER% printenv APP_ENV

                    docker exec %APP_CONTAINER% printenv APP_VERSION

                    echo.
                    echo Database Host:

                    docker exec %APP_CONTAINER% printenv DB_HOST
                '''
            }
        }

        // ==================================================
        // STAGE 15 - HEALTH CHECK
        // ==================================================

        stage('Health Check') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Application Health Check
                    echo ==========================================

                    powershell -Command ^
                    "$url='http://localhost:%HOST_PORT%/health';" ^
                    "Write-Host 'Checking:' $url;" ^
                    "$response=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30;" ^
                    "Write-Host 'HTTP Status:' $response.StatusCode;" ^
                    "Write-Host $response.Content;" ^
                    "if ($response.StatusCode -ne 200) { exit 1 }"

                    if errorlevel 1 (
                        echo ERROR: Health check failed.
                        docker logs %APP_CONTAINER%
                        exit /b 1
                    )

                    echo Health check successful.
                '''
            }
        }

        // ==================================================
        // STAGE 16 - DATABASE CONNECTIVITY
        // ==================================================

        stage('Validate App To Database') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Application To Database Connectivity
                    echo ==========================================

                    docker exec %APP_CONTAINER% node -e "const net=require('net'); const s=net.createConnection(5432,'%DB_HOST%',()=>{console.log('DATABASE CONNECTIVITY: SUCCESS');s.end();}); s.on('error',e=>{console.error('DATABASE CONNECTIVITY: FAILED',e.message);process.exit(1);});"

                    if errorlevel 1 (
                        echo ERROR: Application cannot connect to database.
                        exit /b 1
                    )

                    echo Application can reach database.
                '''
            }
        }

        // ==================================================
        // STAGE 17 - VERSION VALIDATION
        // ==================================================

        stage('Validate Version') {

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Version Validation
                    echo ==========================================

                    powershell -Command ^
                    "$url='http://localhost:%HOST_PORT%/version';" ^
                    "$response=Invoke-RestMethod -Uri $url -TimeoutSec 30;" ^
                    "Write-Host 'Expected Version:' '%VERSION%';" ^
                    "Write-Host 'Actual Version:' $response.version;" ^
                    "if ($response.version -ne '%VERSION%') { Write-Host 'ERROR: Version mismatch'; exit 1 }"

                    if errorlevel 1 (
                        echo ERROR: Version validation failed.
                        exit /b 1
                    )

                    echo Version validation successful.
                '''
            }
        }

        // ==================================================
        // STAGE 18 - CUSTOMER SEARCH TEST
        // ==================================================

        stage('Run Application Tests') {

            when {

                expression {
                    params.RUN_TESTS == 'YES'
                }
            }

            steps {

                bat '''
                    @echo off

                    echo ==========================================
                    echo Customer Search Test
                    echo ==========================================

                    powershell -Command ^
                    "$url='http://localhost:%HOST_PORT%/customers/search?name=John';" ^
                    "$response=Invoke-RestMethod -Uri $url -TimeoutSec 30;" ^
                    "Write-Host 'Search Response:';" ^
                    "$response | ConvertTo-Json -Depth 5;" ^
                    "if ($response.count -lt 1) { Write-Host 'ERROR: Customer search returned no records'; exit 1 }"

                    if errorlevel 1 (
                        echo ERROR: Customer search test failed.
                        exit /b 1
                    )

                    echo Customer search test successful.
                '''
            }
        }

        // ==================================================
        // STAGE 19 - FINAL DEPLOYMENT SUMMARY
        // ==================================================

        stage('Deployment Summary') {

            steps {

                bat '''
                    @echo off

                    echo.
                    echo ==================================================
                    echo DEPLOYMENT SUCCESSFUL
                    echo ==================================================

                    echo Environment       : %ENVIRONMENT%
                    echo Action             : %ACTION%
                    echo Version            : %VERSION%
                    echo Git Branch         : %DEPLOY_BRANCH%
                    echo App Container      : %APP_CONTAINER%
                    echo DB Container       : %DB_CONTAINER%
                    echo Docker Network     : %DOCKER_NETWORK%
                    echo Host Port          : %HOST_PORT%

                    echo.
                    echo Application URL:
                    echo http://localhost:%HOST_PORT%

                    echo.
                    echo Health URL:
                    echo http://localhost:%HOST_PORT%/health

                    echo.
                    echo Version URL:
                    echo http://localhost:%HOST_PORT%/version

                    echo.
                    echo Environment URL:
                    echo http://localhost:%HOST_PORT%/environment

                    echo.
                    echo ==================================================
                '''
            }
        }
    }

    // ======================================================
    // POST ACTIONS
    // ======================================================

    post {

        success {

            echo '=================================================='
            echo 'JENKINS BUILD SUCCESSFUL'
            echo '=================================================='
        }

        failure {

            echo '=================================================='
            echo 'JENKINS BUILD FAILED'
            echo '=================================================='

            echo 'Environment: ${params.ENVIRONMENT}'
            echo 'Action: ${params.ACTION}'
            echo 'Version: ${params.VERSION}'

            bat '''
                @echo off

                echo.
                echo ===== Docker Containers =====
                docker ps -a

                echo.
                echo ===== Application Logs =====
                docker logs %APP_CONTAINER% 2>nul

                echo.
                echo ===== Database Logs =====
                docker logs %DB_CONTAINER% 2>nul

                echo.
                echo ===== Docker Network =====
                docker network inspect %DOCKER_NETWORK% 2>nul
            '''
        }

        always {

            echo 'Pipeline execution completed.'
        }
    }
}