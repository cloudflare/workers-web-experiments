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

const todosPageTitles = {
  title: "Todo Lists",
  subTitle:
    "Create and manage various lists of todos so that you never skip a bit.",
};

const pageTitlesMap: { [path: string]: { title: string; subTitle?: string } } =
  {
    "/todos": todosPageTitles,
    "/": todosPageTitles,
    "/calendar": {
      title: "Calendar",
      subTitle: "Check your calendar and organize meetings with your team.",
    },
    "/contacts": {
      title: "Contacts",
      subTitle: "View and manage the company contacts here.",
    },
    "/news": {
      title: "News",
      subTitle:
        "Real all the latest company news, so that you can be always up to date.",
    },
  };

function getPageTitle(path: string): string | undefined {
  const pageTitleDetails = pageTitlesMap[path];
  if (pageTitleDetails) return pageTitleDetails.title;

  if (/\/todos\/[^/]?/.test(path)) {
    return pageTitlesMap["/todos"].title;
  }
}

function getPageSubTitle(path: string): string | undefined {
  const pageTitleDetails = pageTitlesMap[path];
  if (pageTitleDetails) return pageTitleDetails.subTitle;

  if (/\/todos\/[^/]?/.test(path)) {
    return pageTitlesMap["/todos"].subTitle;
  }
}

export function Layout() {
  const location = useLocation();

  const path = location.pathname;
  const isLoginPage = path === "/login";
  const pageTitle = getPageTitle(path);
  const pageSubTitle = getPageSubTitle(path);

  return (
    <div className="layout">
      <Header />
      {!isLoginPage && <NavBar />}
      <main className="app-main">
        {pageTitle && (
          <div className="app-page-heading">
            <h2 className="app-page-title">{pageTitle}</h2>
            {pageSubTitle && (
              <p className="app-page-sub-title">{pageSubTitle}</p>
            )}
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
