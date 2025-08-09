# Authentication Utils

This directory contains centralized authentication and HTTP request utilities for the Hostel-Snacker frontend.

## Files

### `axios.ts`
Centralized axios instance with automatic authentication and error handling.

**Features:**
- ✅ Automatic JWT token injection in requests
- ✅ Automatic token expiration check before requests
- ✅ Automatic redirect to login on 401/403 errors
- ✅ Automatic token cleanup on authentication failures

**Usage:**
```typescript
import api from '@/utils/axios';

// All requests automatically include authentication headers
const response = await api.get('/api/user/products/all');
```

### `jwtUtils.ts`
Comprehensive JWT token utilities for decoding and validating tokens.

**Key Functions:**
- `getUserIdFromToken(token)` - Extract user ID from JWT
- `getUserPrimaryRoleFromToken(token)` - Get user role
- `isTokenExpired(token)` - Check if token is expired
- `decodeJWT(token)` - Decode complete JWT payload

## Authentication Flow

1. **Request Interceptor**: Automatically adds `Bearer ${token}` to all requests
2. **Token Validation**: Checks if token is expired before sending requests
3. **Response Interceptor**: Handles 401/403 errors by:
   - Clearing stored auth data
   - Redirecting to login page
   - Showing appropriate error message

## Migration Guide

**Before** (manual auth handling):
```typescript
import axios from 'axios';

const response = await axios.get('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Manual error handling
if (response.status === 401) {
  logout();
}
```

**After** (automatic auth handling):
```typescript
import api from '@/utils/axios';

// Token and error handling is automatic
const response = await api.get('/api/endpoint');
```

## Error Handling

The system automatically handles:
- **401 Unauthorized**: Invalid or expired tokens
- **403 Forbidden**: Insufficient permissions
- **Network errors**: Connection issues
- **Token expiration**: Proactive checks before requests

All authentication errors result in:
1. Clearing `localStorage` token data
2. Redirecting to `/login` page
3. Preventing further API requests

## Security Features

- ✅ Automatic token expiration checking
- ✅ Secure token storage cleanup on errors
- ✅ Proactive authentication validation
- ✅ Centralized error handling
- ✅ Consistent redirect behavior
