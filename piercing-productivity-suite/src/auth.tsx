import { createContext, useContext } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  login: (userName: string, password: string) => void;
  logout: () => void;
}

let AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const user = false;

  const login = async (userName: string, password: string) => {
    //...
  };

  const logout = () => {
    navigate("/login");
  };

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
