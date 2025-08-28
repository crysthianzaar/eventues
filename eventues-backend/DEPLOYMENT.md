# Eventues Backend - Environment Deployment Guide

## Overview
The Eventues backend supports two environments: **sandbox** and **production**. Each environment has its own AWS deployment, Firebase configuration, and Asaas API settings.

## Environment Configuration

### 1. AWS Chalice Configuration
Copy the template configuration:
```bash
cp chalice-config-template.json .chalice/config.json
```

### 2. Environment Variables
Set the following environment variables in AWS Lambda (via Chalice deployment):

#### Sandbox Environment
```bash
ENVIRONMENT=sandbox
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...} # Sandbox Firebase credentials
ASAAS_API_KEY=your_sandbox_asaas_api_key
```

#### Production Environment
```bash
ENVIRONMENT=production
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...} # Production Firebase credentials
ASAAS_API_KEY=your_production_asaas_api_key
```

## Deployment Commands

### Deploy to Sandbox
```bash
# Windows
deploy-sandbox.bat

# Or manually
set ENVIRONMENT=sandbox
chalice deploy --stage sandbox
```

### Deploy to Production
```bash
# Windows
deploy-production.bat

# Or manually
set ENVIRONMENT=production
chalice deploy --stage production
```

## Environment Differences

| Component | Sandbox | Production |
|-----------|---------|------------|
| **Firebase** | eventues-auth-sandbox | eventues-auth |
| **Asaas API** | https://sandbox.asaas.com/api/v3 | https://www.asaas.com/api/v3 |
| **CORS Origins** | localhost:3000, vercel preview URLs | www.eventues.com |
| **AWS Stage** | sandbox | prod |

## Post-Deployment Steps

1. **Update Frontend Environment Variables**
   - Copy the API Gateway URL from AWS Console
   - Update `NEXT_PUBLIC_BACKEND_API_URL` in Vercel

2. **Configure Webhooks**
   - Update Asaas webhook URLs to point to the new endpoints
   - Sandbox: `https://your-api-id.execute-api.region.amazonaws.com/sandbox/webhooks/asaas`
   - Production: `https://your-api-id.execute-api.region.amazonaws.com/prod/webhooks/asaas`

3. **Test Deployment**
   - Verify API endpoints are accessible
   - Test Firebase authentication
   - Test Asaas payment integration

## Troubleshooting

### Common Issues
1. **Environment variable not found**: Ensure all required variables are set in `.chalice/config.json`
2. **Firebase initialization error**: Verify JSON credentials format and project ID
3. **CORS errors**: Check that frontend URL is included in allowed origins
4. **Asaas API errors**: Verify API key and endpoint URL for the environment

### Logs
Check CloudWatch logs for detailed error information:
```bash
chalice logs --stage sandbox
chalice logs --stage production
```
