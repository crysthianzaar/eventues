@echo off
echo Deploying Eventues Backend to Sandbox...
echo.

REM Set environment variables for sandbox
set ENVIRONMENT=sandbox

REM Deploy to sandbox stage
chalice deploy --stage sandbox

echo.
echo Sandbox deployment completed!
echo Check AWS Console for the API Gateway endpoint URL.
pause
