import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api";
import type { Role } from "@/lib/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => {
    let n = 0;
    if (password.length >= 8) n += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) n += 1;
    if (/\d/.test(password)) n += 1;
    if (/[^A-Za-z0-9]/.test(password)) n += 1;
    return n;
  }, [password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(fullName, email, password, role);
      navigate("/app");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not register. Try another email."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account">
      <p className="mt-2 text-sm text-muted">Join as a learner or mentor in a minute.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field id="reg-name" label="Full name">
          <Input id="reg-name" required placeholder="Ada Lovelace" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field id="reg-email" label="Email">
          <Input id="reg-email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field id="reg-password" label="Password" hint="Use at least 8 characters with mixed case, a number, and a symbol.">
          <div className="relative">
            <Input
              id="reg-password"
              type={show ? "text" : "password"}
              required
              minLength={8}
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
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? "bg-primary" : "bg-line"}`} />
            ))}
          </div>
        </Field>
        <Field id="reg-role" label="I am joining as">
          <select id="reg-role" className="ss-field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="USER">Learner</option>
            <option value="MENTOR">Mentor</option>
          </select>
        </Field>
        {error && (
          <p className="rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="ss-cta w-full border-0" size="lg" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-foreground hover:text-primary" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
