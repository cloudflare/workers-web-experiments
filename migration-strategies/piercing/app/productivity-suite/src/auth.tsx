import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  deleteCurrentUser,
  getCurrentUser,
  getUserData,
  saveCurrentUser,
  setUserData,
} from "shared";

interface AuthContextType {
  user: string | null;
  login: (userName: string) => void;
  logout: () => void;
}

let AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<string | null>(getCurrentUser());

  const login = async (username: string) => {
    await saveCurrentUser(username);
    addUserDataIfMissing(username);
    setUser(username);
  };

  const logout = async () => {
    await deleteCurrentUser();
    navigate("/login");
    setUser(null);
  };

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireNotAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.user) {
    return <Navigate to={"/"} replace />;
  }

  return <>{children}</>;
}

async function addUserDataIfMissing(user: string) {
  const data = getUserData(user);
  if (!data) {
    const newDataStr = JSON.stringify({
      todoLists: [
        {
          name: "new list",
          todos: [],
        },
      ],
    });
    setUserData(user, newDataStr);
  }
}
