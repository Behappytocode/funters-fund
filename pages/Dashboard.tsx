import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      setRole(profile?.role || "user");
    };

    checkUser();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Role: {role}</p>

      {role === "admin" && <p>Admin Controls Visible</p>}
    </div>
  );
}
