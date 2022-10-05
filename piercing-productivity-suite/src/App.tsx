import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, RequireAuth } from "./auth";
import { Layout } from "./components/layout";
import { Login } from "./components/pages/login";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              {ProtectedRoutes}
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

const ProtectedRoutes = (
  <Route
    element={
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    }
  >
    <Route path="/" element={<h2>TODO LIST</h2>} />
    <Route path="/todos" element={<h2>TODO LIST</h2>} />
    <Route path="/calendar" element={<h2>CALENDAR</h2>} />
  </Route>
);
