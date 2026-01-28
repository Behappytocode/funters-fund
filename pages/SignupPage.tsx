import { supabase } from "../supabase";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        role: isAdmin ? "admin" : "user",
      });

      window.location.href = "/login";
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      <label>
        <input type="checkbox" onChange={e => setIsAdmin(e.target.checked)} />
        Signup as Admin
      </label>

      <button onClick={handleSignup}>Signup</button>

      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}
