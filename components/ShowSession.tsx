import { useSession } from "./api";

export function ShowSession() {
  const { data, error } = useSession();

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <div>
      <h1>Welcome to {data.id}</h1>
      <p>role: {data.role}</p>
    </div>
  );
}
