import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api, { apiErrorMessage } from "@/lib/api";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send a reset link. Try again."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout title="Reset your password">
      <p className="mt-2 text-sm text-muted">We’ll email a reset link if that account exists.</p>
      {done ? (
        <p className="mt-8 rounded-xl bg-mint px-3 py-2 text-sm text-success" role="status">
          If that email exists, a reset token was issued.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <Field id="forgot-email" label="Email">
            <Input id="forgot-email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && (
            <p className="rounded-xl bg-rose px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button className="ss-cta w-full border-0" size="lg" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link className="text-muted hover:text-foreground" to="/login">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
