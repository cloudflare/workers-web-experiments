import { parse } from "cookie";
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
  const user = getCookie("currentUser");

  const login = async (username: string) => {
    saveCookie("currentUser", username);
    addUserDataIfMissing(username);
  };

  const logout = () => {
    deleteCookie("currentUser");
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

async function addUserDataIfMissing(user: string) {
  const cookieName = `piercingDemoSuite_userData_${encodeURIComponent(user)}`;
  const cookies = parse(document.cookie || "");
  const cookie = cookies[`${cookieName}`];
  const data: { todoLists: { name: string; todos: any[] }[] } | null =
    (cookie && JSON.parse(decodeURIComponent(cookie))) ?? null;
  if (!data) {
    const newDataStr = JSON.stringify({
      todoLists: [
        {
          name: "new list",
          todos: [],
        },
      ],
    });
    saveCookie(`userData_${user}`, newDataStr);
  }
}
