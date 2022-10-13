import { Link } from "react-router-dom";
import { useAuth } from "../auth";

import "./UnimplementedDemoPage.css";

export function UnimplementedDemoPage({
  imageSrc,
  imageAlt,
}: {
  imageSrc: string;
  imageAlt: string;
}) {
  const auth = useAuth();

  return (
    <div className="unimplemented-demo-page">
      <img src={imageSrc} alt={imageAlt} />
      <div className="text-wrapper">
        <p>
          This demo exemplifies that server side rendered fragments can be
          integrated into a multi page single page application. Thus standard
          SPA pages such as this one are not implemented.
        </p>
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
