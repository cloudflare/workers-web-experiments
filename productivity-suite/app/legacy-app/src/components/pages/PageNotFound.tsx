import { Link } from "react-router-dom";

import "./PageNotFound.css";

const alertSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <title>Warning Icon</title>
    <path
      xmlns="http://www.w3.org/2000/svg"
      d="M6.5 39.4 24 9.2l17.5 30.2Zm1.9-1.1h31.2L24 11.4Zm15.65-3.25q.4 0 .625-.25.225-.25.225-.6 0-.4-.25-.625-.25-.225-.6-.225t-.6.25q-.25.25-.25.6t.25.6q.25.25.6.25Zm-.55-3.85h1.1V20.8h-1.1Zm.5-6.35Z"
    />
  </svg>
);

export function PageNotFoundPage() {
  return (
    <div className="page-not-found-page">
      <figure>{alertSvg}</figure>
      <div className="text-wrapper">
        <h2>404 - Page Not Found!</h2>
        <p>The page you're looking for could not be found.</p>
        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
