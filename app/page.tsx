"use client";

import Image from "next/image";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { continueWithEmail } from "@/lib/auth";
import { functions } from "@/lib/firebase";

const floatingSymbols = [
  { symbol: "∑", className: "symbol-one" },
  { symbol: "√", className: "symbol-two" },
  { symbol: "π", className: "symbol-three" },
  { symbol: "÷", className: "symbol-four" },
  { symbol: "×", className: "symbol-five" },
  { symbol: "∫", className: "symbol-six" },
  { symbol: "△", className: "symbol-seven" },
  { symbol: "=", className: "symbol-eight" },
];

const features = [
  {
    icon: "☷",
    title: "Unlimited MCQs",
    description:
      "Access thousands of questions across different subjects and topics.",
  },
  {
    icon: "⌁",
    title: "Progress Tracking",
    description:
      "Monitor your growth with detailed performance and learning analytics.",
  },
  {
    icon: "⏱",
    title: "Timed Practice",
    description:
      "Build speed and accuracy with realistic timed practice sessions.",
  },
  {
    icon: "✦",
    title: "Smart Learning",
    description:
      "Find what you need to practice and keep improving every day.",
  },
  {
    icon: "⚡",
    title: "Compete",
    description:
      "Challenge yourself through competitions, rankings, and achievements.",
  },
  {
    icon: "◈",
    title: "Learn Your Way",
    description:
      "Explore flexible learning programs, subjects, topics, and practice sets.",
  },
];

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a16.7 16.7 0 0 1-3.1 4.4" />
        <path d="M6.6 6.6C3.8 8.3 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.88-1.73 2.99-4.28 2.99-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.22-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.83-1.76-5.62-4.13H3.05v2.59A9.98 9.98 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.38 13.91A6 6 0 0 1 6.06 12c0-.66.11-1.31.32-1.91V7.5H3.05A10 10 0 0 0 2 12c0 1.61.38 3.13 1.05 4.5l3.33-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.95 2.98 14.7 2 12 2a9.98 9.98 0 0 0-8.95 5.5l3.33 2.59C7.17 7.72 9.39 5.96 12 5.96Z"
      />
    </svg>
  );
}

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [authError, setAuthError] = useState("");
const [verificationSent, setVerificationSent] = useState(false);
const [verificationChecking, setVerificationChecking] = useState(false);

const openAuth = () => {
  setEmail("");
  setPassword("");
  setAuthError("");
  setShowPassword(false);
  setAuthOpen(true);
  document.body.style.overflow = "hidden";
};

const closeAuth = () => {
  setAuthOpen(false);
  setShowPassword(false);
  setEmail("");
  setPassword("");
  setAuthError("");
  document.body.style.overflow = "";
};

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f9] text-[#151515]">
      {/* ================= HEADER ================= */}

      <header className="relative z-30 bg-white">
        <div className="mx-auto flex h-[82px] max-w-[1450px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="flex items-center gap-3"
          >
           <Image
  src="/logo.png"
  alt="SigmaSprint"
  width={44}
  height={44}
  className="h-11 w-11 object-contain"
/>

            <span className="text-[25px] font-extrabold tracking-[-1.5px]">
              <span className="text-[#151515]">Sigma</span>
              <span className="text-[#5424ad]">Sprint</span>
            </span>
          </button>

          <button
            onClick={openAuth}
            className="rounded-[10px] bg-[#151515] px-7 py-3 text-[15px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#5424ad] hover:shadow-lg"
          >
            Login / Register
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero relative flex min-h-[530px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#4f20a8] via-[#6029b5] to-[#7641a2]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {floatingSymbols.map((item, index) => (
            <span
              key={index}
              className={`floating-symbol ${item.className}`}
            >
              {item.symbol}
            </span>
          ))}
        </div>

        <div className="relative z-10 px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Learn • Practice • Improve
          </div>

          <h1 className="text-5xl font-extrabold tracking-[-2px] text-white sm:text-6xl lg:text-[70px]">
            SigmaSprint
            <span className="ml-2 text-[#ffb13b]">⚡</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-[17px] font-medium leading-7 text-white/95 sm:text-[19px]">
            Practice smarter. Learn better. Track your progress.
            <br className="hidden sm:block" />
            Build your skills and compete with confidence.
          </p>

          <button
            onClick={openAuth}
            className="mt-10 rounded-[11px] bg-white px-10 py-4 text-[16px] font-bold text-[#5424ad] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#5424ad]">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              One place to keep getting better.
            </h2>

            <p className="mt-4 text-[16px] leading-7 text-gray-600">
              Practice, learn, compete, and understand your progress without
              jumping between different platforms.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative min-h-[235px] overflow-hidden rounded-[22px] border border-gray-100 bg-white p-8 text-center shadow-[0_5px_25px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#d8c8f4] hover:shadow-[0_18px_45px_rgba(84,36,173,0.16)]"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#5424ad]/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0eafb] text-[29px] font-bold text-[#5424ad] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5424ad] group-hover:text-white">
                    {feature.icon}
                  </div>

                  <h3 className="text-[21px] font-extrabold">
                    {feature.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-[360px] text-[16px] leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRACTICE ================= */}

      <section className="bg-white px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#5424ad]">
              Practice smarter
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Turn every question into progress.
            </h2>

            <p className="mt-5 text-[17px] leading-8 text-gray-600">
              Practice by subject, topic, learning program, or practice set.
              Review your answers, understand your mistakes, and keep building
              stronger fundamentals.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Practice at your own pace",
                "Review explanations after every attempt",
                "Identify strengths and weaknesses",
                "Build consistent learning habits",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5424ad] text-sm font-bold text-white">
                    ✓
                  </span>

                  <span className="font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-[#5424ad] to-[#7641a2] p-8 shadow-2xl">
            <div className="rounded-[20px] bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="font-bold">Your Progress</span>
                <span className="text-sm font-semibold text-[#5424ad]">
                  This week
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#f7f4fc] p-5">
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="mt-1 text-3xl font-extrabold">128</p>
                </div>

                <div className="rounded-2xl bg-[#f7f4fc] p-5">
                  <p className="text-sm text-gray-500">Accuracy</p>
                  <p className="mt-1 text-3xl font-extrabold">87%</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f4fc] p-5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Weekly goal</span>
                  <span>72%</span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-[72%] rounded-full bg-[#5424ad]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1200px] rounded-[30px] bg-[#151515] px-7 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to start your sprint?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-white/70">
            Create your account and start practicing, learning, and tracking
            your progress.
          </p>

          <button
            onClick={openAuth}
            className="mt-8 rounded-[11px] bg-white px-9 py-4 font-bold text-[#5424ad] transition hover:-translate-y-1 hover:shadow-xl"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-[1450px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
           <Image
  src="/logo.png"
  alt="SigmaSprint"
  width={32}
  height={32}
  className="h-8 w-8 object-contain"
/>

            <span className="font-bold">
              Sigma<span className="text-[#5424ad]">Sprint</span>
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Practice. Learn. Compete. Improve.
          </p>
        </div>
      </footer>

      {/* =====================================================
          LOGIN / REGISTER MODAL
          ===================================================== */}

      {authOpen && (
        <div
          className="auth-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuth();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="auth-modal relative w-full max-w-[560px] overflow-hidden rounded-[25px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeAuth}
              aria-label="Close login"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-[30px] font-light leading-none text-[#333] transition hover:bg-gray-100"
            >
              ×
            </button>

            {/* Modal Content */}
            <div className="px-8 pb-9 pt-9 sm:px-12 sm:pt-10">
              {verificationSent ? (
  <div className="py-8 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f0eafb]">
      <MailIcon />
    </div>

    <h2 className="mt-6 text-[25px] font-extrabold tracking-[-0.5px] text-[#151515] sm:text-[28px]">
      Verify your email
    </h2>

    <p className="mx-auto mt-3 max-w-[420px] text-[14px] leading-6 text-[#707070] sm:text-[15px]">
      We sent a verification link to
      <br />
      <span className="font-semibold text-[#151515]">
        {email}
      </span>
    </p>

    <p className="mx-auto mt-4 max-w-[420px] text-[13px] leading-6 text-[#8a8a8a]">
      Open your email and click the verification link.
      This page will automatically continue once your
      email has been verified.
    </p>

    {verificationChecking && (
      <div className="mt-6 flex items-center justify-center gap-2 text-[13px] font-medium text-[#5424ad]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5424ad]" />
        Waiting for verification...
      </div>
    )}
  </div>
) : (
              <>
              {/* Logo */}
              <div className="flex justify-center">
               <Image
  src="/logo.png"
  alt="SigmaSprint"
  width={92}
  height={92}
  className="h-[82px] w-[82px] object-contain sm:h-[92px] sm:w-[92px]"
/>
              </div>

              {/* Heading */}
              <div className="mt-4 text-center">
                <h2
                  id="auth-title"
                  className="text-[25px] font-extrabold tracking-[-0.5px] text-[#151515] sm:text-[28px]"
                >
                  Welcome to SigmaSprint
                </h2>

                <p className="mt-2 text-[14px] leading-6 text-[#707070] sm:text-[15px]">
                  Login to continue or create your account to get started.
                </p>
              </div>

              {/* Form */}
              <div className="mt-7 space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[14px] font-semibold text-[#252525]"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7d8795]">
                      <MailIcon />
                    </span>

                    <input
  id="email"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  placeholder="Enter your email"
  autoComplete="off"
  className="h-[48px] w-full rounded-[10px] border border-[#d8dce3] bg-white pl-12 pr-4 text-[14px] text-[#151515] outline-none transition placeholder:text-[#9aa1ad] hover:border-[#b9bec8] focus:border-[#5424ad] focus:ring-4 focus:ring-[#5424ad]/10"
/>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[14px] font-semibold text-[#252525]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7d8795]">
                      <LockIcon />
                    </span>

                    <input
  id="password"
  type={showPassword ? "text" : "password"}
  value={password}
  onChange={(event) => setPassword(event.target.value)}
  placeholder="Enter your password"
  autoComplete="new-password"
  className="h-[48px] w-full rounded-[10px] border border-[#d8dce3] bg-white pl-12 pr-12 text-[14px] text-[#151515] outline-none transition placeholder:text-[#9aa1ad] hover:border-[#b9bec8] focus:border-[#5424ad] focus:ring-4 focus:ring-[#5424ad]/10"
/>

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-[#7d8795] transition hover:bg-gray-100 hover:text-[#5424ad]"
                    >
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  </div>
                </div>
                               

                {authError && (
                  <p className="mt-2 text-[13px] text-red-600">
                    {authError}
                  </p>
                )}

           {/* Continue */}
<button
  type="button"
  onClick={async () => {
    setAuthError("");
    setVerificationChecking(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    try {
      const checkEmail = httpsCallable<
        { email: string },
        {
          exists: boolean;
          emailVerified: boolean;
          disabled: boolean;
        }
      >(functions, "checkEmailStatus");

      const status = await checkEmail({
        email: normalizedEmail,
      });

      const {
        exists,
        emailVerified,
        disabled,
      } = status.data;

      if (disabled) {
        setAuthError(
          "This account has been disabled. Please contact support.",
        );
        return;
      }

      // New user
      if (!exists) {
        const result = await continueWithEmail(
          normalizedEmail,
          password,
        );

        if (result.type === "register") {
          setVerificationSent(true);
          setVerificationChecking(true);
        }

        return;
      }

      // Existing user but email is not verified
      if (!emailVerified) {
        const result = await continueWithEmail(
          normalizedEmail,
          password,
        );

        if (result.type === "login") {
          await result.user.reload();

          if (!result.user.emailVerified) {
            setVerificationSent(true);
            setVerificationChecking(true);
            return;
          }
        }

        if (result.type === "register") {
          setVerificationSent(true);
          setVerificationChecking(true);
        }

        return;
      }

      // Existing user with verified email
      const result = await continueWithEmail(
        normalizedEmail,
        password,
      );

      if (result.type === "login") {
        console.log(
          "Existing verified user logged in:",
          result.user,
        );
      }
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String(
              (error as { code?: unknown }).code,
            )
          : "";

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setAuthError("Invalid email or password.");
      } else {
        setAuthError(
          "Something went wrong. Please try again.",
        );
      }
    }
  }}
  className="mt-1 h-[48px] w-full rounded-[10px] bg-[#5424ad] text-[15px] font-bold text-white shadow-sm transition duration-200 hover:bg-[#471d98] hover:shadow-md active:scale-[0.99]"
>
  Continue
</button>
                {/* Divider */}
                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-[#e1e3e7]" />

                  <span className="text-[13px] font-medium text-[#777d86]">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-[#e1e3e7]" />
                </div>

                                      {/* Google */}
                <button
                  type="button"
                  className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#d8dce3] bg-white text-[14px] font-semibold text-[#252525] transition duration-200 hover:bg-[#fafafa] hover:shadow-sm active:scale-[0.99]"
                >
                  <GoogleIcon />

                  <span>Continue with Google</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )}

</main>
  );
}