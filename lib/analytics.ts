import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let posthogInstance: PostHog | null = null;

export const initializePostHog = async () => {
  if (!POSTHOG_API_KEY) {
    console.log('PostHog: API key not found, analytics disabled');
    return null;
  }

  try {
    posthogInstance = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
    });

    console.log('PostHog: Analytics initialized successfully');
    return posthogInstance;
  } catch (error) {
    console.error('PostHog: Failed to initialize analytics:', error);
    return null;
  }
};

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (posthogInstance) {
      posthogInstance.capture(event, properties);
    }
  },
  
  identify: (userId: string, properties?: Record<string, any>) => {
    if (posthogInstance) {
      posthogInstance.identify(userId, properties);
    }
  },
  
  screen: (screenName: string, properties?: Record<string, any>) => {
    if (posthogInstance) {
      posthogInstance.screen(screenName, properties);
    }
  },
  
  reset: () => {
    if (posthogInstance) {
      posthogInstance.reset();
    }
  }
};

export default posthogInstance;