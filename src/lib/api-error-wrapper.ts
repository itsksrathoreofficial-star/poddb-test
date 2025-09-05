/**
 * API Error Wrapper Utility
 * Provides consistent error handling for all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorTracker } from './error-tracking';

export interface APIErrorContext {
  request: NextRequest;
  route: string;
  method: string;
  userId?: string;
  additionalData?: any;
}

/**
 * Wrapper for API routes to handle errors consistently
 */
export function withAPIErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error('API route error:', error);
      
      // Log error to tracking system
      try {
        const errorId = await errorTracker.logServerError(error, {
          pageUrl: request.url,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: getClientIP(request) || undefined,
          userId: context?.userId,
          additionalData: {
            method: request.method,
            route: context?.route || 'unknown',
            ...context?.additionalData
          }
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Internal server error',
            errorId: errorId || 'unknown',
            message: 'Something went wrong. Our team has been notified.'
          },
          { status: 500 }
        );
      } catch (loggingError) {
        console.error('Failed to log API error:', loggingError);
        
        return NextResponse.json(
          {
            success: false,
            error: 'Internal server error',
            message: 'Something went wrong. Please try again later.'
          },
          { status: 500 }
        );
      }
    }
  };
}

/**
 * Wrapper for database operations with error handling
 */
export function withDatabaseErrorHandling<T extends any[], R>(
  operation: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<{ success: boolean; data?: R; error?: string; errorId?: string }> => {
    try {
      const data = await operation(...args);
      return { success: true, data };
    } catch (error: any) {
      console.error('Database operation error:', error);
      
      try {
        const errorId = await errorTracker.logDatabaseError(error, {
          additionalData: {
            operation: operation.name,
            args: args.length
          }
        });
        
        return {
          success: false,
          error: 'Database operation failed',
          errorId: errorId || 'unknown'
        };
      } catch (loggingError) {
        console.error('Failed to log database error:', loggingError);
        
        return {
          success: false,
          error: 'Database operation failed'
        };
      }
    }
  };
}

/**
 * Wrapper for external API calls with error handling
 */
export function withExternalAPIErrorHandling<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<{ success: boolean; data?: R; error?: string; errorId?: string }> => {
    try {
      const data = await apiCall(...args);
      return { success: true, data };
    } catch (error: any) {
      console.error('External API call error:', error);
      
      try {
        const errorId = await errorTracker.logAPIError(error, {
          additionalData: {
            apiCall: apiCall.name,
            args: args.length
          }
        });
        
        return {
          success: false,
          error: 'External API call failed',
          errorId: errorId || 'unknown'
        };
      } catch (loggingError) {
        console.error('Failed to log API call error:', loggingError);
        
        return {
          success: false,
          error: 'External API call failed'
        };
      }
    }
  };
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return null;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  errorId?: string,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorId: errorId || 'unknown',
      details: details || {}
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Operation successful'
    },
    { status }
  );
}
