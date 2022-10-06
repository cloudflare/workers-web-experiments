import { createContext, useContext } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { deleteCookie, getCookie, saveCookie } from "./cookies";

interface AuthContextType {
  user: any;
  login: (userName: string) => void;
  logout: () => void;
}

let AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = getCookie("current-user");

  const login = async (username: string) => {
    saveCookie("current-user", username);
  };

  const logout = () => {
    deleteCookie("current-user");
    navigate("/login");
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
