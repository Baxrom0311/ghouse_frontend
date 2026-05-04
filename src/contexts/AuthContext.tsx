import React, {
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  AUTH_INVALIDATED_EVENT,
  apiFetch,
  BackendUser,
  clearStoredUser,
  invalidateStoredSession,
  LoginResponse,
  setStoredToken,
  USER_STORAGE_KEY,
  isAbortError,
} from "@/lib/api";
import { AuthContext, type User } from "@/contexts/auth-context";

function mapBackendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name ?? "",
  };
}

function isStoredUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.firstName === "string" &&
    typeof candidate.lastName === "string"
  );
}

function storeUser(user: User) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthInvalidated = () => {
      setUser(null);
      setIsLoading(false);
      clearStoredUser();
    };

    window.addEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as unknown;
        if (isStoredUser(parsedUser)) {
          setUser(parsedUser);
        } else {
          clearStoredUser();
        }
      } catch {
        clearStoredUser();
      }
    }

    const abortController = new AbortController();

    void apiFetch<BackendUser>("/auth/whoami", {
      signal: abortController.signal,
    })
      .then((backendUser) => {
        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        storeUser(mappedUser);
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }
        invalidateStoredSession();
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
      window.removeEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
    };
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
    void apiFetch<void>("/auth/logout", { method: "POST" }, false).catch(
      () => undefined,
    );
    invalidateStoredSession();
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
        isLoading,
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
