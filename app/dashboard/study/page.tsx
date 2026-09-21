"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { getUserProfile } from "@/lib/auth";
import EmptyEventsClockIcon from "@/components/icons/EmptyEventsClockIcon";

type UserProfile = {
  totalXP?: number;
};

type BatchLevel = {
  id: string;
  name: string;
};


type BatchItem = {
  id: string;
  name: string;
  type: "paid" | "free";
  isStarred: boolean;
  levelId: string | null;
  levels: BatchLevel[];
};

function getNextLevel(
  batch: BatchItem | undefined,
): BatchLevel | null {
  if (!batch || batch.levels.length === 0) {
    return null;
  }

  if (!batch.levelId) {
    return null;
  }

  const currentLevelIndex = batch.levels.findIndex(
    (level) => level.id === batch.levelId,
  );

  if (currentLevelIndex === -1) {
    return null;
  }

  return (
    batch.levels[currentLevelIndex + 1] ?? null
  );
}

export default function StudyPage() {
  const [, setUserProfile] =
    useState<UserProfile | null>(null);

  const [, setXpIconUrl] =
    useState("/xp.png");

  const [,setStreakActive] =
    useState(false);

  const router = useRouter();

  const searchParams = useSearchParams();
const batchIdFromUrl = searchParams.get("batchId") ?? "";

  const [batchMenuOpen, setBatchMenuOpen] =
    useState(false);

  const [batchSelectorOpen, setBatchSelectorOpen] =
    useState(false);

    const [batchSelectorClosing, setBatchSelectorClosing] =
  useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

const [selectedBatchId, setSelectedBatchId] = useState("");
const [activeBatchId, setActiveBatchId] = useState("");
const [batches, setBatches] = useState<BatchItem[]>([]);
const [batchesLoading, setBatchesLoading] = useState(true);

  /*
   * Temporary batch data.
   *
   * This will be replaced with Firestore data
   * after the UI is approved.
   */


const batchMenuRef = useRef<HTMLDivElement>(null);
const batchSelectorRef = useRef<HTMLDivElement>(null);
const batchSelectorTimerRef = useRef<number | null>(null);



useEffect(() => {
  return () => {
    if (batchSelectorTimerRef.current !== null) {
      window.clearTimeout(batchSelectorTimerRef.current);
    }
  };
}, []);

  useEffect(() => {
    async function loadStudyHeader() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const profile = await getUserProfile(
            currentUser.uid,
          );

          setUserProfile(profile);
        } catch (error) {
          console.error(
            "Failed to load user profile:",
            error,
          );
        }
      }

      try {
        const appearanceSnapshot = await getDoc(
          doc(
            db,
            "platformSettings",
            "appearance",
          ),
        );

        if (appearanceSnapshot.exists()) {
          const appearanceData =
            appearanceSnapshot.data();

          if (
            typeof appearanceData.xpIconUrl ===
              "string" &&
            appearanceData.xpIconUrl.trim()
          ) {
            setXpIconUrl(
              appearanceData.xpIconUrl,
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load appearance settings:",
          error,
        );
      }

      /*
       * Temporary streak state.
       *
       * Later this will be connected to the
       * actual daily streak criteria.
       */
      setStreakActive(false);
    }

    void loadStudyHeader();
  }, []);

  useEffect(() => {
  async function loadEnrolledBatches() {
    const user = auth.currentUser;

    if (!user) {
      setBatches([]);
      setBatchesLoading(false);
      return;
    }

    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("uid", "==", user.uid),
        where("status", "==", "active"),
      );

      const enrollmentsSnapshot = await getDocs(
        enrollmentsQuery,
      );

      const enrolledBatches: BatchItem[] = [];

      for (const enrollmentDoc of enrollmentsSnapshot.docs) {
        const enrollment = enrollmentDoc.data();

        if (!enrollment.batchId) {
          continue;
        }

        const batchSnapshot = await getDoc(
          doc(db, "batches", enrollment.batchId),
        );

        if (!batchSnapshot.exists()) {
          continue;
        }

        const batch = batchSnapshot.data();

        const isFreeBatch =
          batch.hasLevels !== true &&
          batch.pricing == null;

       enrolledBatches.push({
  id: batchSnapshot.id,
  name: batch.name ?? "Unnamed Batch",
  type: isFreeBatch ? "free" : "paid",
  isStarred: enrollment.isStarred === true,
  levelId: enrollment.levelId ?? null,
 levels: Array.isArray(batch.levels)
  ? batch.levels.map((level: BatchLevel) => ({
      id: level.id,
      name: level.name,
    }))
  : [],
});
      }

      setBatches(enrolledBatches);

      if (enrolledBatches.length > 0) {
        setActiveBatchId((current) =>
          current || enrolledBatches[0].id,
        );

        setSelectedBatchId((current) =>
          current || enrolledBatches[0].id,
        );
      }
    } catch (error) {
      console.error(
        "Failed to load enrolled batches:",
        error,
      );

      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  }

  loadEnrolledBatches();
}, []);

const closeBatchSelector = () => {
  // Prevent multiple close timers from running at the same time
  if (batchSelectorTimerRef.current !== null) {
    window.clearTimeout(batchSelectorTimerRef.current);
  }

  setBatchSelectorClosing(true);

  batchSelectorTimerRef.current = window.setTimeout(() => {
    setBatchSelectorOpen(false);
    setBatchSelectorClosing(false);
    batchSelectorTimerRef.current = null;
  }, 320);
};

/*
 * Close dropdowns when clicking outside.
 */
useEffect(() => {
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Node;

    if (
      batchMenuRef.current &&
      !batchMenuRef.current.contains(target)
    ) {
      setBatchMenuOpen(false);
    }

    /*
     * The drawer backdrop handles its own close.
     * So the document listener should only close the
     * selector when something outside the whole drawer
     * area triggers the event.
     */
    if (
      batchSelectorOpen &&
      batchSelectorRef.current &&
      !batchSelectorRef.current.contains(target)
    ) {
      const backdrop = document.querySelector(
        '[aria-label="Close batch selector"]',
      );

      if (
        backdrop &&
        backdrop.contains(target)
      ) {
        return;
      }

      closeBatchSelector();
    }
  }

  if (
    batchMenuOpen ||
    batchSelectorOpen
  ) {
    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );
  }

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick,
    );
  };
}, [
  batchMenuOpen,
  batchSelectorOpen,
]);

  /*
   * Prevent the page behind the drawer
   * from scrolling while the selector is open.
   */
  useEffect(() => {
    if (batchSelectorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [batchSelectorOpen]);

  /*
   * Search filtering.
   */
  const filteredBatches =
    batches.filter((batch) =>
      batch.name
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase().trim(),
        ),
    );

  /*
   * Section grouping.
   */
  const starredBatches =
    filteredBatches.filter(
      (batch) => batch.isStarred,
    );

  const paidBatches =
    filteredBatches.filter(
      (batch) =>
        batch.type === "paid" &&
        !batch.isStarred,
    );

  const freeBatches =
    filteredBatches.filter(
      (batch) =>
        batch.type === "free" &&
        !batch.isStarred,
    );


/*
 * Toggle star.
 */
async function toggleStar(batchId: string) {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  const currentBatch = batches.find(
    (batch) => batch.id === batchId,
  );

  if (!currentBatch) {
    return;
  }

  const previousIsStarred = currentBatch.isStarred;
  const nextIsStarred = !previousIsStarred;

  // Update UI immediately.
  setBatches((currentBatches) =>
    currentBatches.map((batch) =>
      batch.id === batchId
        ? {
            ...batch,
            isStarred: nextIsStarred,
          }
        : batch,
    ),
  );

  try {
    const enrollmentsQuery = query(
      collection(db, "enrollments"),
      where("uid", "==", user.uid),
      where("batchId", "==", batchId),
      where("status", "==", "active"),
    );

    const enrollmentsSnapshot = await getDocs(
      enrollmentsQuery,
    );

    if (enrollmentsSnapshot.empty) {
      throw new Error("Enrollment not found.");
    }

    const enrollmentDoc = enrollmentsSnapshot.docs[0];

    await updateDoc(enrollmentDoc.ref, {
      isStarred: nextIsStarred,
    });
  } catch (error) {
    console.error(
      "Failed to update batch star:",
      error,
    );

    // Revert UI if Firestore update fails.
    setBatches((currentBatches) =>
      currentBatches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              isStarred: previousIsStarred,
            }
          : batch,
      ),
    );
  }
}
  /*
   * Continue with selected batch.
   */
function handleContinue() {
  setActiveBatchId(selectedBatchId);
  closeBatchSelector();
  setSearchQuery("");
}

  const activeBatch =
  batches.find(
    (batch) => batch.id === (batchIdFromUrl || activeBatchId),
  ) ?? batches[0];

     const nextLevel = getNextLevel(activeBatch);

  // ============================================================
  // STUDY PAGE — BATCH OFFERINGS
  // Static UI data for the 8 Study feature cards.
  // Functionality and batch-based access will be connected later.
  // ============================================================
  const studyOfferings = [
    {
      title: "Subjects",
      icon: "/icons/study/subjects.svg",
      iconBg: "bg-[#fff0ed]",
    },
    {
      title: "Practice",
      icon: "/icons/study/practice.svg",
      iconBg: "bg-[#fff0f5]",
    },
    {
      title: "Tests",
      icon: "/icons/study/tests.svg",
      iconBg: "bg-[#eef7ff]",
    },
    {
      title: "Progress",
      icon: "/icons/study/progress.svg",
      iconBg: "bg-[#f3efff]",
    },
    {
      title: "Community",
      icon: "/icons/study/community.svg",
      iconBg: "bg-[#edfaf3]",
    },
    {
      title: "Sprint AI",
      icon: "/icons/study/sprint-ai.svg",
      iconBg: "bg-[#f1efff]",
    },
    {
      title: "Study Materials",
      icon: "/icons/study/study-materials.svg",
      iconBg: "bg-[#fff7e8]",
    },
    {
      title: "Infinite Practice",
      icon: "/icons/study/infinite-practice.svg",
      iconBg: "bg-[#edf9f8]",
    },
  ];
  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="h-[58px]" />

      {/* =====================================================
          STUDY MAIN CONTENT
      ===================================================== */}
      <main className="-mx-6 -my-10">

        {/* ===================================================
            BATCH HERO BANNER
        =================================================== */}
        <section className="relative h-[130px] w-full overflow-visible bg-[#101a2f]">

          {/* =================================================
              SUBTLE WAVY BACKGROUND
          ================================================= */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div className="absolute -left-[10%] top-[18px] h-[100px] w-[120%] rotate-[-4deg] border-t border-white/[0.035]" />

            <div className="absolute -left-[10%] top-[42px] h-[100px] w-[120%] rotate-[-4deg] border-t border-white/[0.025]" />

            <div className="absolute -left-[10%] top-[66px] h-[100px] w-[120%] rotate-[-4deg] border-t border-white/[0.02]" />

          </div>

          {/* =================================================
              BANNER CONTENT
          ================================================= */}
          <div className="relative z-10 flex h-full w-full items-center justify-between px-6 sm:px-8 lg:px-10">

            {/* =================================================
                LEFT — BATCH
            ================================================= */}
            <div className="relative min-w-0 flex-1">

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Your Batch
              </p>

              {/* =================================================
                  BATCH SELECTOR
              ================================================= */}
              <button
                type="button"
                className="flex max-w-[250px] items-center gap-2 text-left sm:max-w-[390px]"
                onClick={() => {
                  setBatchSelectorOpen(true);
                  setBatchMenuOpen(false);
                }}
                aria-expanded={
                  batchSelectorOpen
                }
                aria-label="Select batch"
              >
                {/* BATCH NAME */}
                <span className="block max-w-[180px] truncate text-[28px] font-medium text-white sm:max-w-[210px]">
  {activeBatch?.name ?? "SIGMA_SPRINT..."}
</span>

                {/* SELECTOR ARROW */}
                <span
                  className={`mt-1 shrink-0 text-[18px] text-white/75 transition-transform duration-200 ${
                    batchSelectorOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▾
                </span>
              </button>

            </div>

            {/* =================================================
                RIGHT — UPGRADE + MENU
            ================================================= */}
            <div className="ml-4 flex shrink-0 items-center gap-2">

            {/* ===============================================
    COMPACT UPGRADE BUTTON
================================================ */}
{nextLevel && (
  <button
    type="button"
    className="relative flex h-[48px] w-[108px] flex-col items-center justify-center overflow-hidden rounded-[7px] border border-white/10 bg-[linear-gradient(135deg,#32c978_0%,#278e5a_52%,#24513d_100%)] px-2 text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition hover:brightness-105 active:scale-[0.98]"
  >
    {/* DIAGONAL SHIMMER */}
    <span
      className="pointer-events-none absolute -left-[80%] top-[-120%] h-[340%] w-[38%] rotate-[35deg] bg-white/[0.16] blur-[1px] animate-[bannerShine_4s_ease-in-out_infinite]"
    />

    {/* UPGRADE TO */}
    <span className="relative z-10 text-[9px] font-medium leading-tight tracking-[0.07em]">
      UPGRADE TO
    </span>

    {/* NEXT LEVEL */}
    <span className="relative z-10 mt-[2px] text-[12px] font-medium uppercase leading-tight">
      {nextLevel.name}
    </span>
  </button>
)}

             {/* ===============================================
    THREE-DOT MENU
================================================ */}
<div
  ref={batchMenuRef}
  className="relative"
>
  <button
    type="button"
    className="flex h-10 w-8 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
    aria-label="Batch options"
    aria-expanded={batchMenuOpen}
    onClick={() => {
      setBatchMenuOpen(
        (open) => !open,
      );

      setBatchSelectorOpen(
        false,
      );
    }}
  >
    <span className="flex flex-col items-center gap-[3px]">
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
    </span>
  </button>

  {/* =============================================
      THREE-DOT DROPDOWN
  ============================================= */}
  {batchMenuOpen && (
    <div className="absolute right-0 top-12 z-[60] w-[180px] overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white py-1 shadow-[0_12px_30px_rgba(0,0,0,0.20)]">

      {/* DESCRIPTION */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-medium text-[#202020] transition hover:bg-[#f5f5f6]"
        onClick={() => {
          setBatchMenuOpen(false);

          if (!activeBatchId) {
            return;
          }

         router.push(
  `/dashboard/batches/view?batchId=${encodeURIComponent(
   activeBatch?.id ?? "",
  )}&from=study`,
);
        }}
      >
        {/* INFO ICON */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#777] text-[11px] font-semibold text-[#555]">
          i
        </span>

        <span>
          Description
        </span>
      </button>

      {/* SHARE BATCH */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-medium text-[#202020] transition hover:bg-[#f5f5f6]"
        onClick={async () => {
          setBatchMenuOpen(false);

          if (!activeBatchId) {
            return;
          }

          const shareUrl =
            `${window.location.origin}/dashboard/batches/view/?batchId=${encodeURIComponent(
              activeBatchId,
            )}`;

          try {
            if (
              navigator.share
            ) {
              await navigator.share({
                title:
                  activeBatch?.name ??
                  "Sigma-Sprint Batch",
                text:
                  `Check out ${
                    activeBatch?.name ??
                    "this batch"
                  } on Sigma-Sprint.`,
                url: shareUrl,
              });
            } else {
              await navigator.clipboard.writeText(
                shareUrl,
              );
            }
          } catch (error) {
            console.error(
              "Failed to share batch:",
              error,
            );
          }
        }}
      >
        {/* SHARE ICON */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[17px] text-[#555]">
          ↗
        </span>

        <span>
          Share Batch
        </span>
      </button>

    </div>
  )}
</div>


              </div>

            </div>



               </section>

        {/* ===================================================
            BATCH OFFERINGS
        =================================================== */}
        <section className="bg-[#f7f7f8] px-6 py-8 sm:px-8 lg:px-10">

          {/* HEADING */}
          <div className="mb-5">
         <h2 className="text-[21px] font-bold tracking-[-0.025em] text-[#202020]">
  Batch Offerings
</h2>
          </div>

          {/* OFFERING CARDS */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
{studyOfferings.map((offering) => (
 <button
  key={offering.title}
  type="button"
  onClick={() => {
    if (offering.title === "Subjects") {
     router.push(
  `/dashboard/study/subjects?batchId=${encodeURIComponent(
    activeBatch?.id ?? "",
  )}`,
);
    }
  }}
    className="group relative flex min-h-[104px] items-center gap-3 overflow-hidden rounded-[20px] border border-[#e9e9ec] bg-white px-3 py-3 text-left shadow-[0_3px_12px_rgba(0,0,0,0.045)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#ddd9f4] hover:shadow-[0_9px_22px_rgba(0,0,0,0.075)] active:translate-y-0"
  >

    {/* ICON */}
    <div
      className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[17px] ${offering.iconBg} transition-transform duration-200 group-hover:scale-105`}
    >
      <Image
        src={offering.icon}
        alt=""
        width={40}
        height={40}
        className="h-[40px] w-[40px] object-contain"
        unoptimized
      />
    </div>

    {/* NAME */}
    <span className="min-w-0 flex-1 text-[16px] font-semibold tracking-[-0.015em] text-[#202020]">
      {offering.title}
    </span>

    {/* ARROW */}
    <span className="mr-1 shrink-0 text-[25px] font-light leading-none text-[#9d9da3] transition-transform duration-200 group-hover:translate-x-1">
      &gt;
    </span>

  </button>
))}
</div>

               </section>


       {/* ===================================================
    UPCOMING EVENTS
=================================================== */}
<section className="bg-[#f7f7f8] px-6 pb-10 pt-8 sm:px-8 lg:px-10">

  {/* HEADER */}
  <div className="mb-4">
    <h2 className="text-[20px] font-bold tracking-[-0.02em] text-slate-800">
      Upcoming Events (0)
    </h2>
  </div>

  {/* EMPTY EVENT CARD */}
  <div className="rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-sm">

    <div className="flex flex-col items-center justify-center text-center">

      {/* ILLUSTRATION */}
      <EmptyEventsClockIcon
        size={120}
        className="mb-4"
      />

      {/* PRIMARY NOTICE */}
      <p className="text-base font-semibold text-slate-700">
        No upcoming events
      </p>

      {/* SUBTEXT */}
      <p className="mt-1 max-w-[420px] text-sm font-normal leading-6 text-slate-500">
        Perfect time to catch up on your studies and stay ahead.
      </p>

    </div>

  </div>



</section>

{/* ===================================================
    SIGMA-SPRINT MOTTO
=================================================== */}
<div className="px-6 pb-12 pt-10 text-center sm:px-8 lg:px-10">
  <p className="text-[28px] font-semibold tracking-[-0.035em] text-[#8b8b92] sm:text-[32px] lg:text-[36px]">
    Dream big. Learn hard. Go further.
  </p>

  <p className="mt-2 text-[14px] font-medium tracking-[-0.01em] text-[#b0b0b5]">
    ❤️ From Sigma-Sprint
  </p>
</div>
      </main>

          {/* =====================================================
          BATCH SELECTOR DRAWER
      ===================================================== */}
      {batchSelectorOpen && (
        <div className="fixed inset-0 z-[100]">

          {/* =================================================
              BACKDROP
          ================================================= */}
          <button
            type="button"
            aria-label="Close batch selector"
            className="absolute inset-0 bg-black/35"
            onClick={closeBatchSelector}
          />

          {/* =================================================
              RIGHT SIDE DRAWER
          ================================================= */}
          <div
            ref={batchSelectorRef}
           className={`absolute right-0 top-0 flex h-full w-full max-w-[370px] flex-col bg-white shadow-[-10px_0_35px_rgba(0,0,0,0.16)] ${
  batchSelectorClosing
    ? "animate-[batchDrawerOut_320ms_ease-in]"
    : "animate-[batchDrawerIn_320ms_ease-out]"
}`}
          >

            {/* =================================================
                DRAWER HEADER
            ================================================= */}
            <div className="border-b border-[#e7e7ea] px-4 pb-4 pt-4">

              <div className="flex items-center justify-between">

                <h2 className="text-[18px] font-medium tracking-[-0.01em] text-[#202020]">
                  Select your batch
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[22px] font-light leading-none text-[#666] transition hover:bg-[#f3f3f4] hover:text-[#202020]"
                  onClick={closeBatchSelector}
                >
                  ×
                </button>

              </div>

              {/* =================================================
                  SEARCH
              ================================================= */}
              <div className="relative mt-3">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#777]">
                  ⌕
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search for your batches"
                  className="h-10 w-full rounded-[7px] border border-[#dedee3] bg-[#f8f8f9] pl-9 pr-3 text-[13px] font-normal text-[#202020] outline-none transition placeholder:text-[#999] focus:border-[#a8a0d8] focus:bg-white focus:ring-2 focus:ring-[#6f5bd3]/10"
                />

              </div>

            </div>
{/* =================================================
    BATCH LIST
================================================= */}
<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
  {batchesLoading ? (
    <div className="flex min-h-[180px] items-center justify-center">
      <span className="text-[13px] text-[#888]">
        Loading batches...
      </span>
    </div>
  ) : batches.length === 0 ? (
    <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
      <span className="text-[13px] text-[#888]">
        You are not enrolled in any batches yet.
      </span>
    </div>
  ) : (
    <>
      {/* =================================================
          STARRED BATCHES
      ================================================= */}
      {starredBatches.length > 0 && (
        <section>
          <h3 className="mb-2 px-2 text-[15px] font-medium uppercase tracking-[0.08em] text-[#202020]">
            Starred Batch ({starredBatches.length})
          </h3>

          <div className="divide-y divide-[#eeeeF0]">
            {starredBatches.map((batch) => (
              <div
                key={batch.id}
                className={`flex min-h-[50px] items-center gap-2 rounded-[7px] px-2 transition ${
                  selectedBatchId === batch.id
                    ? "bg-[#f1edff]"
                    : "hover:bg-[#f7f7f8]"
                }`}
              >
               {/* STAR */}
<button
  type="button"
  aria-label="Unstar batch"
  className="flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-150 hover:scale-110"
  onClick={() => toggleStar(batch.id)}
>
  <Image
    src="/icons/star-filled.png"
    alt=""
    width={22}
    height={22}
    className="h-[22px] w-[22px] object-contain"
  />
</button>

                {/* BATCH NAME */}
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <span className="block truncate text-[14px] font-normal text-[#202020]">
                    {batch.name}
                  </span>
                </button>

                {/* RADIO */}
                <button
                  type="button"
                  aria-label={`Select ${batch.name}`}
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition ${
                    selectedBatchId === batch.id
                      ? "border-[#6f5bd3]"
                      : "border-[#b9b9bf]"
                  }`}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  {selectedBatchId === batch.id && (
                    <span className="h-2 w-2 rounded-full bg-[#6f5bd3]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          PAID BATCHES
      ================================================= */}
      {paidBatches.length > 0 && (
        <section
          className={
            starredBatches.length > 0
              ? "mt-6"
              : ""
          }
        >
          <h3 className="mb-2 px-2 text-[15px] font-medium uppercase tracking-[0.08em] text-[#202020]">
            Paid Batch ({paidBatches.length})
          </h3>

          <div className="divide-y divide-[#eeeeF0]">
            {paidBatches.map((batch) => (
              <div
                key={batch.id}
                className={`flex min-h-[50px] items-center gap-2 rounded-[7px] px-2 transition ${
                  selectedBatchId === batch.id
                    ? "bg-[#f1edff]"
                    : "hover:bg-[#f7f7f8]"
                }`}
              >
             {/* STAR */}
<button
  type="button"
  aria-label="Star batch"
  className="flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-150 hover:scale-110"
  onClick={() => toggleStar(batch.id)}
>
  <Image
    src="/icons/star-outline.png"
    alt=""
    width={25}
    height={25}
    className="h-[22px] w-[22px] object-contain"
  />
</button>

                {/* BATCH NAME */}
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <span className="block truncate text-[14px] font-normal text-[#202020]">
                    {batch.name}
                  </span>
                </button>

                {/* RADIO */}
                <button
                  type="button"
                  aria-label={`Select ${batch.name}`}
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition ${
                    selectedBatchId === batch.id
                      ? "border-[#6f5bd3]"
                      : "border-[#b9b9bf]"
                  }`}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  {selectedBatchId === batch.id && (
                    <span className="h-2 w-2 rounded-full bg-[#6f5bd3]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          FREE BATCHES
      ================================================= */}
      {freeBatches.length > 0 && (
        <section
          className={
            starredBatches.length > 0 ||
            paidBatches.length > 0
              ? "mt-6"
              : ""
          }
        >
          <h3 className="mb-2 px-2 text-[15px] font-medium uppercase tracking-[0.08em] text-[#202020]">
            Free Batch ({freeBatches.length})
          </h3>

          <div className="divide-y divide-[#eeeeF0]">
            {freeBatches.map((batch) => (
              <div
                key={batch.id}
                className={`flex min-h-[50px] items-center gap-2 rounded-[7px] px-2 transition ${
                  selectedBatchId === batch.id
                    ? "bg-[#f1edff]"
                    : "hover:bg-[#f7f7f8]"
                }`}
              >
               {/* STAR */}
<button
  type="button"
  aria-label="Star batch"
  className="flex h-8 w-8 shrink-0 items-center justify-center text-[21px] leading-none text-[#777] transition hover:scale-105 hover:text-[#f3c430]"
  onClick={() => toggleStar(batch.id)}
>
  ☆
</button>

                {/* BATCH NAME */}
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <span className="block truncate text-[14px] font-normal text-[#202020]">
                    {batch.name}
                  </span>
                </button>

                {/* RADIO */}
                <button
                  type="button"
                  aria-label={`Select ${batch.name}`}
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition ${
                    selectedBatchId === batch.id
                      ? "border-[#6f5bd3]"
                      : "border-[#b9b9bf]"
                  }`}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  {selectedBatchId === batch.id && (
                    <span className="h-2 w-2 rounded-full bg-[#6f5bd3]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>



      )}
    </>
  )}
</div>

                         {/* =================================================
                  NO SEARCH RESULTS
              ================================================= */}
              {filteredBatches.length === 0 && (
                <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
                  <div>
                    <p className="text-[14px] font-normal text-[#333]">
                      No batches found
                    </p>

                    <p className="mt-1 text-[12px] font-normal text-[#888]">
                      Try searching with a different name.
                    </p>
                  </div>
                </div>
              )}

            {/* =================================================
                FOOTER
            ================================================= */}
            <div className="shrink-0 border-t border-[#e7e7ea] bg-white px-4 py-3">
              <button
                type="button"
                className="h-10 w-full rounded-[7px] bg-[#202020] text-[13px] font-normal tracking-[0.02em] text-white transition hover:bg-[#111] active:scale-[0.99]"
                onClick={handleContinue}
              >
                CONTINUE
              </button>
            </div>
    </div>
          </div>

      )}

    </div>
  );
}