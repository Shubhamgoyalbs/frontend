/**
 * Utility functions for handling JWT tokens
 */

interface JWTPayload {
    sub: string;        // Subject - contains user's email (backend uses email as username)
    roles: string[];    // User roles array with ROLE_ prefix
    userId: number;     // Now included in backend tokens!
    username: string;   // Actual username (not email) - now included!
    email: string;      // User's email - now included!
    role: string;       // Primary user role - now included!
    hostelName: string; // User's hostel - now included!
    roomNumber: string; // User's room - now included!
    exp: number;        // Expiration timestamp (seconds)
    iat: number;        // Issued at timestamp (seconds)
    type?: string;      // Token type (e.g., "refresh" for refresh tokens)
    [key: string]: unknown; // Allow additional custom claims
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        // JWT tokens have 3 parts separated by dots: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (second part)
        const payload = parts[1];
        
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        
        // Decode base64 and parse JSON
        const decodedPayload = JSON.parse(atob(paddedPayload));
        
        return decodedPayload as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
};

/**
 * Gets the user email from a JWT token (backend uses email as subject)
 * @param token - The JWT token
 * @returns The user email or null if not found
 */
export const getUserEmailFromToken = (token: string): string | null => {
    const payload = decodeJWT(token);
    return payload?.sub || null;
};

/**
 * Gets the user ID from a JWT token
 * @param token - The JWT token
 * @returns The user ID or null if not found
 */
export const getUserIdFromToken = (token: string): number | null => {
    const payload = decodeJWT(token);
    return payload?.userId || null;
};

/**
 * Gets the user roles from a JWT token
 * @param token - The JWT token
 * @returns Array of user roles or empty array if not found
 */
export const getUserRolesFromToken = (token: string): string[] => {
    const payload = decodeJWT(token);
    return payload?.roles || [];
};

/**
 * Gets the primary user role from a JWT token
 * @param token - The JWT token
 * @returns The first/primary role or null if not found
 */
export const getUserRoleFromToken = (token: string): string | null => {
    const roles = getUserRolesFromToken(token);
    return roles.length > 0 ? roles[0] : null;
};

/**
 * Checks if user has a specific role
 * @param token - The JWT token
 * @param role - The role to check for
 * @returns True if user has the role, false otherwise
 */
export const userHasRole = (token: string, role: string): boolean => {
    const roles = getUserRolesFromToken(token);
    return roles.includes(role);
};

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @returns True if expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload?.exp) {
        return true;
    }
    
    // JWT exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
};

/**
 * Gets the token expiration date
 * @param token - The JWT token
 * @returns Date object or null if not found
 */
export const getTokenExpirationDate = (token: string): Date | null => {
    const payload = decodeJWT(token);
    if (!payload?.exp) {
        return null;
    }
    // JWT exp is in seconds, convert to milliseconds
    return new Date(payload.exp * 1000);
};

/**
 * Gets the token issued date
 * @param token - The JWT token
 * @returns Date object or null if not found
 */
export const getTokenIssuedDate = (token: string): Date | null => {
    const payload = decodeJWT(token);
    if (!payload?.iat) {
        return null;
    }
    // JWT iat is in seconds, convert to milliseconds
    return new Date(payload.iat * 1000);
};

/**
 * Checks if token is a refresh token
 * @param token - The JWT token
 * @returns True if it's a refresh token, false otherwise
 */
export const isRefreshToken = (token: string): boolean => {
    const payload = decodeJWT(token);
    return payload?.type === 'refresh';
};

/**
 * Gets time until token expiration in milliseconds
 * @param token - The JWT token
 * @returns Milliseconds until expiration, or 0 if expired/invalid
 */
export const getTimeUntilExpiration = (token: string): number => {
    const payload = decodeJWT(token);
    if (!payload?.exp) {
        return 0;
    }
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeRemaining = expirationTime - currentTime;
    
    return Math.max(0, timeRemaining);
};

/**
 * Formats time remaining until expiration
 * @param token - The JWT token
 * @returns Human readable string of time remaining
 */
export const getFormattedTimeUntilExpiration = (token: string): string => {
    const timeRemaining = getTimeUntilExpiration(token);
    
    if (timeRemaining <= 0) {
        return 'Expired';
    }
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

// NEW UTILITY FUNCTIONS FOR COMPLETE USER INFORMATION

/**
 * Gets the actual username (not email) from a JWT token
 * @param token - The JWT token
 * @returns The username or null if not found
 */
export const getUsernameFromToken = (token: string): string | null => {
    const payload = decodeJWT(token);
    return payload?.username || null;
};

/**
 * Gets the user's primary role from JWT token (without ROLE_ prefix)
 * @param token - The JWT token
 * @returns The user role or null if not found
 */
export const getUserPrimaryRoleFromToken = (token: string): string | null => {
    const payload = decodeJWT(token);
    return payload?.role || null;
};

/**
 * Gets the user's hostel name from JWT token
 * @param token - The JWT token
 * @returns The hostel name or null if not found
 */
export const getUserHostelFromToken = (token: string): string | null => {
    const payload = decodeJWT(token);
    return payload?.hostelName || null;
};

/**
 * Gets the user's room number from JWT token
 * @param token - The JWT token
 * @returns The room number or null if not found
 */
export const getUserRoomFromToken = (token: string): string | null => {
    const payload = decodeJWT(token);
    return payload?.roomNumber || null;
};

/**
 * Gets complete user information from JWT token
 * @param token - The JWT token
 * @returns User info object or null if token is invalid
 */
export const getUserInfoFromToken = (token: string): {
    userId: number;
    username: string;
    email: string;
    role: string;
    hostelName: string;
    roomNumber: string;
    roles: string[];
} | null => {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    return {
        userId: payload.userId,
        username: payload.username,
        email: payload.email || payload.sub, // Fallback to subject if email not present
        role: payload.role,
        hostelName: payload.hostelName,
        roomNumber: payload.roomNumber,
        roles: payload.roles || [],
    };
};

/**
 * Validates that the token contains all required user information
 * @param token - The JWT token
 * @returns True if token has complete user info, false otherwise
 */
export const hasCompleteUserInfo = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return false;
    
    return !!(payload.userId && payload.username && payload.email && payload.role);
};

/**
 * Checks if user is an admin based on role
 * @param token - The JWT token
 * @returns True if user is admin, false otherwise
 */
export const isUserAdmin = (token: string): boolean => {
    const role = getUserPrimaryRoleFromToken(token);
    const roles = getUserRolesFromToken(token);
    
    return role === 'ADMIN' || roles.includes('ROLE_ADMIN');
};

/**
 * Checks if user is a seller based on role
 * @param token - The JWT token
 * @returns True if user is seller, false otherwise
 */
export const isUserSeller = (token: string): boolean => {
    const role = getUserPrimaryRoleFromToken(token);
    const roles = getUserRolesFromToken(token);
    
    return role === 'SELLER' || roles.includes('ROLE_SELLER');
};

/**
 * Checks if user is a regular user based on role
 * @param token - The JWT token
 * @returns True if user is regular user, false otherwise
 */
export const isUserRegular = (token: string): boolean => {
    const role = getUserPrimaryRoleFromToken(token);
    const roles = getUserRolesFromToken(token);
    
    return role === 'USER' || roles.includes('ROLE_USER');
};
