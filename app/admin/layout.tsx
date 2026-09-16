"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

type UserProfile = {
  role?: string;
  status?: string;
  displayName?: string;
  profileImage?: string;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

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

          const refreshedUser =
            auth.currentUser;

          if (!refreshedUser) {
            router.replace("/");
            return;
          }

          const userRef = doc(
            db,
            "users",
            refreshedUser.uid,
          );

          const snapshot =
            await getDoc(userRef);

          if (!snapshot.exists()) {
            router.replace("/dashboard");
            return;
          }

          const userData =
            snapshot.data() as UserProfile;

          const role =
            userData.role?.toLowerCase() ?? "";

          const allowed =
            role === "admin" ||
            role === "super_admin" ||
            role === "moderator";

          if (!allowed) {
            router.replace("/dashboard");
            return;
          }

          if (
            userData.status &&
            userData.status !== "active"
          ) {
            router.replace("/dashboard");
            return;
          }

          setUser(refreshedUser);
          setProfile(userData);
          setChecking(false);
        } catch {
          router.replace("/dashboard");
        }
      },
    );

    return () => unsubscribe();
  }, [router]);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(path);
  };

  const sidebarItemClass =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-gray-700 transition hover:bg-[#f7f4fc] hover:text-[#5424ad]";

  const activeClass =
    "flex w-full items-center gap-3 rounded-xl bg-[#f1ebfb] px-4 py-3 text-left text-[15px] font-semibold text-[#5424ad]";

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

  return (
    <main className="min-h-screen bg-[#f7f7f9]">
      {/* HEADER */}

      <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#111111] text-white shadow-md">
        <div className="flex h-full items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="SigmaSprint"
              width={38}
              height={38}
              priority
              className="h-9 w-9 object-contain"
            />

            <span className="text-[22px] font-extrabold tracking-[-0.9px]">
              <span className="text-white">
                Sigma
              </span>
              <span className="text-[#9b6cff]">
                Sprint
              </span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-full bg-[#5424ad]/20 px-4 py-2 text-sm font-semibold text-[#cbb8ff] sm:block">
              {profile?.role === "super_admin"
                ? "Super Admin"
                : profile?.role === "admin"
                  ? "Admin"
                  : "Moderator"}
            </span>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Student View
            </button>

            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#5424ad]">
              {profile?.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {(
                    profile?.displayName ||
                    user?.displayName ||
                    "A"
                  )
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR + CONTENT */}

      <div className="flex">
        <aside className="fixed left-0 top-16 bottom-0 z-40 hidden w-[250px] border-r border-gray-200 bg-white lg:block">
          <nav className="flex h-full flex-col overflow-y-auto px-4 py-6">
            <div>
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Main
              </p>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin")
                  }
                  className={
                    isActive("/admin")
                      ? activeClass
                      : sidebarItemClass
                  }
                >
                  <span className="text-lg">
                    ▦
                  </span>
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/batches")
                  }
                  className={
                    isActive("/admin/batches")
                      ? activeClass
                      : sidebarItemClass
                  }
                >
                  <span className="text-lg">
                    ▤
                  </span>
                  Batches
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/students")
                  }
                  className={sidebarItemClass}
                >
                  <span className="text-lg">
                    ♙
                  </span>
                  Students
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/moderators")
                  }
                  className={sidebarItemClass}
                >
                  <span className="text-lg">
                    ♙
                  </span>
                  Moderators
                </button>
              </div>
            </div>

            <div className="mt-8">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Content
              </p>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/questions",
                    )
                  }
                  className={sidebarItemClass}
                >
                  <span className="text-lg">
                    ?
                  </span>
                  Questions
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/question-sets",
                    )
                  }
                  className={sidebarItemClass}
                >
                  <span className="text-lg">
                    ☷
                  </span>
                  Question Sets
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/curriculum",
                    )
                  }
                  className={sidebarItemClass}
                >
                  <span className="text-lg">
                    ▥
                  </span>
                  Curriculum
                </button>
              </div>
            </div>

            <div className="mt-8">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Communication
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/announcements",
                  )
                }
                className={sidebarItemClass}
              >
                <span className="text-lg">
                  ◈
                </span>
                Announcements
              </button>
            </div>

            <div className="mt-auto pt-8">
              <div className="mb-3 border-t border-gray-100" />

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/settings",
                  )
                }
                className={sidebarItemClass}
              >
                <span className="text-lg">
                  ⚙
                </span>
                Settings
              </button>
            </div>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-6 py-10 lg:ml-[250px]">
          {children}
        </section>
      </div>
    </main>
  );
}