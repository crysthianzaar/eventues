# Eventues Frontend - Environment Deployment Guide

## Overview
The Eventues frontend supports two environments: **sandbox** and **production**. Each environment connects to different backend APIs, Firebase projects, and has specific Vercel configurations.

## Environment Configuration

### Environment Variables in Vercel

#### Sandbox Environment
```bash
NEXT_PUBLIC_ENVIRONMENT=sandbox
NEXT_PUBLIC_BACKEND_API_URL=https://your-sandbox-api-gateway-url.amazonaws.com/sandbox
NEXT_PUBLIC_FIREBASE_API_KEY=your_sandbox_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eventues-auth-sandbox.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=eventues-auth-sandbox
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=eventues-auth-sandbox.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_sandbox_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_sandbox_measurement_id
NEXT_PUBLIC_VERCEL_URL=https://eventues-frontend-sandbox.vercel.app
IBGE_API_URL=https://servicodados.ibge.gov.br/api/v1
```

#### Production Environment
```bash
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_BACKEND_API_URL=https://your-production-api-gateway-url.amazonaws.com/prod
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eventues-auth.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=eventues-auth
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=eventues-auth.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_production_measurement_id
NEXT_PUBLIC_VERCEL_URL=https://www.eventues.com
IBGE_API_URL=https://servicodados.ibge.gov.br/api/v1
```

## Vercel Deployment Setup

### 1. Create Separate Projects
- **Sandbox**: `eventues-frontend-sandbox`
- **Production**: `eventues-frontend-production`

### 2. Branch Configuration
- **Sandbox**: Deploy from `develop` branch
- **Production**: Deploy from `main` branch

### 3. Domain Configuration
- **Sandbox**: `eventues-frontend-sandbox.vercel.app`
- **Production**: `www.eventues.com`

## Deployment Process

### Sandbox Deployment
1. Push changes to `develop` branch
2. Vercel automatically deploys to sandbox environment
3. Test all functionality in sandbox

### Production Deployment
1. Merge `develop` into `main` branch
2. Vercel automatically deploys to production environment
3. Monitor production deployment

## Environment Differences

| Component | Sandbox | Production |
|-----------|---------|------------|
| **Backend API** | AWS API Gateway /sandbox | AWS API Gateway /prod |
| **Firebase Project** | eventues-auth-sandbox | eventues-auth |
| **Domain** | vercel.app subdomain | www.eventues.com |
| **Branch** | develop | main |

## API Integration

The frontend now uses centralized API configuration:

```typescript
import { API_CONFIG, apiCall } from '@/lib/api/config';

// Example usage
const response = await apiCall('/events', {
  method: 'GET'
}, userToken);
```

## Post-Deployment Checklist

### After Backend Deployment
1. Update `NEXT_PUBLIC_BACKEND_API_URL` in Vercel environment variables
2. Redeploy frontend to pick up new backend URL

### After Frontend Deployment
1. Test user authentication flow
2. Test event creation and management
3. Test payment integration
4. Verify image uploads work correctly
5. Check analytics tracking

## Troubleshooting

### Common Issues
1. **API calls failing**: Check `NEXT_PUBLIC_BACKEND_API_URL` matches deployed backend
2. **Firebase auth errors**: Verify Firebase project configuration and API keys
3. **Payment errors**: Ensure backend Asaas configuration matches frontend environment
4. **Image upload issues**: Check Firebase Storage bucket permissions

### Environment Debugging
```typescript
import { envConfig } from '@/lib/config/environment';

console.log('Current environment:', envConfig.getConfig().environment);
console.log('Backend URL:', envConfig.getBackendUrl());
console.log('Is production:', envConfig.isProduction());
```
