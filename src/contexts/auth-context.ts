import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
