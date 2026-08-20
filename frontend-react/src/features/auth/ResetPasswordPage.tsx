import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/api/auth/reset-password", { token: params.get("token"), password });
    navigate("/login");
  }
  return (
    <AuthLayout title="Reset password">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="ss-label" htmlFor="new-password">
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button className="w-full" size="lg">
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
      setMsg("Missing token");
      return;
    }
    api
      .post("/api/auth/verify-email", { token })
      .then(() => setMsg("Email verified. You can close this page."))
      .catch(() => setMsg("Invalid or expired token."));
  }, [params]);
  return (
    <AuthLayout title="Email verification">
      <p className="text-sm leading-relaxed text-muted" role="status">
        {msg}
      </p>
    </AuthLayout>
  );
}
