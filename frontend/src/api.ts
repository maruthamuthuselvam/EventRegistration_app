const API_URL = import.meta.env.VITE_API_URL || '';

export const API_BASE = `${API_URL}/api`;
export const UPLOAD_URL = `${API_URL}/api/upload`;
export const REPORT_URL = `${API_URL}/api/report`;

export default API_BASE;
