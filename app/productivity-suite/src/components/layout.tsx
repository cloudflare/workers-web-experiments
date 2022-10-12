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
          <button onClick={auth.logout}>Logout</button>
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
      <p>2022</p>
    </footer>
  );
}

const pageTitlesMap: { [path: string]: string } = {
  "/todos": "Todo Lists",
  "/": "Todo Lists",
  "/calendar": "Calendar",
  "/contacts": "Contacts",
  "/news": "News",
};

function getPageTitle(path: string) {
  const pageTitle = pageTitlesMap[path];
  if (pageTitle) return pageTitle;

  if (/\/todos\/[^/]?/.test(path)) {
    return pageTitlesMap["/todos"];
  }
}

export function Layout() {
  const location = useLocation();

  const path = location.pathname;
  const isLoginPage = path === "/login";
  const pageTitle = getPageTitle(path);

  return (
    <div className="layout">
      <Header />
      {!isLoginPage && <NavBar />}
      <main className="app-main">
        {pageTitle && <h2>{pageTitle}</h2>}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
