const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

export const setCookieValue = (name: string, value: string, maxAgeSeconds: number): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
};

export const removeCookieValue = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const fromStorage = localStorage.getItem('rentmate_token');
  if (fromStorage) return fromStorage;
  return getCookieValue('rentmate_token');
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_token', token);
  setCookieValue('rentmate_token', token, 30 * 24 * 60 * 60); // 30 days
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const fromStorage = localStorage.getItem('rentmate_refresh_token');
  if (fromStorage) return fromStorage;
  return getCookieValue('rentmate_refresh_token');
};

export const setStoredRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_refresh_token', token);
  setCookieValue('rentmate_refresh_token', token, 90 * 24 * 60 * 60); // 90 days
};

export const getStoredUser = <T = any>(): T | null => {
  if (typeof window === 'undefined') return null;
  const fromStorage = localStorage.getItem('rentmate_user');
  if (fromStorage) {
    try {
      return JSON.parse(fromStorage);
    } catch {
      // ignore
    }
  }
  const fromCookie = getCookieValue('rentmate_user');
  if (fromCookie) {
    try {
      return JSON.parse(fromCookie);
    } catch {
      // ignore
    }
  }
  return null;
};

export const setStoredUser = (user: any): void => {
  if (typeof window === 'undefined' || !user) return;
  const serialized = JSON.stringify(user);
  localStorage.setItem('rentmate_user', serialized);
  setCookieValue('rentmate_user', serialized, 30 * 24 * 60 * 60);
};

export const setStoredTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_token', accessToken);
  setCookieValue('rentmate_token', accessToken, 30 * 24 * 60 * 60);
  if (refreshToken) {
    localStorage.setItem('rentmate_refresh_token', refreshToken);
    setCookieValue('rentmate_refresh_token', refreshToken, 90 * 24 * 60 * 60);
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rentmate_token');
  localStorage.removeItem('rentmate_refresh_token');
  localStorage.removeItem('rentmate_user');
  removeCookieValue('rentmate_token');
  removeCookieValue('rentmate_refresh_token');
  removeCookieValue('rentmate_user');
};

// State for concurrent silent refresh requests
let isRefreshing = false;
type RefreshSubscriber = {
  resolve: (newToken: string) => void;
  reject: (err: any) => void;
};
let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeTokenRefresh = (
  resolve: (newToken: string) => void,
  reject: (err: any) => void,
) => {
  refreshSubscribers.push({ resolve, reject });
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (err: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(err));
  refreshSubscribers = [];
};

export interface RefreshResult {
  token: string | null;
  status: 'SUCCESS' | 'EXPIRED' | 'NETWORK_ERROR';
}

/**
 * Perform silent token rotation / cycling (Endless Session)
 * Calls /auth/refresh with the stored refresh token.
 * On success, saves both new access token and new refresh token.
 */
export async function refreshTokensSilently(): Promise<RefreshResult> {
  const currentRefreshToken = getStoredRefreshToken();
  if (!currentRefreshToken) {
    return { token: null, status: 'EXPIRED' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (response.status === 401 || response.status === 403) {
      return { token: null, status: 'EXPIRED' };
    }

    if (!response.ok) {
      return { token: null, status: 'NETWORK_ERROR' };
    }

    const json = await response.json();
    if (json.success && json.data?.accessToken) {
      setStoredTokens(json.data.accessToken, json.data.refreshToken);
      return { token: json.data.accessToken, status: 'SUCCESS' };
    }
    return { token: null, status: 'EXPIRED' };
  } catch {
    return { token: null, status: 'NETWORK_ERROR' };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getStoredToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const isAuthEndpoint =
        endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/register') ||
        endpoint.includes('/auth/refresh') ||
        endpoint.includes('/auth/google');

      // Intercept 401 Unauthorized for Seamless Token Cycling
      if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
        const refreshToken = getStoredRefreshToken();

        if (refreshToken) {
          // If a refresh is already in flight, queue this request until it completes
          if (isRefreshing) {
            return new Promise<ApiResponse<T>>((resolve, reject) => {
              subscribeTokenRefresh(
                async (newToken) => {
                  try {
                    const retryHeaders = {
                      ...headers,
                      Authorization: `Bearer ${newToken}`,
                    };
                    const retryRes = await fetch(url, {
                      ...options,
                      headers: retryHeaders,
                    });
                    const retryData = await retryRes.json().catch(() => ({}));
                    if (!retryRes.ok) {
                      reject(
                        new ApiError(
                          retryData.message || 'Request failed after refresh',
                          retryRes.status,
                          retryData.errors,
                        ),
                      );
                    } else {
                      resolve(retryData);
                    }
                  } catch (err: any) {
                    reject(err);
                  }
                },
                (err) => reject(err),
              );
            });
          }

          // Initiate silent refresh
          isRefreshing = true;
          try {
            const refreshRes = await refreshTokensSilently();
            if (refreshRes.status === 'SUCCESS' && refreshRes.token) {
              onRefreshed(refreshRes.token);

              // Retry the original request with the new rotated access token
              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${refreshRes.token}`,
              };
              const retryRes = await fetch(url, {
                ...options,
                headers: retryHeaders,
              });
              const retryData = await retryRes.json().catch(() => ({}));

              if (!retryRes.ok) {
                throw new ApiError(
                  retryData.message || `Request failed with status ${retryRes.status}`,
                  retryRes.status,
                  retryData.errors,
                );
              }

              return retryData;
            } else if (refreshRes.status === 'EXPIRED') {
              // Refresh token is completely expired or revoked
              const err = new ApiError('Session expired. Please log in again.', 401);
              onRefreshFailed(err);
              clearStoredAuth();
              if (
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')
              ) {
                window.location.href = '/login';
              }
              throw err;
            } else {
              // Temporary server or network failure: do not clear auth
              const err = new ApiError('Tidak dapat terhubung ke server backend.', 503);
              onRefreshFailed(err);
              throw err;
            }
          } finally {
            isRefreshing = false;
          }
        } else {
          clearStoredAuth();
          if (
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')
          ) {
            window.location.href = '/login';
          }
        }
      }

      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data.errors,
      );
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    const isNetworkError =
      err?.name === 'TypeError' &&
      (err?.message?.includes('fetch') || err?.message?.includes('NetworkError'));
    const message = isNetworkError
      ? 'Tidak dapat terhubung ke server backend (Network connection failed). Pastikan backend aktif.'
      : err?.message || 'Network connection failed';
    throw new ApiError(message, 503);
  }
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  upload: <T = any>(url: string, formData: FormData) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: formData,
    }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};