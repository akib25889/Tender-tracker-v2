/**
 * Central API Configuration for TenderTracker Command Center
 * Automatically adapts between local development and deployed production environments.
 */

export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

export const BACKEND_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');

