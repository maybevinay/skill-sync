import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", { token: params.get("token"), password });
      navigate("/login");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update password. The link may have expired."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout title="Choose a new password">
      <p className="mt-2 text-sm text-muted">Use at least 8 characters.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field id="new-password" label="New password">
          <Input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button className="ss-cta w-full border-0" size="lg" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState("Verifying…");
  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMsg("This verification link is missing a token.");
      return;
    }
    api
      .post("/api/auth/verify-email", { token })
      .then(() => setMsg("Email verified. You can close this page and sign in."))
      .catch(() => setMsg("This link is invalid or has expired."));
  }, [params]);
  return (
    <AuthLayout title="Email verification">
      <p className="mt-8 text-sm leading-relaxed text-muted" role="status">
        {msg}
      </p>
      <p className="mt-6 text-sm">
        <Link className="font-medium text-foreground hover:text-primary" to="/login">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
