/**
 * Environment configuration for the frontend application
 */

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Feature flags
export const FEATURES = {
  GITHUB_INTEGRATION: process.env.NEXT_PUBLIC_FEATURE_GITHUB === 'true',
  DOCUMENT_UPLOAD: process.env.NEXT_PUBLIC_FEATURE_DOCUMENT_UPLOAD === 'true',
};

// Application settings
export const APP_CONFIG = {
  APP_NAME: 'Open Deep Research',
  APP_DESCRIPTION: 'Technical Due Diligence Platform powered by AI agents',
};
