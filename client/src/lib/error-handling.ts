import { toast } from "@/hooks/use-toast";
import { useTranslation } from "./multilingual";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}

export class ErrorHandler {
  private t: (key: string) => string;
  
  constructor(t: (key: string) => string) {
    this.t = t;
  }

  handleError(error: any, context?: string): AppError {
    let appError: AppError;

    // Parse different error types
    if (error?.response?.status) {
      appError = this.handleHttpError(error);
    } else if (error?.code) {
      appError = this.handleSystemError(error);
    } else if (typeof error === 'string') {
      appError = {
        code: 'GENERIC_ERROR',
        message: error,
        retryable: true
      };
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: this.t('error.generic'),
        retryable: true
      };
    }

    // Show user-friendly toast
    this.showErrorToast(appError, context);
    
    // Log for debugging
    console.error(`[${context || 'APP'}] Error:`, error, appError);

    return appError;
  }

  private handleHttpError(error: any): AppError {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          message: data?.error || this.t('error.validation'),
          details: data,
          retryable: false
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: this.t('error.unauthorized'),
          retryable: false
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: this.t('error.forbidden'),
          retryable: false
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: this.t('error.notfound'),
          retryable: false
        };
      case 413:
        return {
          code: 'FILE_TOO_LARGE',
          message: this.t('error.fileSize'),
          retryable: false
        };
      case 429:
        return {
          code: 'RATE_LIMITED',
          message: this.t('error.rateLimit'),
          retryable: true
        };
      case 500:
      case 502:
      case 503:
        return {
          code: 'SERVER_ERROR',
          message: this.t('error.server'),
          retryable: true
        };
      default:
        return {
          code: 'HTTP_ERROR',
          message: data?.error || this.t('error.network'),
          retryable: true
        };
    }
  }

  private handleSystemError(error: any): AppError {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return {
          code: 'NETWORK_ERROR',
          message: this.t('error.network'),
          retryable: true
        };
      case 'TIMEOUT':
        return {
          code: 'TIMEOUT',
          message: this.t('error.timeout'),
          retryable: true
        };
      case 'PERMISSION_DENIED':
        return {
          code: 'PERMISSION_DENIED',
          message: this.t('error.permissions'),
          retryable: false
        };
      default:
        return {
          code: error.code,
          message: error.message || this.t('error.generic'),
          retryable: true
        };
    }
  }

  private showErrorToast(error: AppError, context?: string) {
    const title = context ? `${context}: ${this.t('error.title')}` : this.t('error.title');
    
    toast({
      title,
      description: error.message,
      variant: "destructive",
      action: error.retryable ? {
        altText: this.t('action.retry'),
        children: this.t('action.retry'),
        onClick: () => {
          // Retry action would be handled by the calling component
        }
      } : undefined
    });
  }

  // Specific error handlers for common scenarios
  handleMediaError(error: any): AppError {
    if (error.message?.includes('file size')) {
      return {
        code: 'FILE_TOO_LARGE',
        message: this.t('error.fileSize'),
        retryable: false
      };
    }
    
    if (error.message?.includes('file type')) {
      return {
        code: 'INVALID_FILE_TYPE',
        message: this.t('error.filetype'),
        retryable: false
      };
    }

    if (error.message?.includes('photo limit')) {
      return {
        code: 'PHOTO_LIMIT_EXCEEDED',
        message: this.t('error.photoLimit'),
        retryable: false
      };
    }

    if (error.message?.includes('video limit')) {
      return {
        code: 'VIDEO_LIMIT_EXCEEDED',
        message: this.t('error.videoLimit'),
        retryable: false
      };
    }

    return this.handleError(error, 'Media Upload');
  }

  handleValidationError(field: string, error: any): AppError {
    let message = this.t('error.required');
    
    if (error.message?.includes('email')) {
      message = this.t('error.invalidEmail');
    } else if (error.message?.includes('required')) {
      message = this.t('error.required');
    }

    return {
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`,
      retryable: false
    };
  }

  handleNetworkError(): AppError {
    return {
      code: 'NETWORK_ERROR',
      message: this.t('error.network'),
      retryable: true
    };
  }
}

// Hook for error handling
export function useErrorHandler(language = 'en') {
  const { t } = useTranslation(language);
  const errorHandler = new ErrorHandler(t);
  
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleMediaError: errorHandler.handleMediaError.bind(errorHandler),
    handleValidationError: errorHandler.handleValidationError.bind(errorHandler),
    handleNetworkError: errorHandler.handleNetworkError.bind(errorHandler)
  };
}