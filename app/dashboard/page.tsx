"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { auth } from "../../lib/firebase";
import { getUserProfile } from "../../lib/auth";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

type UserProfile = {
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImage?: string;
  role?: string;
  status?: string;
  createdAt?: unknown;
  lastActiveAt?: unknown;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) return;

        setUser(currentUser);

        const userProfile =
          await getUserProfile(currentUser.uid);

        if (userProfile) {
          setProfile(userProfile as UserProfile);
        }
      },
    );

    return () => unsubscribe();
  }, []);

  const displayName =
    profile?.displayName ||
    user?.displayName ||
    "Student";

  const email =
    user?.email || "";

  const profileImage =
    profile?.profileImage ||
    user?.photoURL ||
    "";

  const firstLetter =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "S";

  const accountStatus =
    profile?.status || "active";

  return (
    <>
      {/* WELCOME */}

      <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_5px_25px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
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

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5424ad]">
              Welcome back
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-[#252525]">
              {displayName}
            </h1>

            <p className="mt-1 text-sm text-[#9a9ea5]">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD STATS */}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-medium text-gray-500">
            XP
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#5424ad]">
            0
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Start practicing to earn XP
          </p>
        </div>

        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-medium text-gray-500">
            Questions Solved
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#5424ad]">
            0
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Your activity will appear here
          </p>
        </div>

        <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-medium text-gray-500">
            Account Status
          </p>

          <p className="mt-2 text-3xl font-extrabold capitalize text-[#5424ad]">
            {accountStatus}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            SigmaSprint account
          </p>
        </div>
      </div>

      {/* START PRACTICING */}

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
    </>
  );
}