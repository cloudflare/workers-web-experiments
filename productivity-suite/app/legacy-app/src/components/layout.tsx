import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { getBus } from "piercing-library";
import "./layout.css";

function Header() {
  const auth = useAuth();

  return (
    <header className="app-header">
      <NavLink to="/">
        <h1 className="app-title">Productivity Suite</h1>
      </NavLink>
      {auth && (
        <div className="user-section">
          <div className="user-info">
            <div className="account-icon">{accountIcon}</div>
            <span className="user-name">{auth.username}</span>
          </div>
          <button
            className="btn"
            onClick={() => getBus().dispatch("logout", null)}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

function NavBar() {
  return (
    <nav className="app-nav">
      <NavBarList />
      <NavBarSelect />
    </nav>
  );
}

const navBarPaths = [
  { path: "/todos", text: "Todo Lists" },
  { path: "/news", text: "News" },
  { path: "/calendar", text: "Calendar" },
  { path: "/contacts", text: "Contacts" },
];

function NavBarList() {
  return (
    <ul className="app-nav-list">
      {navBarPaths.map(({ path, text }) => (
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
  );
}

const expandMoreSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path
      xmlns="http://www.w3.org/2000/svg"
      d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z"
    />
  </svg>
);

function NavBarSelect() {
  const { pathname: currentPathname } = useLocation();
  const navigate = useNavigate();

  const [optionsOpen, setOptionsOpen] = useState(false);
  const toggleOptions = () => setOptionsOpen(!optionsOpen);

  const activeText = navBarPaths.find(({ path }) =>
    currentPathname.startsWith(path)
  )?.text;

  if (!activeText) return <></>;

  const selectOption = (path: string) => {
    navigate(path);
    setOptionsOpen(!optionsOpen);
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (event) => {
    const focusedElement = event.relatedTarget as Element;
    const focusIsContained = event.currentTarget.contains(focusedElement);
    if (!focusIsContained) {
      setOptionsOpen(false);
    }
  };

  return (
    <div onBlur={handleBlur} className="app-nav-select">
      <button className="selected" onClick={toggleOptions}>
        <span className="text">{activeText}</span>
        <span className={`icon ${optionsOpen ? "flipped" : ""}`}>
          {expandMoreSvg}
        </span>
      </button>
      {optionsOpen && (
        <div className="options">
          {navBarPaths
            .filter(({ text }) => text !== activeText)
            .map(({ path, text }) => (
              <button key={path} onClick={() => selectOption(path)}>
                {text}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="content">
        Piercing strategy migration demo. See the{" "}
        <a
          target="_blank"
          className="external-link"
          href="https://blog.cloudflare.com/fragment-piercing/"
        >
          blog post {openInNewIcon}
        </a>
        .
      </div>
      <div className="links-and-copyright">
        <div className="link-icons">
          <a
            className="gh-link"
            target="_blank"
            href="https://github.com/cloudflare/workers-web-experiments/tree/main/productivity-suite"
          >
            {githubIcon}
          </a>
          <a
            className="cloudflare-link"
            target="_blank"
            href="https://workers.cloudflare.com/"
          >
            {workersLogo}
          </a>
        </div>
        <span>&copy; 2022 Cloudflare.com</span>
      </div>
    </footer>
  );
}

export function Layout() {
  const auth = useAuth();

  const isAuthenticated = !!auth?.username;

  return (
    <div className="layout">
      <Header />
      {isAuthenticated && <NavBar />}
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const accountIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="48"
    width="48"
    viewBox="0 0 48 48"
  >
    <path d="M12.4 35.5q2.75-1.85 5.5-2.925Q20.65 31.5 24 31.5q3.35 0 6.1 1.075 2.75 1.075 5.5 2.925 2.15-2.25 3.425-5.15Q40.3 27.45 40.3 24q0-6.8-4.75-11.55Q30.8 7.7 24 7.7q-6.8 0-11.55 4.75Q7.7 17.2 7.7 24q0 3.45 1.275 6.35 1.275 2.9 3.425 5.15ZM24 24.55q-2.4 0-4.025-1.65-1.625-1.65-1.625-4 0-2.4 1.65-4.025 1.65-1.625 4-1.625 2.4 0 4.025 1.65 1.625 1.65 1.625 4 0 2.4-1.65 4.025-1.65 1.625-4 1.625Zm0 16.85q-3.65 0-6.8-1.35t-5.525-3.725Q9.3 33.95 7.95 30.8 6.6 27.65 6.6 24t1.35-6.8q1.35-3.15 3.725-5.525Q14.05 9.3 17.2 7.95 20.35 6.6 24 6.6t6.8 1.35q3.15 1.35 5.525 3.725Q38.7 14.05 40.05 17.2q1.35 3.15 1.35 6.8t-1.35 6.8q-1.35 3.15-3.725 5.525Q33.95 38.7 30.8 40.05 27.65 41.4 24 41.4Zm0-1.1q2.85 0 5.7-1.025t5-2.975q-2.15-1.7-4.875-2.7-2.725-1-5.825-1t-5.85.975q-2.75.975-4.8 2.725 2.1 1.95 4.95 2.975Q21.15 40.3 24 40.3Zm0-16.85q1.95 0 3.25-1.3t1.3-3.25q0-1.95-1.3-3.25T24 14.35q-1.95 0-3.25 1.3t-1.3 3.25q0 1.95 1.3 3.25t3.25 1.3Zm0-4.55Zm0 17.55Z" />
  </svg>
);

const workersLogo = (
  <svg viewBox="0 0 450 375">
    <title>Cloudflare Workers Logo</title>
    <defs>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-a"
        x1="50%"
        x2="25.7%"
        y1="100%"
        y2="8.7%"
      >
        <stop offset="0%" stopColor="#eb6f07"></stop>
        <stop offset="100%" stopColor="#fab743"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-b"
        x1="81%"
        x2="40.5%"
        y1="83.7%"
        y2="29.5%"
      >
        <stop offset="0%" stopColor="#d96504"></stop>
        <stop offset="100%" stopColor="#d96504" stopOpacity="0"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-c"
        x1="42%"
        x2="84%"
        y1="8.7%"
        y2="79.9%"
      >
        <stop offset="0%" stopColor="#eb6f07"></stop>
        <stop offset="100%" stopColor="#eb720a" stopOpacity="0"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-d"
        x1="50%"
        x2="25.7%"
        y1="100%"
        y2="8.7%"
      >
        <stop offset="0%" stopColor="#ee6f05"></stop>
        <stop offset="100%" stopColor="#fab743"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-e"
        x1="-33.2%"
        x2="91.7%"
        y1="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#d96504" stopOpacity=".8"></stop>
        <stop offset="49.8%" stopColor="#d96504" stopOpacity=".2"></stop>
        <stop offset="100%" stopColor="#d96504" stopOpacity="0"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-f"
        x1="50%"
        x2="25.7%"
        y1="100%"
        y2="8.7%"
      >
        <stop offset="0%" stopColor="#ffa95f"></stop>
        <stop offset="100%" stopColor="#ffebc8"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-g"
        x1="8.1%"
        x2="96.5%"
        y1="1.1%"
        y2="48.8%"
      >
        <stop offset="0%" stopColor="#fff" stopOpacity=".5"></stop>
        <stop offset="100%" stopColor="#fff" stopOpacity=".1"></stop>
      </linearGradient>
      <linearGradient
        id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-h"
        x1="-13.7%"
        y1="104.2%"
        y2="46.2%"
      >
        <stop offset="0%" stopColor="#fff" stopOpacity=".5"></stop>
        <stop offset="100%" stopColor="#fff" stopOpacity=".1"></stop>
      </linearGradient>
    </defs>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-a)"
      d="M107 5.4l49 88.4-45 81a26 26 0 0 0 0 25.3l45 81.2-49 88.4A52 52 0 0 1 85 349L7 213.5a52.2 52.2 0 0 1 0-52L85 26a52 52 0 0 1 22-20.6z"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-b)"
      d="M111 174.9a26 26 0 0 0 0 25.2l45 81.2-49 88.4A52 52 0 0 1 85 349L7 213.5C.8 202.8 35.5 190 111 175z"
      opacity=".7"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-c)"
      d="M112 14.3l44 79.5-7.3 12.7-38.8-65.7C98.7 22.5 81.6 32 60.2 69l3.2-5.5L85 26a52 52 0 0 1 21.8-20.6l5.1 8.9z"
      opacity=".5"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-d)"
      d="M331 26l78 135.5c9.3 16 9.3 36 0 52L331 349a52 52 0 0 1-45 26h-78l97-174.9a26 26 0 0 0 0-25.2L208 0h78a52 52 0 0 1 45 26z"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-e)"
      d="M282 374.4l-77 .7 93.2-175.8a27 27 0 0 0 0-25.4L205 0h17.6l97.8 173.1a27 27 0 0 1-.1 26.8 15624 15624 0 0 0-62.7 110c-19 33.4-10.8 54.9 24.4 64.5z"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-f)"
      d="M130 375c-8 0-16-1.9-23-5.3l96.2-173.5c3-5.4 3-12 0-17.4L107 5.4A52 52 0 0 1 130 0h78l97 174.9a26 26 0 0 1 0 25.2L208 375h-78z"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-g)"
      d="M298.2 178.8L199 0h9l97 174.9a26 26 0 0 1 0 25.2L208 375h-9l99.2-178.8c3-5.4 3-12 0-17.4z"
      opacity=".6"
    ></path>
    <path
      fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-h)"
      d="M203.2 178.8L107 5.4c3-1.6 6.6-2.8 10-3.8 21.2 38.1 52.5 95.9 94 173.3a26 26 0 0 1 0 25.2L115.5 373c-3.4-1-5.2-1.7-8.4-3.2l96-173.5c3-5.4 3-12 0-17.4z"
      opacity=".6"
    ></path>
  </svg>
);

const githubIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Github Logo</title>
    <path
      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      fill="#FFFFFF"
    />
  </svg>
);

const openInNewIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="48"
    width="48"
    viewBox="0 0 48 48"
  >
    <path d="M9.9 41q-1.2 0-2.05-.85Q7 39.3 7 38.1V9.9q0-1.2.85-2.05Q8.7 7 9.9 7h12.55v2.25H9.9q-.25 0-.45.2t-.2.45v28.2q0 .25.2.45t.45.2h28.2q.25 0 .45-.2t.2-.45V25.55H41V38.1q0 1.2-.85 2.05-.85.85-2.05.85Zm9.3-10.6-1.6-1.6L37.15 9.25H26.5V7H41v14.5h-2.25V10.9Z" />
  </svg>
);
