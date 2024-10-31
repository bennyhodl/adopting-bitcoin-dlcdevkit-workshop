import { Link, Outlet } from "react-router-dom";

export default function Users() {
  return (
    <div>
      <h1>Users</h1>
      <nav>
        <Link to="1">User 1</Link> | <Link to="2">User 2</Link>
      </nav>
      <Outlet />
    </div>
  );
} 