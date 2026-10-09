"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Settings64 from "./components/Settings64";

const termsText = (
  <>
    By signing in, you agree to our{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55"
    >
      Security Policy
    </a>
  </>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sc_admin_auth") === "true";
    }
    return false;
  });

  // Authentication credentials state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both passwords.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate frontend credentials: username "admin" and password "admin@123"
      if (username.trim() === "admin" && password === "admin@123") {
        try {
          localStorage.setItem("sc_admin_auth", "true");
        } catch {}
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setError("Invalid username or password. (Hint: admin / admin@123)");
      }
    }, 500);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("sc_admin_auth");
    } catch {}
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  // If already authenticated, show the Admin Dashboard workspace
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0c] px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white text-black font-bold text-sm">
              SC
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight">Santhi Crackers Admin</h2>
              <p className="text-[11px] text-white/50">Store Management Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/70">
              Logged in as <b className="text-white">admin</b>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
          <Settings64 />
        </main>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white p-3 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - Admin Sign In Form */}
        <div className="flex min-h-[760px] items-center justify-center rounded-md border border-black/10 bg-white px-6 py-12 dark:border-white/5 dark:bg-[#0a0a0c] lg:min-h-0 lg:px-14 lg:py-20 xl:px-20">
          <div className="mx-auto w-full max-w-[460px]">
            <div>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-black dark:text-white">
                Admin Portal
              </h1>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                Sign in to manage Santhi Crackers & Sivakasi wholesale inventory
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* 1. Username Field */}
              <InputField
                label="Username"
                value={username}
                placeholder="Enter username (admin)"
                type="text"
                onChange={setUsername}
              />

              {/* 2. Password Field */}
              <InputField
                label="Password"
                value={password}
                placeholder="Enter password (admin@123)"
                type="password"
                onChange={setPassword}
              />

              {/* 3. Confirm Password Field */}
              <InputField
                label="Confirm Password"
                value={confirmPassword}
                placeholder="Re-enter password (admin@123)"
                type="password"
                onChange={setConfirmPassword}
              />

              <div className="space-y-3 pt-2 text-xs leading-5 text-black/45 dark:text-white/40 sm:text-[13px]">
                <CheckboxLine>Remember this administrator session</CheckboxLine>
                <CheckboxLine>{termsText}</CheckboxLine>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-8 flex h-11 w-full items-center justify-center rounded-lg border border-black/40 bg-black text-sm font-medium text-white transition-colors hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/85 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Submit"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Marketing Testimonial and Mockup */}
        <div className="relative flex min-h-[720px] flex-col overflow-hidden rounded-md bg-linear-to-b from-black to-white p-8 text-white dark:to-[#050505] sm:p-12 lg:min-h-0 lg:p-16">
          {/* Background Shader */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <FlutedGlass
              size={0.89}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={0.5}
              shift={0}
              blur={0}
              edges={0.25}
              stretch={0}
              scale={1.11}
              fit="cover"
              highlights={0.1}
              shadows={0.2}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#00000000"
              colorHighlight="#FFFFFF"
              colorShadow="#000000"
              className="w-full h-full bg-transparent"
            />
          </div>

          <div className="relative z-10 h-full w-full">
            <div className="max-w-[460px] lg:pt-12">
              <motion.blockquote
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-2xl font-light leading-tight tracking-[-0.035em] text-white/90 sm:text-3xl lg:text-[34px]"
              >
                “Every block had the restraint and polish we usually spend weeks refining.”
              </motion.blockquote>
            </div>

            <div className="mt-10 w-full translate-y-[24%] overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:translate-y-[22%] lg:absolute lg:left-[12%] lg:-bottom-28 lg:mt-0 lg:w-[105%] lg:max-w-none lg:origin-bottom-left lg:translate-y-0 lg:-rotate-3 xl:left-[14%] xl:-bottom-[150px] xl:w-[108%] 2xl:-bottom-[170px] 2xl:w-[112%]">
              <motion.div
                initial={{ opacity: 0, y: 72, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 1,
                  delay: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden rounded-xl border border-white/10 bg-black"
              >
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-3 select-none">
                  <div className="size-2 rounded-full bg-white/35" />
                  <div className="size-2 rounded-full bg-white/25" />
                  <div className="size-2 rounded-full bg-white/15" />
                  <span className="ml-4 text-[9px] font-mono tracking-wider text-white/40">
                    solaceui.com/dashboard
                  </span>
                </div>
                <img
                  src="https://res.cloudinary.com/harshitproject/image/upload/v1774017120/hero-light.png"
                  alt="SolaceUI Dashboard App Mockup"
                  className="h-auto w-full object-cover object-top opacity-95 [filter:invert(1)_hue-rotate(180deg)_brightness(0.68)_contrast(1.16)] dark:[filter:none]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-xs font-semibold text-black/60 dark:text-white/60">{label}</label>
      <div className="relative flex h-11 items-center rounded-lg border border-black/15 bg-white px-3.5 dark:border-white/10 dark:bg-white/5 transition-all focus-within:border-black/40 dark:focus-within:border-white/40">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span className="relative mt-1 size-3.5 shrink-0">
        <input
          type="checkbox"
          defaultChecked
          className="peer size-full cursor-pointer appearance-none rounded-[3px] border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}
