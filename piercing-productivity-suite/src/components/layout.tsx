import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import "./layout.css";

function Header() {
  const auth = useAuth();

  return (
    <header>
      <h1>Piercing Productivity Suite</h1>
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
    <nav>
      <ul>
        {navBarLinks.map(({ path, text }) => (
          <li key={path}>
            <NavLink to={path}>{text}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer>
      <p>2022</p>
    </footer>
  );
}

export function Layout() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="layout">
      <Header />
      {!isLoginPage && <NavBar />}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
