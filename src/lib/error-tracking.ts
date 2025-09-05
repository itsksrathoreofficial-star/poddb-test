/**
 * Comprehensive Error Tracking Service for PodDB
 * Captures, logs, and reports all application errors to admin panel
 */

import { supabase } from '@/integrations/supabase/client';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  pageUrl?: string;
  componentName?: string;
  functionName?: string;
  userAgent?: string;
  ipAddress?: string;
  countryCode?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  deviceType?: string;
  screenResolution?: string;
  viewportSize?: string;
  consoleLogs?: any[];
  networkLogs?: any[];
  performanceMetrics?: any;
  additionalData?: any;
}

export interface ErrorLog {
  errorType: 'javascript' | 'server' | 'database' | 'api' | 'permission' | 'validation' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  stackTrace?: string;
  filePath?: string;
  lineNumber?: number;
  functionName?: string;
  componentName?: string;
  context: ErrorContext;
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private consoleLogs: any[] = [];
  private networkLogs: any[] = [];
  private maxLogs = 50; // Maximum number of logs to keep in memory

  private constructor() {
    try {
      this.setupConsoleInterception();
      this.setupNetworkInterception();
      this.setupUnhandledErrorHandlers();
    } catch (error) {
      // Silently fail to avoid breaking the app
      if (typeof window !== 'undefined' && console && console.warn) {
        console.warn('Error tracking initialization failed:', error);
      }
    }
  }

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Log an error to the database and notify admins
   */
  public async logError(error: ErrorLog): Promise<string | null> {
    try {
      // Generate unique error ID
      const errorId = this.generateErrorId();
      
      // Get current user context
      const context = await this.enrichContext(error.context);
      
      // Prepare error data
      const errorData = {
        error_id: errorId,
        error_type: error.errorType,
        severity: error.severity,
        title: error.title,
        message: error.message,
        stack_trace: error.stackTrace,
        file_path: error.filePath,
        line_number: error.lineNumber,
        function_name: error.functionName,
        component_name: error.componentName,
        page_url: context.pageUrl || window.location.href,
        user_id: context.userId,
        session_id: context.sessionId,
        user_agent: context.userAgent || navigator.userAgent,
        ip_address: context.ipAddress,
        country_code: context.countryCode,
        browser: context.browser,
        browser_version: context.browserVersion,
        os: context.os,
        device_type: context.deviceType,
        screen_resolution: context.screenResolution,
        viewport_size: context.viewportSize,
        console_logs: this.consoleLogs.slice(-20), // Last 20 console logs
        network_logs: this.networkLogs.slice(-10), // Last 10 network logs
        performance_metrics: context.performanceMetrics || {},
        error_context: context.additionalData || {}
      };

      // Insert error into database
      const { data, error: dbError } = await supabase
        .from('error_logs')
        .insert([errorData] as any)
        .select('id')
        .single();

      if (dbError) {
        // Use a different method to avoid console interception
        if (typeof window !== 'undefined') {
          console.warn('Failed to log error to database:', dbError);
        }
        return null;
      }

      // Clear logs after successful logging
      this.clearLogs();
      
      return errorId;
    } catch (err) {
      // Use a different method to avoid console interception
      if (typeof window !== 'undefined') {
        console.warn('Error in logError:', err);
      }
      return null;
    }
  }

  /**
   * Log a JavaScript error
   */
  public async logJSError(
    error: Error,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'javascript',
      severity: this.determineSeverity(error),
      title: error.name || 'JavaScript Error',
      message: error.message,
      stackTrace: error.stack,
      filePath: this.extractFilePath(error.stack),
      lineNumber: this.extractLineNumber(error.stack),
      functionName: this.extractFunctionName(error.stack),
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log a server error
   */
  public async logServerError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'server',
      severity: this.determineSeverity(error),
      title: error.title || 'Server Error',
      message: error.message || String(error),
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log a database error
   */
  public async logDatabaseError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'database',
      severity: this.determineSeverity(error),
      title: 'Database Error',
      message: error.message || String(error),
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log an API error
   */
  public async logAPIError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'api',
      severity: this.determineSeverity(error),
      title: 'API Error',
      message: error.message || String(error),
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log a permission error
   */
  public async logPermissionError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'permission',
      severity: 'medium',
      title: 'Permission Error',
      message: error.message || 'Access denied',
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log a validation error
   */
  public async logValidationError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'validation',
      severity: 'low',
      title: 'Validation Error',
      message: error.message || 'Invalid input',
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Log a network error
   */
  public async logNetworkError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): Promise<string | null> {
    const errorLog: ErrorLog = {
      errorType: 'network',
      severity: 'medium',
      title: 'Network Error',
      message: error.message || 'Network request failed',
      stackTrace: error.stack,
      context: {
        ...context,
        pageUrl: context.pageUrl || window.location.href
      }
    };

    return this.logError(errorLog);
  }

  /**
   * Setup console interception to capture console logs
   */
  private setupConsoleInterception(): void {
    if (typeof window === 'undefined') return;
    
    // Check if console methods exist
    if (!console || typeof console !== 'object') return;

    const originalConsole = {
      log: console.log || (() => {}),
      warn: console.warn || (() => {}),
      error: console.error || (() => {}),
      info: console.info || (() => {})
    };

    const interceptConsole = (level: string) => {
      return (...args: any[]) => {
        try {
          // Call original console method
          const originalMethod = originalConsole[level as keyof typeof originalConsole];
          if (originalMethod && typeof originalMethod === 'function') {
            try {
              originalMethod.call(console, ...args);
            } catch (e) {
              // Fallback to basic console method
              if (level === 'error') console.error(...args);
              else if (level === 'warn') console.warn(...args);
              else if (level === 'log') console.log(...args);
              else if (level === 'info') console.info(...args);
            }
          }
          
          // Store log for error context
          this.consoleLogs.push({
            level,
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          });

          // Keep only last maxLogs entries
          if (this.consoleLogs.length > this.maxLogs) {
            this.consoleLogs = this.consoleLogs.slice(-this.maxLogs);
          }
        } catch (error) {
          // Silently fail to avoid infinite loops
          console.warn('Console interception error:', error);
        }
      };
    };

    console.log = interceptConsole('log');
    console.warn = interceptConsole('warn');
    console.error = interceptConsole('error');
    console.info = interceptConsole('info');
  }

  /**
   * Setup network interception to capture network requests
   */
  private setupNetworkInterception(): void {
    if (typeof window === 'undefined') return;
    
    // Check if required APIs exist
    if (!window.fetch || !XMLHttpRequest) return;

    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Intercept fetch requests
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        
        this.networkLogs.push({
          type: 'fetch',
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        });

        return response;
      } catch (error) {
        const endTime = Date.now();
        
        this.networkLogs.push({
          type: 'fetch',
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          statusText: 'Network Error',
          duration: endTime - startTime,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });

        throw error;
      }
    };

    // Intercept XMLHttpRequest
    (XMLHttpRequest.prototype as any).open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._method = method;
      (this as any)._url = url;
      (this as any)._startTime = Date.now();
      return originalXHROpen.call(this, method, url, ...args);
    };

    (XMLHttpRequest.prototype as any).send = function(...args: any[]) {
      const xhr = this as any;
      const originalOnLoad = xhr.onload;
      const originalOnError = xhr.onerror;

      xhr.onload = function() {
        if (originalOnLoad) originalOnLoad.call(this, new Event('load'));
        
        ErrorTrackingService.getInstance().networkLogs.push({
          type: 'xhr',
          url: xhr._url,
          method: xhr._method,
          status: xhr.status,
          statusText: xhr.statusText,
          duration: Date.now() - xhr._startTime,
          timestamp: new Date().toISOString()
        });
      };

      xhr.onerror = function() {
        if (originalOnError) originalOnError.call(this);
        
        ErrorTrackingService.getInstance().networkLogs.push({
          type: 'xhr',
          url: xhr._url,
          method: xhr._method,
          status: 0,
          statusText: 'Network Error',
          duration: Date.now() - xhr._startTime,
          timestamp: new Date().toISOString()
        });
      };

      return originalXHRSend.call(this, ...args);
    };
  }

  /**
   * Setup global error handlers
   */
  private setupUnhandledErrorHandlers(): void {
    if (typeof window === 'undefined') return;
    
    // Check if addEventListener exists
    if (!window.addEventListener) return;

    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logJSError(event.error || new Error(event.message), {
        filePath: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logJSError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { additionalData: { type: 'unhandled_promise_rejection' } }
      );
    });
  }

  /**
   * Enrich context with additional information
   */
  private async enrichContext(context: ErrorContext): Promise<ErrorContext> {
    const enriched: ErrorContext = { ...context };

    // Get user info from Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        enriched.userId = user.id;
      }
    } catch (error) {
      // Ignore auth errors
    }

    // Get session ID
    if (!enriched.sessionId) {
      enriched.sessionId = this.getSessionId();
    }

    // Get browser info
    if (!enriched.userAgent) {
      enriched.userAgent = navigator.userAgent;
    }

    // Get device info
    if (!enriched.deviceType) {
      enriched.deviceType = this.getDeviceType();
    }

    // Get screen info
    if (!enriched.screenResolution) {
      enriched.screenResolution = `${screen.width}x${screen.height}`;
    }

    if (!enriched.viewportSize) {
      enriched.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    }

    // Get performance metrics
    if (typeof performance !== 'undefined') {
      enriched.performanceMetrics = {
        navigation: performance.getEntriesByType('navigation')[0],
        memory: (performance as any).memory,
        timing: performance.timing
      };
    }

    return enriched;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ERR-${dateStr}-${randomStr}`;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      return 'low'; // Chunk loading errors are usually not critical
    }
    
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return 'medium';
    }
    
    if (error.message?.includes('Permission') || error.message?.includes('Unauthorized')) {
      return 'high';
    }
    
    if (error.message?.includes('Database') || error.message?.includes('Internal Server')) {
      return 'critical';
    }
    
    return 'medium';
  }

  /**
   * Extract file path from stack trace
   */
  private extractFilePath(stack?: string): string | undefined {
    if (!stack) return undefined;
    const match = stack.match(/at.*?\((.+?):\d+:\d+\)/);
    return match ? match[1] : undefined;
  }

  /**
   * Extract line number from stack trace
   */
  private extractLineNumber(stack?: string): number | undefined {
    if (!stack) return undefined;
    const match = stack.match(/at.*?:(\d+):\d+\)/);
    return match ? parseInt(match[1]) : undefined;
  }

  /**
   * Extract function name from stack trace
   */
  private extractFunctionName(stack?: string): string | undefined {
    if (!stack) return undefined;
    const match = stack.match(/at\s+([^(]+)\s+\(/);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error_tracking_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('error_tracking_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Clear stored logs
   */
  private clearLogs(): void {
    this.consoleLogs = [];
    this.networkLogs = [];
  }
}

// Export singleton instance
export const errorTracker = ErrorTrackingService.getInstance();

// Export convenience functions
export const logError = (error: ErrorLog) => errorTracker.logError(error);
export const logJSError = (error: Error, context?: Partial<ErrorContext>) => errorTracker.logJSError(error, context);
export const logServerError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logServerError(error, context);
export const logDatabaseError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logDatabaseError(error, context);
export const logAPIError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logAPIError(error, context);
export const logPermissionError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logPermissionError(error, context);
export const logValidationError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logValidationError(error, context);
export const logNetworkError = (error: any, context?: Partial<ErrorContext>) => errorTracker.logNetworkError(error, context);
