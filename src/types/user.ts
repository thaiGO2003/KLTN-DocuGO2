export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin' | 'legal';
  department: string;
  position: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: {
    canUpload: boolean;
    canApprove: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canSign: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  department: string;
  position: string;
}