import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div>
      <h1>LAYOUT</h1>
      <Outlet />
    </div>
  );
}
