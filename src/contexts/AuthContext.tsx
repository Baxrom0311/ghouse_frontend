import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  apiFetch,
  BackendUser,
  clearStoredToken,
  LoginResponse,
  setStoredToken,
  USER_STORAGE_KEY,
} from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name ?? "",
  };
}

function storeUser(user: User) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearStoredUser();
      }
    }

    void apiFetch<BackendUser>("/auth/whoami")
      .then((backendUser) => {
        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        storeUser(mappedUser);
      })
      .catch(() => {
        clearStoredToken();
        clearStoredUser();
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await apiFetch<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    );

    const mappedUser = mapBackendUser(response.user);
    setStoredToken(response.access_token);
    setUser(mappedUser);
    storeUser(mappedUser);
    return true;
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<boolean> => {
    await apiFetch(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      },
      false,
    );

    return login(email, password);
  };

  const logout = () => {
    setUser(null);
    clearStoredToken();
    clearStoredUser();
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    const updatedUser = await apiFetch<BackendUser | User>("/auth/profile/edit", {
      method: "PATCH",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const normalizedUser =
      "first_name" in updatedUser
        ? mapBackendUser(updatedUser)
        : (updatedUser as User);
    setUser(normalizedUser);
    storeUser(normalizedUser);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    await apiFetch<void>("/auth/password/change", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
