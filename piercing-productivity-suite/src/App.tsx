import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, RequireAuth, RequireNotAuth } from "./auth";
import { Layout } from "./components/layout";
import { Login, TodoLists, Calendar, Contacts, News } from "./components/pages";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route
                element={
                  <RequireNotAuth>
                    <Outlet />
                  </RequireNotAuth>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
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
    <Route path="/" element={<TodoLists />} />
    <Route path="/todos" element={<TodoLists />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/contacts" element={<Contacts />} />
    <Route path="/news" element={<News />} />
  </Route>
);
