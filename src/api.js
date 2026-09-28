// Relative URL works on Android and behind an HTTPS reverse proxy.
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
