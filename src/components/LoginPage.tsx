"use client";

import React, { useState, useTransition } from "react";
import { Beer, Lock, User, Building, AlertCircle } from "lucide-react";
import { loginUser } from "@/db/actions";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [usernameAndOrg, setUsernameAndOrg] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameAndOrg.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      const res = await loginUser(usernameAndOrg.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || "Login failed. Check your credentials.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-dark relative overflow-hidden font-body px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-surface/40 backdrop-blur-xl border border-secondary p-8 rounded-2xl shadow-card relative z-10 space-y-8 transition-all hover:border-primary/20 duration-500">
        
        {/* Brand / Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(245,158,11,0.15)] mb-2 animate-bounce">
            <Beer className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-wider text-text-primary uppercase bg-gradient-to-r from-text-primary via-primary-light to-primary bg-clip-text text-transparent">
            Bar Manager IO
          </h1>
          <p className="text-xs text-text-secondary uppercase tracking-widest">
            Enterprise Operations Login
          </p>
        </div>

        {/* Info panel with credentials */}
        <div className="p-3 bg-secondary-dark/60 rounded-lg border border-secondary/50 text-[11px] text-text-secondary space-y-1 font-mono">
          <p className="text-primary font-semibold uppercase text-[9px] tracking-wider mb-1">Demo Credentials:</p>
          <p>Format: <span className="text-text-primary">Name@Organization</span></p>
          <p>Admin: <span className="text-text-primary">admin@gatto-bar-01</span> / <span className="text-text-primary">admin</span></p>
          <p>Staff: <span className="text-text-primary">sofia@gatto-bar-01</span> / <span className="text-text-primary">password</span></p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
              User ID & Organization
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted group-focus-within:text-primary transition-colors">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. admin@gatto-bar-01"
                value={usernameAndOrg}
                onChange={(e) => setUsernameAndOrg(e.target.value)}
                disabled={isPending}
                className="w-full bg-secondary-dark/80 border border-secondary rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
              Security Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted group-focus-within:text-primary transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="w-full bg-secondary-dark/80 border border-secondary rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent text-secondary-dark py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-secondary-dark border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Sign In to Station"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
