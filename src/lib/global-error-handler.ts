/**
 * Global Error Handler for Server-Side Errors
 * Handles errors in API routes, server actions, and server components
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorTracker } from './error-tracking';

export interface ServerErrorContext {
  request?: NextRequest;
  route?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  additionalData?: any;
}

/**
 * Handle server-side errors and log them
 */
export async function handleServerError(
  error: any,
  context: ServerErrorContext = {}
): Promise<NextResponse> {
  try {
    // Log error to tracking system
    const errorId = await errorTracker.logServerError(error, {
      pageUrl: context.request?.url || context.route,
      userAgent: context.request?.headers.get('user-agent') || context.userAgent,
      ipAddress: getClientIP(context.request) || context.ipAddress,
      userId: context.userId,
      additionalData: {
        method: context.request?.method || context.method,
        ...context.additionalData
      }
    });

    // Return user-friendly error response
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
    console.error('Failed to log server error:', loggingError);
    
    // Fallback response if logging fails
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

/**
 * Handle database errors specifically
 */
export async function handleDatabaseError(
  error: any,
  context: ServerErrorContext = {}
): Promise<NextResponse> {
  try {
    const errorId = await errorTracker.logDatabaseError(error, {
      pageUrl: context.request?.url || context.route,
      userAgent: context.request?.headers.get('user-agent') || context.userAgent,
      ipAddress: getClientIP(context.request) || context.ipAddress,
      userId: context.userId,
      additionalData: {
        method: context.request?.method || context.method,
        ...context.additionalData
      }
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Database error',
        errorId: errorId || 'unknown',
        message: 'Unable to process your request. Please try again later.'
      },
      { status: 500 }
    );
  } catch (loggingError) {
    console.error('Failed to log database error:', loggingError);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database error',
        message: 'Unable to process your request. Please try again later.'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle API errors (external API calls)
 */
export async function handleAPIError(
  error: any,
  context: ServerErrorContext = {}
): Promise<NextResponse> {
  try {
    const errorId = await errorTracker.logAPIError(error, {
      pageUrl: context.request?.url || context.route,
      userAgent: context.request?.headers.get('user-agent') || context.userAgent,
      ipAddress: getClientIP(context.request) || context.ipAddress,
      userId: context.userId,
      additionalData: {
        method: context.request?.method || context.method,
        ...context.additionalData
      }
    });

    return NextResponse.json(
      {
        success: false,
        error: 'API error',
        errorId: errorId || 'unknown',
        message: 'Unable to connect to external service. Please try again later.'
      },
      { status: 502 }
    );
  } catch (loggingError) {
    console.error('Failed to log API error:', loggingError);
    
    return NextResponse.json(
      {
        success: false,
        error: 'API error',
        message: 'Unable to connect to external service. Please try again later.'
      },
      { status: 502 }
    );
  }
}

/**
 * Handle permission errors
 */
export async function handlePermissionError(
  error: any,
  context: ServerErrorContext = {}
): Promise<NextResponse> {
  try {
    const errorId = await errorTracker.logPermissionError(error, {
      pageUrl: context.request?.url || context.route,
      userAgent: context.request?.headers.get('user-agent') || context.userAgent,
      ipAddress: getClientIP(context.request) || context.ipAddress,
      userId: context.userId,
      additionalData: {
        method: context.request?.method || context.method,
        ...context.additionalData
      }
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Permission denied',
        errorId: errorId || 'unknown',
        message: 'You do not have permission to perform this action.'
      },
      { status: 403 }
    );
  } catch (loggingError) {
    console.error('Failed to log permission error:', loggingError);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Permission denied',
        message: 'You do not have permission to perform this action.'
      },
      { status: 403 }
    );
  }
}

/**
 * Handle validation errors
 */
export async function handleValidationError(
  error: any,
  context: ServerErrorContext = {}
): Promise<NextResponse> {
  try {
    const errorId = await errorTracker.logValidationError(error, {
      pageUrl: context.request?.url || context.route,
      userAgent: context.request?.headers.get('user-agent') || context.userAgent,
      ipAddress: getClientIP(context.request) || context.ipAddress,
      userId: context.userId,
      additionalData: {
        method: context.request?.method || context.method,
        ...context.additionalData
      }
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        errorId: errorId || 'unknown',
        message: error.message || 'Invalid input provided.',
        details: error.details || {}
      },
      { status: 400 }
    );
  } catch (loggingError) {
    console.error('Failed to log validation error:', loggingError);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        message: error.message || 'Invalid input provided.'
      },
      { status: 400 }
    );
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request?: NextRequest): string | null {
  if (!request) return null;
  
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
 * Wrapper for API routes to handle errors automatically
 */
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error('API route error:', error);
      return handleServerError(error, { request });
    }
  };
}

/**
 * Wrapper for server actions to handle errors automatically
 */
export function withServerActionErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<{ success: boolean; data?: R; error?: string; errorId?: string }> => {
    try {
      const data = await action(...args);
      return { success: true, data };
    } catch (error: any) {
      console.error('Server action error:', error);
      
      try {
        const errorId = await errorTracker.logServerError(error, {
          additionalData: { serverAction: true, args: args.length }
        });
        
        return {
          success: false,
          error: 'An error occurred while processing your request.',
          errorId: errorId || 'unknown'
        };
      } catch (loggingError) {
        console.error('Failed to log server action error:', loggingError);
        
        return {
          success: false,
          error: 'An error occurred while processing your request.'
        };
      }
    }
  };
}
