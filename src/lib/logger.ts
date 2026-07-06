/**
 * Production-safe logger
 * 
 * In development: logs to console
 * In production: sends to backend, nothing visible to client
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  /**
   * Log general information (development only)
   */
  log(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, context || '');
    }
  }

  /**
   * Log warnings (development only)
   */
  warn(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Log errors - sends to backend in production
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }

    // In production, send to backend logging service
    if (isProduction && typeof window !== 'undefined') {
      this.sendToBackend({
        level: 'error',
        message,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : String(error),
        context,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log info messages (production-safe, no sensitive data)
   */
  info(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Debug logs (development only)
   */
  debug(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Server-side logging for Vercel functions
   * These go to Vercel logs, not browser console
   */
  serverError(message: string, error?: Error | unknown, context?: LogContext) {
    // Always log server errors (they go to Vercel logs, not browser)
    console.error('[SERVER ERROR]', message, {
      error: error instanceof Error ? {
        message: error.message,
        code: (error as any).code,
        stack: error.stack
      } : String(error),
      context,
      timestamp: new Date().toISOString()
    });
  }

  serverInfo(message: string, context?: LogContext) {
    console.log('[SERVER INFO]', message, context || '');
  }

  serverWarn(message: string, context?: LogContext) {
    console.warn('[SERVER WARN]', message, context || '');
  }

  /**
   * Send logs to backend endpoint
   */
  private sendToBackend(payload: unknown) {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Silently fail if logging endpoint is unavailable
      // Don't create infinite loops or expose errors to client
    });
  }

  /**
   * Sanitize sensitive data from logs
   */
  sanitize(data: LogContext): LogContext {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization'];
    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

export const logger = new Logger();
