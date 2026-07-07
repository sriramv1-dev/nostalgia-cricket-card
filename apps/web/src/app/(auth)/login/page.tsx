"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { InputField } from "@/components/ui";
import { ArrowLeftIcon, SpinnerIcon } from "@/components/icons";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/collection`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-6 py-12">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-gold to-pitch" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 transition-colors"
      >
        <ArrowLeftIcon />
        Home
      </Link>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-brand/10 border border-brand/20 rounded-2xl p-4 mb-4">
            <span className="text-5xl">🏏</span>
          </div>
          <h1 className="font-display text-4xl text-cream tracking-wider">
            SIGN IN
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            No password. Just your email.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="bg-pitch/20 border border-pitch/40 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-display text-2xl text-cream tracking-wide mb-2">
              CHECK YOUR INBOX
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              We sent a magic link to
            </p>
            <p className="text-gold font-semibold text-sm mb-4 break-all">
              {email}
            </p>
            <p className="text-gray-500 text-xs">
              Click the link in the email to sign in. It expires in 1 hour.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-xs text-gray-600 hover:text-gray-400 underline transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-400 mb-1.5 font-medium"
              >
                Email address
              </label>
              <InputField
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-brand hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Magic Link"
              )}
            </button>

            <p className="text-center text-xs text-gray-600">
              By signing in you agree to collect nostalgia responsibly.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
