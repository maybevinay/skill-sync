import { FormEvent, useState } from "react";
import api from "@/lib/api";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/api/auth/forgot-password", { email });
    setDone(true);
  }
  return (
    <AuthLayout title="Forgot password">
      {done ? (
        <p className="rounded-ss border border-success/20 bg-success/10 px-3 py-2 text-sm text-success" role="status">
          If that email exists, a reset token was issued.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="ss-label" htmlFor="forgot-email">
              Email
            </label>
            <Input id="forgot-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
