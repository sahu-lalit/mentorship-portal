import type { User, UserRole } from '@/types';

export type BackendGoogleUser = {
  id: string;
  email: string;
  name: string;
  image?: string;
  isMentor?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUser = User & Omit<BackendGoogleUser, keyof User>;

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function saveAuth(params: { token: string; user: AuthUser }) {
  localStorage.setItem(TOKEN_KEY, params.token);
  localStorage.setItem(USER_KEY, JSON.stringify(params.user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function normalizeGoogleUser(backendUser: BackendGoogleUser, role: UserRole): AuthUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role,
    image: backendUser.image,
    isMentor: backendUser.isMentor,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
}
