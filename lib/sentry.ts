import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';

export const initializeSentry = () => {
  if (!SENTRY_DSN || SENTRY_DSN.includes('dummy')) {
    console.log('Sentry: DSN not found or is dummy DSN, error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENV,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      enableAutoPerformanceTracing: Platform.OS !== 'web',
      tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
      beforeSend: (event) => {
        if (APP_ENV === 'development') {
          console.log('Sentry Event:', event);
        }
        return event;
      },
    });

    console.log('Sentry: Error tracking initialized successfully');
  } catch (error) {
    console.error('Sentry: Failed to initialize error tracking:', error);
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error (Sentry disabled):', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Message (Sentry disabled) [${level}]:`, message);
  }
};

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (SENTRY_DSN) {
    Sentry.setUser(user);
  }
};

export default Sentry;