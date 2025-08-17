/**
 * Configuration for Lexi API endpoints
 * Supports switching between staging and production environments
 */

export interface EndpointConfig {
  openbrain: string;
  memory: string;
  environment: 'staging' | 'production' | 'development';
}

/**
 * Get the current environment configuration
 */
export function getEnvironmentConfig(): EndpointConfig {
  const env = process.env.ENVIRONMENT || 'production';
  const isStaging = env === 'staging';
  const isDevelopment = env === 'development';
  
  if (isDevelopment) {
    return {
      openbrain: process.env.LEXI_OPENBRAIN_DEV_URL || 'http://localhost:8080',
      memory: process.env.LEXI_MEMORY_DEV_URL || 'http://localhost:8000',
      environment: 'development',
    };
  }
  
  if (isStaging) {
    return {
      openbrain: process.env.LEXI_OPENBRAIN_STAGING_URL || 
                 'https://lexi-open-brain-staging-484322485773.us-central1.run.app',
      memory: process.env.LEXI_MEMORY_STAGING_URL || 
              'https://lexi-memory-api-staging-484322485773.us-central1.run.app',
      environment: 'staging',
    };
  }
  
  // Production
  return {
    openbrain: process.env.LEXI_OPENBRAIN_API_URL || 
               'https://lexi-open-brain-service-484322485773.us-central1.run.app',
    memory: process.env.LEXI_MEMORY_API_URL || 
               'https://lexi-memory-api-service-484322485773.us-central1.run.app',
    environment: 'production',
  };
}

/**
 * Log the current endpoint configuration (for debugging)
 */
export function logEndpointConfig() {
  const config = getEnvironmentConfig();
  console.log('Lexi API Endpoints Configuration:', {
    environment: config.environment,
    openbrain: config.openbrain,
    memory: config.memory,
  });
}