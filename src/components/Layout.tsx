import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <main className="h-screen">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/users">Users</Link></li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
} 