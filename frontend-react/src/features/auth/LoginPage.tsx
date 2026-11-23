import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api";

const EMAIL_KEY = "ss_login_email";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "user@skillsync.dev");
  const [password, setPassword] = useState("User@12345");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(EMAIL_KEY)));
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (remember) localStorage.setItem(EMAIL_KEY, email);
      else localStorage.removeItem(EMAIL_KEY);
      const user = await login(email, password);
      navigate(user.role === "ADMIN" ? "/admin" : "/app");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid credentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Welcome back">
      <p className="mt-2 text-sm text-muted">Sign in to continue to your workspace.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field id="login-email" label="Email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field id="login-password" label="Password">
          <div className="relative">
            <Input
              id="login-password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              className="pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        {error && (
          <p className="rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-primary"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember email
          </label>
          <Link className="hover:text-foreground" to="/forgot-password">
            Forgot password
          </Link>
        </div>
        <Button className="ss-cta w-full border-0" size="lg" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-muted">
        New to SkillSync?{" "}
        <Link className="font-medium text-foreground hover:text-primary" to="/register">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
