# JWT Authentication Implementation Guide

## Overview

This document describes the JWT authentication implementation for the Lexi chat application, enabling secure communication with backend services using Supabase JWT tokens.

## Architecture

```
┌─────────────┐     JWT Auth      ┌──────────────┐     JWT Token    ┌──────────────┐
│   Next.js   │ ────────────────> │   Supabase   │ <──────────────> │     User     │
│   Frontend  │                   │     Auth     │                  │   Browser    │
└──────┬──────┘                   └──────────────┘                  └──────────────┘
       │
       │ Bearer Token
       ▼
┌──────────────┐     JWT Token    ┌──────────────┐
│  Chat Route  │ ────────────────>│ Lexi OpenBrain│
│   /api/chat  │                  │   Service     │
└──────────────┘                  └──────────────┘
                                          │
                                          ▼
                                  ┌──────────────┐
                                  │ Lexi Memory  │
                                  │   Service    │
                                  └──────────────┘
```

## Key Components

### 1. JWT Token Extraction (`lib/auth/jwt-helper.ts`)

Handles extraction of JWT tokens from Supabase sessions:

```typescript
export async function getJWTToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
```

### 2. Environment Configuration (`lib/config/endpoints.ts`)

Manages endpoint configuration for different environments:

```typescript
export function getEnvironmentConfig(): EndpointConfig {
  const env = process.env.ENVIRONMENT || 'production';
  // Returns appropriate endpoints based on environment
}
```

### 3. Lexi Provider (`lib/ai/lexi-provider.ts`)

Creates OpenAI-compatible providers with JWT authentication:

```typescript
export function createLexiProvider(jwtToken?: string) {
  return createOpenAICompatible({
    baseURL: config.openbrain + '/chat/completions',
    headers: { 'Authorization': `Bearer ${jwtToken}` }
  });
}
```

### 4. Chat Route Integration (`app/(chat)/api/chat/route.ts`)

Injects JWT tokens when using Lexi models:

```typescript
if (selectedChatModel.startsWith('lexi')) {
  const jwtToken = await getJWTToken();
  if (jwtToken) {
    const lexiProvider = createLexiProvider(jwtToken);
    modelToUse = lexiProvider(modelVariant);
  }
}
```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Environment Setting (staging/production/development)
ENVIRONMENT=staging

# Production Endpoints
LEXI_OPENBRAIN_API_URL=https://lexi-open-brain-service.run.app
LEXI_MEMORY_API_URL=https://lexi-memory-service.run.app

# Staging Endpoints
LEXI_OPENBRAIN_STAGING_URL=https://lexi-open-brain-staging.run.app
LEXI_MEMORY_STAGING_URL=https://lexi-memory-api-staging.run.app

# Development Endpoints
LEXI_OPENBRAIN_DEV_URL=http://localhost:8080
LEXI_MEMORY_DEV_URL=http://localhost:8000
```

### Environment Switching

The application automatically selects endpoints based on the `ENVIRONMENT` variable:

- `production` - Uses production endpoints
- `staging` - Uses staging endpoints
- `development` - Uses local development endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

### 3. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key to `.env.local`
3. Create test users for authentication

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Testing JWT Authentication

### Using the Test Script

```bash
# Install dependencies
npm install @supabase/supabase-js dotenv

# Run the test
node test-jwt-auth.mjs
```

The test script will:
1. Initialize Supabase client
2. Sign in to get JWT token
3. Test Lexi API with the token
4. Verify authentication works

### Manual Testing

1. Sign in to the application
2. Select a Lexi model (lexi, lexi-todo, lexi-memory)
3. Send a message
4. Check browser DevTools Network tab for JWT in Authorization header

## Available Lexi Models

The following Lexi models are configured with JWT authentication:

- `lexi` - General purpose Lexi model
- `lexi-todo` - Todo/task management specialized model
- `lexi-memory` - Memory and context management model
- `lexi-search` - Search specialized model

## Security Considerations

### JWT Token Handling

- Tokens are extracted from Supabase sessions server-side
- Never exposed to client-side code
- Automatically included in API requests to Lexi services
- Tokens expire and are refreshed automatically by Supabase

### Best Practices

1. **Never commit `.env.local`** - Contains sensitive credentials
2. **Use service role keys only server-side** - Never expose to clients
3. **Validate tokens on backend** - Always verify JWT signatures
4. **Use HTTPS in production** - Prevent token interception
5. **Implement rate limiting** - Prevent abuse

## Troubleshooting

### Common Issues

#### "No JWT token available for Lexi model"

**Cause**: User not authenticated or session expired
**Solution**: Ensure user is signed in and session is active

#### "API call failed with 401"

**Cause**: Invalid or expired JWT token
**Solution**: Check token validity and backend JWT validation

#### "Cannot read properties of undefined"

**Cause**: Missing environment variables
**Solution**: Ensure all required variables are set in `.env.local`

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
DEBUG=true
```

This will log:
- JWT token extraction
- Endpoint selection
- API requests and responses

## API Response Format

### Successful Response

```json
{
  "id": "chat-completion-id",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "lexi",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Response from Lexi"
    }
  }]
}
```

### Error Response

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid or missing JWT token"
  }
}
```

## Migration Guide

### From Legacy Authentication

If migrating from the legacy system:

1. Update environment variables
2. Replace `CUSTOM_API_KEY` with JWT authentication
3. Update model references to use new Lexi models
4. Test authentication flow

### Backward Compatibility

The legacy configuration is maintained for backward compatibility:

```bash
CUSTOM_API_BASE_URL=https://open-brain.xteo.com/
CUSTOM_API_KEY=lexiAPI
```

## Development Tips

### Local Development

For local development with backend services:

1. Set `ENVIRONMENT=development`
2. Run backend services locally
3. Configure local endpoints in `.env.local`
4. Use test JWT tokens for debugging

### Staging Testing

For staging environment testing:

1. Set `ENVIRONMENT=staging`
2. Deploy backend to staging
3. Use staging endpoints
4. Test with production-like data

## Support

For issues or questions:

1. Check this documentation
2. Review test script output
3. Check backend service logs
4. Verify Supabase configuration

## Changelog

### Version 1.0.0 (Current)

- Initial JWT authentication implementation
- Support for staging/production environments
- Integration with Supabase auth
- Lexi model provider configuration
- Comprehensive test suite

## License

This implementation is part of the Lexi chat application and follows the project's license terms.