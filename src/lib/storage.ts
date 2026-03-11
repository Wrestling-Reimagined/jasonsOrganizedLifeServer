const AUTH_TOKEN_KEY = "plm_auth_token";

export const getToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
