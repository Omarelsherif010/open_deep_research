import { API_BASE_URL } from './config';

/**
 * Custom error class for API errors with status code and message
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Handle API response and throw appropriate errors
 */
async function handleResponse(response: Response, errorPrefix: string) {
  if (response.status === 404) {
    throw new ApiError(`${errorPrefix}: Endpoint not found`, 404);
  } else if (response.status === 401) {
    throw new ApiError(`${errorPrefix}: Unauthorized`, 401);
  } else if (response.status === 403) {
    throw new ApiError(`${errorPrefix}: Forbidden`, 403);
  } else if (response.status === 500) {
    throw new ApiError(`${errorPrefix}: Server error`, 500);
  } else if (!response.ok) {
    throw new ApiError(`${errorPrefix}: ${response.statusText}`, response.status);
  }
  
  return response.json();
}

/**
 * Fetch available TDD domains
 */
export async function fetchDomains() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tdd/domains`);
    return handleResponse(response, 'Failed to fetch domains');
  } catch (error) {
    console.error('Error in fetchDomains:', error);
    throw error;
  }
}

/**
 * Fetch all projects
 */
export async function fetchProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/`);
    return handleResponse(response, 'Failed to fetch projects');
  } catch (error) {
    console.error('Error in fetchProjects:', error);
    throw error;
  }
}

/**
 * Create a new project
 */
export async function createProject(projectData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    return handleResponse(response, 'Failed to create project');
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
}

/**
 * Get a specific project by ID
 */
export async function getProject(projectId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
    return handleResponse(response, 'Failed to fetch project');
  } catch (error) {
    console.error('Error in getProject:', error);
    throw error;
  }
}