"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "../../lib/firebase";
import {
  getUserProfile,
  logout,
} from "../../lib/auth";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

type UserProfile = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
  email?: string;
  profileImage?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [checking, setChecking] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
   * ============================================================
   * AUTHENTICATION CHECK
   * ============================================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace("/");
            return;
          }

          try {
            /*
             * Refresh Firebase user so we have
             * the latest authentication information.
             */

            await currentUser.reload();

            const refreshedUser =
              auth.currentUser;

            if (!refreshedUser) {
              router.replace("/");
              return;
            }

            setUser(refreshedUser);

            /*
             * Load the user's Firestore profile.
             */

            const userProfile =
              await getUserProfile(
                refreshedUser.uid,
              );

            if (userProfile) {
              setProfile(
                userProfile as UserProfile,
              );
            }

            setChecking(false);
          } catch (error) {
            console.error(
              "Dashboard authentication check failed:",
              error,
            );

            router.replace("/");
          }
        },
      );

    return () => {
      unsubscribe();
    };
  }, [router]);

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout =
    async () => {
      setLoggingOut(true);

      try {
        await logout();
        router.replace("/");
      } catch (error) {
        console.error(
          "Logout failed:",
          error,
        );

        setLoggingOut(false);
      }
    };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
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
   * PROFILE DATA
   * ============================================================
   */

  const displayName =
    profile?.displayName ||
    user?.displayName ||
    "Student";

  const username =
    profile?.username || "";

  const email =
    profile?.email ||
    user?.email ||
    "";

  const profileImage =
    profile?.profileImage ||
    user?.photoURL ||
    "";

  const firstLetter =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "S";

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f7f9]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <Image
              src="/logo.png"
              alt="SigmaSprint"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />

            <span className="text-xl font-extrabold tracking-[-0.8px]">
              <span className="text-[#151515]">
                Sigma
              </span>

              <span className="text-[#5424ad]">
                Sprint
              </span>
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            disabled={loggingOut}
            className="rounded-[10px] bg-[#151515] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5424ad] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ================= WELCOME ================= */}

        <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_5px_25px_rgba(0,0,0,0.06)]">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* PROFILE IMAGE */}

            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0eafb]">

              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-[#5424ad]">
                  {firstLetter}
                </span>
              )}

            </div>

            {/* USER INFORMATION */}

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5424ad]">
                Welcome back
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-[#252525]">
                {displayName}
              </h1>

              {username && (
                <p className="mt-1 text-[15px] text-[#777d86]">
                  @{username}
                </p>
              )}

              {email && (
                <p className="mt-1 text-sm text-[#9a9ea5]">
                  {email}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ================= DASHBOARD CONTENT ================= */}

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {/* XP */}

          <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">

            <p className="text-sm font-medium text-gray-500">
              XP
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#5424ad]">
              {profile &&
              "totalXP" in profile
                ? String(
                    (
                      profile as UserProfile & {
                        totalXP?: number;
                      }
                    ).totalXP ?? 0,
                  )
                : "0"}
            </p>

          </div>

          {/* QUESTIONS */}

          <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">

            <p className="text-sm font-medium text-gray-500">
              Questions Solved
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#5424ad]">
              {profile &&
              "totalSolved" in profile
                ? String(
                    (
                      profile as UserProfile & {
                        totalSolved?: number;
                      }
                    ).totalSolved ?? 0,
                  )
                : "0"}
            </p>

          </div>

          {/* STATUS */}

          <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">

            <p className="text-sm font-medium text-gray-500">
              Account Status
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#5424ad]">
              Active
            </p>

          </div>

        </div>

        {/* ================= START PRACTICING ================= */}

        <div className="mt-8 rounded-[24px] bg-gradient-to-br from-[#5424ad] to-[#7641a2] p-8 text-white shadow-xl">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            Your learning journey
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Ready for your next sprint?
          </h2>

          <p className="mt-3 max-w-2xl text-white/80">
            Choose a subject, practice questions,
            track your progress, and keep improving.
          </p>

          <button
            type="button"
            className="mt-6 rounded-[10px] bg-white px-6 py-3 font-bold text-[#5424ad] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Practicing
          </button>

        </div>

      </div>

    </main>
  );
}