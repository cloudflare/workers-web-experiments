import { Children, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";

import "./UnimplementedDemoPage.css";

export function UnimplementedDemoPage({
  children: svg,
}: {
  children: ReactNode;
}) {
  const auth = useAuth();

  return (
    <div className="unimplemented-demo-page">
      <figure>{svg}</figure>
      <div className="text-wrapper">
        <p>This page is not implemented as it is out of scope for this demo.</p>
        <p>
          To Interact with SSR fragments view the login form by{" "}
          <button>logging out</button> or visit the{" "}
          <Link to="/todos" onClick={auth.logout}>
            todos page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
