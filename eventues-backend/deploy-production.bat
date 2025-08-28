@echo off
echo Deploying Eventues Backend to Production...
echo.
echo WARNING: This will deploy to PRODUCTION environment!
echo Make sure all configurations are correct.
echo.
set /p confirm="Are you sure you want to deploy to production? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 1
)

echo.
echo Proceeding with production deployment...

REM Set environment variables for production
set ENVIRONMENT=production

REM Deploy to production stage
chalice deploy --stage production

echo.
echo Production deployment completed!
echo Check AWS Console for the API Gateway endpoint URL.
pause
