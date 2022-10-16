import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import "./layout.css";

function Header() {
  const auth = useAuth();

  return (
    <header className="app-header">
      <h1 className="app-title">Productivity Suite</h1>
      {auth.user && (
        <div>
          <span>{auth.user}</span>
          <button className="btn" onClick={auth.logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

function NavBar() {
  const navBarLinks = [
    { path: "/todos", text: "Todo Lists" },
    { path: "/calendar", text: "Calendar" },
    { path: "/contacts", text: "Contacts" },
    { path: "/news", text: "News" },
  ];

  return (
    <nav className="app-nav">
      <ul>
        {navBarLinks.map(({ path, text }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {text}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <p>&copy; 2022 Cloudflare.com</p>
    </footer>
  );
}

export function Layout() {
  const location = useLocation();

  const path = location.pathname;
  const isLoginPage = path === "/login";

  return (
    <div className="layout">
      <Header />
      {!isLoginPage && <NavBar />}
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
