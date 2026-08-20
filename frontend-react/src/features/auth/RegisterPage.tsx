import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(fullName, email, password, role);
      navigate("/app");
    } catch {
      setError("Could not register. Try another email.");
    }
  }

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="ss-label" htmlFor="reg-name">
            Full name
          </label>
          <Input id="reg-name" placeholder="Ada Lovelace" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="ss-label" htmlFor="reg-email">
            Email
          </label>
          <Input id="reg-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="ss-label" htmlFor="reg-password">
            Password
          </label>
          <Input
            id="reg-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="ss-label" htmlFor="reg-role">
            Role
          </label>
          <select id="reg-role" className="ss-field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="USER">Learner</option>
            <option value="MENTOR">Mentor</option>
          </select>
        </div>
        {error && (
          <p className="rounded-ss border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="w-full" size="lg">
          Register
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-foreground hover:text-primary" to="/login">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
