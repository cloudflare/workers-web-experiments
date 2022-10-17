import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import "./layout.css";

function Header() {
  const auth = useAuth();

  return (
    <header className="app-header">
      <NavLink to="/">
        <h1 className="app-title">Productivity Suite</h1>
      </NavLink>
      {auth.user && (
        <div className="user-section">
          <div className="user-info">
            <div className="account-icon">{accountIcon}</div>
            <span className="user-name">{auth.user}</span>
          </div>
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
      <p className="demo-details">
        This is a demo application for the piercing migration strategy
        implemented using{" "}
        <a target="_blank" href="https://workers.cloudflare.com/">
          Cloudflare Workers {openInNewIcon}
        </a>
        {/* href to update when the blog-post url is known */}. For more
        information check out the accompanying{" "}
        <a target="_blank" href="https://blog.cloudflare.com/404/">
          blog post {openInNewIcon}
        </a>
        .
      </p>
      <div className="social">
        <a
          className="social-link"
          target="_blank"
          href="https://www.cloudflare.com/"
        >
          {cloudflareIcon}
        </a>
        {/* Note: the links needs to be updated once this demo is merged */}
        <a
          className="social-link"
          target="_blank"
          href="https://github.com/cloudflare/workers-web-experiments/tree/productivity-suite-demo/migration-strategies/piercing"
        >
          {githubIcon}
        </a>
      </div>
      <hr />
      <p className="copyright">&copy; 2022 Cloudflare.com</p>
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

const cloudflareIcon = (
  <svg
    viewBox="0 0 256 116"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <title>Cloudflare Logo</title>
    <g>
      <g transform="translate(0.000000, -1.000000)">
        <path
          d="M202.3569,50.394 L197.0459,48.27 C172.0849,104.434 72.7859,70.289 66.8109,86.997 C65.8149,98.283 121.0379,89.143 160.5169,91.056 C172.5559,91.639 178.5929,100.727 173.4809,115.54 L183.5499,115.571 C195.1649,79.362 232.2329,97.841 233.7819,85.891 C231.2369,78.034 191.1809,85.891 202.3569,50.394 Z"
          fill="#FFFFFF"
        ></path>
        <path
          d="M176.332,109.3483 C177.925,104.0373 177.394,98.7263 174.739,95.5393 C172.083,92.3523 168.365,90.2283 163.585,89.6973 L71.17,88.6343 C70.639,88.6343 70.108,88.1033 69.577,88.1033 C69.046,87.5723 69.046,87.0413 69.577,86.5103 C70.108,85.4483 70.639,84.9163 71.701,84.9163 L164.647,83.8543 C175.801,83.3233 187.486,74.2943 191.734,63.6723 L197.046,49.8633 C197.046,49.3313 197.577,48.8003 197.046,48.2693 C191.203,21.1823 166.772,0.9993 138.091,0.9993 C111.535,0.9993 88.697,17.9953 80.73,41.8963 C75.419,38.1783 69.046,36.0533 61.61,36.5853 C48.863,37.6473 38.772,48.2693 37.178,61.0163 C36.647,64.2033 37.178,67.3903 37.71,70.5763 C16.996,71.1073 0,88.1033 0,109.3483 C0,111.4723 0,113.0663 0.531,115.1903 C0.531,116.2533 1.593,116.7843 2.125,116.7843 L172.614,116.7843 C173.676,116.7843 174.739,116.2533 174.739,115.1903 L176.332,109.3483 Z"
          fill="#F4811F"
        ></path>
        <path
          d="M205.5436,49.8628 L202.8876,49.8628 C202.3566,49.8628 201.8256,50.3938 201.2946,50.9248 L197.5766,63.6718 C195.9836,68.9828 196.5146,74.2948 199.1706,77.4808 C201.8256,80.6678 205.5436,82.7918 210.3236,83.3238 L229.9756,84.3858 C230.5066,84.3858 231.0376,84.9168 231.5686,84.9168 C232.0996,85.4478 232.0996,85.9788 231.5686,86.5098 C231.0376,87.5728 230.5066,88.1038 229.4436,88.1038 L209.2616,89.1658 C198.1076,89.6968 186.4236,98.7258 182.1746,109.3478 L181.1116,114.1288 C180.5806,114.6598 181.1116,115.7218 182.1746,115.7218 L252.2826,115.7218 C253.3446,115.7218 253.8756,115.1908 253.8756,114.1288 C254.9376,109.8798 255.9996,105.0998 255.9996,100.3188 C255.9996,72.7008 233.1616,49.8628 205.5436,49.8628"
          fill="#FAAD3F"
        ></path>
      </g>
    </g>
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
