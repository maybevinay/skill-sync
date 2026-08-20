import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("user@skillsync.dev");
  const [password, setPassword] = useState("User@12345");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "ADMIN" ? "/admin" : "/app");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid credentials"));
    }
  }

  return (
    <AuthLayout title="Welcome back">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="ss-label" htmlFor="login-email">
            Email
          </label>
          <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="ss-label" htmlFor="login-password">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-ss border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="w-full" size="lg">
          Login
        </Button>
      </form>
      <div className="mt-5 flex justify-between gap-3 text-sm text-muted">
        <Link className="hover:text-foreground" to="/forgot-password">
          Forgot password
        </Link>
        <Link className="hover:text-foreground" to="/register">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
