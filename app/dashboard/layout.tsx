"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth, db } from "../../lib/firebase";
import { getUserProfile, logout } from "../../lib/auth";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

type UserProfile = {
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImage?: string;
  role?: string;
  status?: string;
  createdAt?: unknown;
  totalXP?: number;
  lastActiveAt?: unknown;
};

type AppearanceSettings = {
  streakIconUrl?: string;
  xpIconUrl?: string;
  notificationIconUrl?: string;
};

type SidebarIconType =
  | "dashboard"
  | "batches"
  | "study"
  | "practice"
  | "tests"
  | "ai"
  | "scholarship"
  | "progress"
  | "achievements"
  | "refer"
  | "support"
  | "about"
  | "privacy";

function SidebarIcon({
  type,
}: {
  type: SidebarIconType;
}) {
  const common = "h-[19px] w-[19px] shrink-0";

  if (type === "dashboard") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
      </svg>
    );
  }

  if (type === "batches") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M8 4v16M3 9h18" />
      </svg>
    );
  }

  if (type === "study") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
        <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
        <path d="M8 7h8M8 10h6" />
      </svg>
    );
  }

  if (type === "practice") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
        />
        <path d="M8 7h8M8 11h8M8 15h5M8 18h3" />
      </svg>
    );
  }

  if (type === "tests") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle
          cx="12"
          cy="12"
          r="8.5"
        />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        <circle
          cx="12"
          cy="12"
          r="4"
        />
      </svg>
    );
  }

  if (type === "scholarship") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m3 9 9-5 9 5-9 5-9-5Z" />
        <path d="M7 11v5c2.8 2.3 7.2 2.3 10 0v-5" />
        <path d="M21 9v6" />
      </svg>
    );
  }

  if (type === "progress") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 20V10" />
        <path d="M10 20V5" />
        <path d="M16 20v-7" />
        <path d="M22 20V3" />
        <path d="M3 20h20" />
      </svg>
    );
  }

  if (type === "achievements") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle
          cx="12"
          cy="8"
          r="4.5"
        />
        <path d="M9.5 12 8 21l4-2 4 2-1.5-9" />
        <path d="m10.5 8 1 1 2-2" />
      </svg>
    );
  }

  if (type === "refer") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle
          cx="9"
          cy="8"
          r="3"
        />
        <circle
          cx="17"
          cy="10"
          r="2.5"
        />
        <path d="M3.5 19c.7-3.2 2.6-5 5.5-5s4.8 1.8 5.5 5" />
        <path d="M14 16c2.4-.2 4.5.8 5.5 3" />
        <path d="M16 5v5M13.5 7.5h5" />
      </svg>
    );
  }

  if (type === "support") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 13a8 8 0 0 1 16 0" />
        <path d="M4 13v4a2 2 0 0 0 2 2h2v-6H4ZM20 13v4a2 2 0 0 1-2 2h-2v-6h4Z" />
        <path d="M8 19h2M14 19h2" />
      </svg>
    );
  }

  if (type === "privacy") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3 20 6v5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6l8-3Z" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
    );
  }

  // About
  return (
    <svg
      className={common}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] =
    useState(false);
  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [, setAppearance] =
    useState<AppearanceSettings>({
      streakIconUrl: "/streak.png",
      xpIconUrl: "/xp.png",
      notificationIconUrl: "/notification.png",
    });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          router.replace("/");
          return;
        }

        try {
          await currentUser.reload();

          const refreshedUser = auth.currentUser;

          if (!refreshedUser) {
            router.replace("/");
            return;
          }

          setUser(refreshedUser);

          const userProfile =
            await getUserProfile(
              refreshedUser.uid,
            );

          if (userProfile) {
            setProfile(
              userProfile as UserProfile,
            );
          }

          const usernameQuery = query(
            collection(db, "usernames"),
            where(
              "uid",
              "==",
              refreshedUser.uid,
            ),
            limit(1),
          );

          const usernameSnapshot =
            await getDocs(usernameQuery);

          if (!usernameSnapshot.empty) {
            const usernameData =
              usernameSnapshot.docs[0].data();

            setUsername(
              usernameData.username || "",
            );
          }

          try {
            const appearanceRef = doc(
              db,
              "platformSettings",
              "appearance",
            );

            const appearanceSnapshot =
              await getDoc(appearanceRef);

            if (appearanceSnapshot.exists()) {
              const appearanceData =
                appearanceSnapshot.data();

              setAppearance({
                streakIconUrl:
                  appearanceData.streakIconUrl ||
                  "/streak.png",
                xpIconUrl:
                  appearanceData.xpIconUrl ||
                  "/xp.png",
                notificationIconUrl:
                  appearanceData.notificationIconUrl ||
                  "/notification.png",
              });
            }
          } catch {
            // Keep default appearance icons.
          }

          setChecking(false);
        } catch (error) {
          console.error(
            "Dashboard authentication check failed:",
            error,
          );

          setChecking(false);
        }
      },
    );

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      router.replace("/");
    } catch {
      setLoggingOut(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="SigmaSprint"
            width={70}
            height={70}
            priority
            className="h-[70px] w-[70px] object-contain"
          />

          <div className="mt-5 h-2 w-32 overflow-hidden rounded-full bg-[#e7e0f4]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#5424ad]" />
          </div>
        </div>
      </main>
    );
  }

  const displayName =
    profile?.displayName ||
    user?.displayName ||
    "Student";

  const firstName =
    profile?.firstName ||
    displayName.split(" ")[0] ||
    "Student";

  const profileImage =
    profile?.profileImage ||
    user?.photoURL ||
    "";

  const firstLetter =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "S";

  const sidebarItemClass =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-gray-700 transition hover:bg-[#f7f4fc] hover:text-[#5424ad]";

  const activeSidebarItemClass =
    "flex w-full items-center gap-3 rounded-xl bg-[#f1ebfb] px-4 py-3 text-left text-[15px] font-semibold text-[#5424ad]";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(path);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f9]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 h-12 border-b border-white/10 bg-[#111111] text-white shadow-md">
        <div className="flex h-full w-full items-center justify-between px-5 sm:px-8">
          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="SigmaSprint"
              width={34}
              height={34}
              priority
              className="h-8 w-8 object-contain"
            />

            <span className="text-[21px] font-extrabold tracking-[-0.9px]">
              <span className="text-white">
                Sigma
              </span>

              <span className="text-[#9b6cff]">
                Sprint
              </span>
            </span>
          </button>

          {/* USER */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileMenuOpen(
                  (open) => !open,
                )
              }
              className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-white/10"
              aria-label="Open profile menu"
            >
              <span className="hidden text-[15px] font-medium text-white sm:block">
                Hey, {firstName}
              </span>

              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#5424ad]">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {firstLetter}
                  </span>
                )}
              </div>

              <span className="hidden text-[14px] text-white/60 sm:block">
                ▾
              </span>
            </button>

            {profileMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() =>
                    setProfileMenuOpen(false)
                  }
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-12 z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-[0_15px_45px_rgba(0,0,0,0.18)] animate-[profileDropdown_180ms_ease-out]">
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0eafb]">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Profile"
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-bold text-[#5424ad]">
                            {firstLetter}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold text-[#151515]">
                          {displayName}
                        </p>

                        <p className="truncate text-[13px] text-gray-500">
                          @{username || "username"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/profile")
                    }
                    className="flex w-full px-5 py-3.5 text-left text-[14px] font-medium transition-colors duration-150 hover:bg-[#f7f4fc] hover:text-[#5424ad]"
                  >
                    Profile
                  </button>
                  <div className="mx-5 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      void handleLogout();
                    }}
                    disabled={loggingOut}
                    className="flex w-full px-5 py-3.5 text-left text-[14px] font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loggingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          GLOBAL WHITE HEADER
      ===================================================== */}

      <div className="fixed left-0 right-0 top-12 z-40 border-b border-[#e4e4e7] bg-white shadow-sm lg:left-[250px]">
        <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEFT — PAGE TITLE */}

          <div className="flex items-center">
            {pathname.startsWith(
              "/dashboard/study/subjects",
            ) && (
              <button
                type="button"
                onClick={() => {
                  const params =
                    new URLSearchParams(
                      window.location.search,
                    );

                  const batchId =
                    params.get("batchId");

                  if (
                    pathname.startsWith(
                      "/dashboard/study/subjects/topics",
                    )
                  ) {
                    if (batchId) {
                      router.push(
                        `/dashboard/study/subjects?batchId=${encodeURIComponent(batchId)}`,
                      );
                    } else {
                      router.push(
                        "/dashboard/study/subjects",
                      );
                    }

                    return;
                  }

                  if (
                    pathname.startsWith(
                      "/dashboard/study/subjects",
                    )
                  ) {
                    if (batchId) {
                      router.push(
                        `/dashboard/study?batchId=${encodeURIComponent(batchId)}`,
                      );
                    } else {
                      router.push(
                        "/dashboard/study",
                      );
                    }

                    return;
                  }

                  router.push("/dashboard/study");
                }}
                aria-label="Back to Study"
                className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e1e1e4] bg-white text-[#202020] transition hover:bg-[#f5f5f6]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <h1 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#202020]">
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname.startsWith(
                    "/dashboard/study/subjects",
                  )
                  ? "Subjects"
                  : pathname.startsWith(
                      "/dashboard/study",
                    )
                    ? "Study"
                    : pathname.startsWith(
                        "/dashboard/sprint-ai",
                      )
                      ? "Sprint AI"
                      : pathname.startsWith(
                          "/dashboard/scholarships",
                        )
                        ? "Scholarship"
                        : pathname.startsWith(
                            "/dashboard/progress",
                          )
                          ? "Progress"
                          : pathname.startsWith(
                              "/dashboard/achievements",
                            )
                            ? "Achievements"
                            : pathname.startsWith(
                                "/dashboard/refer",
                              )
                              ? "Refer & Earn"
                              : pathname.startsWith(
                                  "/dashboard/support",
                                )
                                ? "Help & Support"
                                : pathname.startsWith(
                                    "/dashboard/about",
                                  )
                                  ? "About Us"
                                  : pathname.startsWith(
                                      "/dashboard/privacy",
                                    )
                                    ? "Privacy Policy"
                                    : pathname.startsWith(
                                        "/dashboard/batches",
                                      )
                                      ? "My Batches"
                                      : "Dashboard"}
            </h1>
          </div>

          {/* RIGHT — STATUS */}

          <div className="flex items-center gap-3 sm:gap-4">
            {/* GIFT */}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e1e4] bg-white transition hover:bg-[#f7f7f8]"
              aria-label="Gifts"
            >
              <Image
                src="/gift.png"
                alt="Gift"
                width={23}
                height={23}
                className="object-contain"
                unoptimized
              />
            </button>

            {/* STREAK */}

            <div className="flex h-10 items-center gap-1.5 rounded-full border border-[#e1e1e4] bg-white px-3 shadow-sm">
              <Image
                src="/streak.png"
                alt="Streak"
                width={23}
                height={23}
                className="object-contain"
                unoptimized
              />

              <span className="text-sm font-bold text-[#202020]">
                0
              </span>
            </div>

            {/* XP */}

            <div className="flex h-10 items-center gap-1.5 rounded-full border border-[#e1e1e4] bg-white px-3 shadow-sm">
              <Image
                src="/xp.png"
                alt="XP"
                width={23}
                height={23}
                className="object-contain"
                unoptimized
              />

              <span className="text-sm font-bold text-[#202020]">
                {(profile?.totalXP ?? 0).toLocaleString()}
              </span>
            </div>

            {/* NOTIFICATION */}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e1e4] bg-white transition hover:bg-[#f7f7f8]"
              aria-label="Notifications"
            >
              <Image
                src="/notification.png"
                alt="Notifications"
                width={23}
                height={23}
                className="object-contain"
                unoptimized
              />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          DASHBOARD BODY
      ===================================================== */}

      <div className="flex">
        {/* ===================================================
            PERMANENT SIDEBAR
        =================================================== */}

        <aside className="fixed bottom-0 left-0 top-12 z-40 hidden w-[250px] border-r border-gray-200 bg-white lg:block">
          <nav className="flex h-full flex-col overflow-y-auto px-4 py-6">
            {/* =================================================
                MAIN
            ================================================= */}

            <div>
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Main
              </p>

              <div className="space-y-1">
                {/* Dashboard */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/dashboard")
                  }
                  className={
                    isActive("/dashboard")
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="dashboard" />
                  Dashboard
                </button>

                {/* My Batches */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/batches",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/batches",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="batches" />
                  My Batches
                </button>

                {/* Study */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/study",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/study",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="study" />
                  Study
                </button>
              </div>
            </div>

            {/* =================================================
                SIGMA FEATURES
            ================================================= */}

            <div className="mt-8">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Sigma Features
              </p>

              <div className="space-y-1">
                {/* Sprint AI */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/sprint-ai",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/sprint-ai",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="ai" />
                  Sprint AI
                </button>

                {/* Scholarship */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/scholarships",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/scholarships",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="scholarship" />
                  Scholarship
                </button>
              </div>
            </div>

            {/* =================================================
                PERFORMANCE
            ================================================= */}

            <div className="mt-8">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Performance
              </p>

              <div className="space-y-1">
                {/* Progress */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/progress",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/progress",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="progress" />
                  Progress
                </button>

                {/* Achievements */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/achievements",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/achievements",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="achievements" />
                  Achievements
                </button>
              </div>
            </div>

            {/* =================================================
                MORE
            ================================================= */}

            <div className="mt-auto pt-8">
              <div className="mb-3 border-t border-gray-100" />

              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                More
              </p>

              <div className="space-y-1">
                {/* Refer & Earn */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/refer",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/refer",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="refer" />
                  Refer & Earn
                </button>

                {/* Help & Support */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/support",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/support",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="support" />
                  Help & Support
                </button>

                {/* About Us */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/about",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/about",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="about" />
                  About Us
                </button>

                {/* Privacy Policy */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/privacy",
                    )
                  }
                  className={
                    isActive(
                      "/dashboard/privacy",
                    )
                      ? activeSidebarItemClass
                      : sidebarItemClass
                  }
                >
                  <SidebarIcon type="privacy" />
                  Privacy Policy
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* ===================================================
            ONLY MAIN CONTENT CHANGES
        =================================================== */}

        <section className="min-w-0 flex-1 px-6 py-10 lg:ml-[250px]">
          {children}
        </section>
      </div>
    </main>
  );
}