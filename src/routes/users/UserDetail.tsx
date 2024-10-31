import { useParams } from "react-router-dom";

export default function UserDetail() {
  const { id } = useParams();

  return (
    <div>
      <h2>User Details</h2>
      <p>Viewing user {id}</p>
    </div>
  );
} 