"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Badge from "@/components/common/Badge";

function LoginForm() {
  const [loginBy, setLoginBy] = useState("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(identifier, password, loginBy);
      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-1.5 text-center md:text-left">
        <h1 className="text-3xl font-display text-[var(--foreground)]">
          Welcome <span className="gradient-text">Back</span>
        </h1>
        <p className="text-[var(--muted-foreground)] font-medium text-xs">
          Continue your high-performance health journey.
        </p>
      </div>

      <ErrorMessage message={error} className="mb-4" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 p-1.5 bg-[var(--muted)] rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setLoginBy("username")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              loginBy === "username" 
                ? "bg-white text-[var(--foreground)] shadow-sm" 
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Username
          </button>
          <button
            type="button"
            onClick={() => setLoginBy("email")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              loginBy === "email" 
                ? "bg-white text-[var(--foreground)] shadow-sm" 
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Email
          </button>
        </div>

        <div className="space-y-4">
          <Input
            id="login-identifier"
            type={loginBy === "email" ? "email" : "text"}
            label={loginBy === "username" ? "Username" : "Email"}
            placeholder={loginBy === "email" ? "name@example.com" : "your_username"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          id="login-submit"
          type="submit"
          loading={loading}
          className="w-full h-12 text-sm font-bold shadow-accent"
        >
          Sign In
        </Button>
      </form>

      <p className="text-[13px] text-center text-[var(--muted-foreground)]">
        New to FitNest?{" "}
        <Link
          id="link-to-register"
          href="/register"
          className="text-[var(--accent)] font-bold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Secure Login"
      subtitle="Your metrics are waiting. Access your dashboard for the latest AI insights."
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
