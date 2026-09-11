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

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rentmate_token');
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_token', token);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rentmate_refresh_token');
};

export const setStoredRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_refresh_token', token);
};

export const setStoredTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rentmate_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('rentmate_refresh_token', refreshToken);
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rentmate_token');
  localStorage.removeItem('rentmate_refresh_token');
  localStorage.removeItem('rentmate_user');
};

// State for concurrent silent refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(newToken: string) => void> = [];

const subscribeTokenRefresh = (callback: (newToken: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

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
              subscribeTokenRefresh(async (newToken) => {
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
              });
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
              onRefreshFailed();
              clearStoredAuth();
              if (
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')
              ) {
                window.location.href = '/login';
              }
              throw new ApiError('Session expired. Please log in again.', 401);
            } else {
              // Temporary server or network failure: do not clear auth
              onRefreshFailed();
              throw new ApiError('Tidak dapat terhubung ke server backend.', 503);
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
    throw new ApiError(err.message || 'Network connection failed', 500);
  }
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};