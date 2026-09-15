"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { auth } from "../lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import LoginSignupModal from "./components/LoginSignupModal";

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

export default function Home() {
  const router = useRouter();

  const [authOpen, setAuthOpen] =
    useState(false);

  const [initialAuthChecking, setInitialAuthChecking] =
    useState(true);

  /*
   * ============================================================
   * AUTH STATE
   * ============================================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setInitialAuthChecking(false);
            return;
          }

          setInitialAuthChecking(false);

          router.replace("/dashboard");
        },
      );

    return () => {
      unsubscribe();
    };
  }, [router]);

  /*
   * ============================================================
   * BODY SCROLL LOCK
   * ============================================================
   */

  useEffect(() => {
    document.body.style.overflow =
      authOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [authOpen]);

  /*
   * ============================================================
   * AUTH
   * ============================================================
   */

  const openAuth = () => {
    setAuthOpen(true);
  };

  const handleAuthSuccess =
    async () => {
      setAuthOpen(false);

      router.replace("/dashboard");
    };

  /*
   * ============================================================
   * INITIAL AUTH CHECK
   * ============================================================
   */

  if (initialAuthChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9]">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="SigmaSprint"
            width={70}
            height={70}
            className="h-[70px] w-[70px] object-contain"
          />

          <div className="mt-5 h-2 w-32 overflow-hidden rounded-full bg-[#e7e0f4]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#5424ad]" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * HOMEPAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f9] text-[#151515]">

      {/* ================= HEADER ================= */}

      <header className="fixed left-0 right-0 top-0 z-30 bg-white">
        <div className="mx-auto flex h-[82px] max-w-[1450px] items-center justify-between px-6 sm:px-10 lg:px-16">

          <button
            type="button"
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
              <span className="text-[#151515]">
                Sigma
              </span>

              <span className="text-[#5424ad]">
                Sprint
              </span>
            </span>
          </button>

          <button
            type="button"
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
          {floatingSymbols.map(
            (item, index) => (
              <span
                key={index}
                className={`floating-symbol ${item.className}`}
              >
                {item.symbol}
              </span>
            ),
          )}
        </div>

        <div className="relative z-10 px-6 text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Learn • Practice • Improve
          </div>

          <h1 className="text-5xl font-extrabold tracking-[-2px] text-white sm:text-6xl lg:text-[70px]">
            SigmaSprint
            <span className="ml-2 text-[#ffb13b]">
              ⚡
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-[17px] font-medium leading-7 text-white/95 sm:text-[19px]">
            Practice smarter. Learn better.
            Track your progress.
            <br className="hidden sm:block" />
            Build your skills and compete
            with confidence.
          </p>

          <button
            type="button"
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
              Practice, learn, compete, and
              understand your progress without
              jumping between different
              platforms.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">

            {features.map(
              (feature) => (
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
              ),
            )}

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
              Practice by subject, topic,
              learning program, or practice set.
              Review your answers, understand
              your mistakes, and keep building
              stronger fundamentals.
            </p>

            <div className="mt-7 space-y-4">

              {[
                "Practice at your own pace",
                "Review explanations after every attempt",
                "Identify strengths and weaknesses",
                "Build consistent learning habits",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5424ad] text-sm font-bold text-white">
                      ✓
                    </span>

                    <span className="font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ),
              )}

            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-[#5424ad] to-[#7641a2] p-8 shadow-2xl">

            <div className="rounded-[20px] bg-white p-7">

              <div className="flex items-center justify-between">

                <span className="font-bold">
                  Your Progress
                </span>

                <span className="text-sm font-semibold text-[#5424ad]">
                  This week
                </span>

              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-[#f7f4fc] p-5">

                  <p className="text-sm text-gray-500">
                    Questions
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    128
                  </p>

                </div>

                <div className="rounded-2xl bg-[#f7f4fc] p-5">

                  <p className="text-sm text-gray-500">
                    Accuracy
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    87%
                  </p>

                </div>

              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f4fc] p-5">

                <div className="flex justify-between text-sm">

                  <span className="font-semibold">
                    Weekly goal
                  </span>

                  <span>
                    72%
                  </span>

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
            Create your account and start
            practicing, learning, and tracking
            your progress.
          </p>

          <button
            type="button"
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
              Sigma
              <span className="text-[#5424ad]">
                Sprint
              </span>
            </span>

          </div>

          <p className="text-sm text-gray-500">
            Practice. Learn. Compete. Improve.
          </p>

        </div>
      </footer>

      {/* ================= LOGIN / REGISTER ================= */}

      <LoginSignupModal
        open={authOpen}
        onClose={() =>
          setAuthOpen(false)
        }
        onAuthSuccess={
          handleAuthSuccess
        }
      />

    </main>
  );
}