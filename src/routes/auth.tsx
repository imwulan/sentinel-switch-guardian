import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Sentinel Switch" },
      { name: "description", content: "Sign in to sync your firewall settings, audit log, and alerts across devices." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/app" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <div className="glass relative w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary glow-safe">
            <Shield className="h-5 w-5 text-safe" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
            <p className="text-xs text-muted-foreground">Sync settings, audit log & alerts.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@wallet.dev"
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-safe"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-safe"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-safe/15 px-4 py-2.5 text-sm font-semibold text-safe hover:bg-safe/25 disabled:opacity-60"
          >
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
