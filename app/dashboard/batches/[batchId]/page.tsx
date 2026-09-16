"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type PricingOption = "Monthly" | "Yearly" | "Both";

type BatchLevel = {
  name: "Basic" | "Standard" | "Premium";
  features: string[];
  pricingOption: PricingOption;
  monthlyOriginalPrice: number;
  monthlyPrice: number;
  monthlyDiscountPercent: number;
  yearlyOriginalPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
};

type FirestoreBatch = {
  id?: string;
  name?: string;
  bannerUrl?: string;
  description?: string;
  targetAudience?: string;
  examGoal?: string;
  languages?: string[];
  type?: string;
  paymentType?: string;
  originalPrice?: number;
  price?: number;
  discountPercent?: number;
  monthlyOriginalPrice?: number;
  monthlyPrice?: number;
  monthlyDiscountPercent?: number;
  yearlyOriginalPrice?: number;
  yearlyPrice?: number;
  yearlyDiscountPercent?: number;
  pricingOption?: PricingOption;
  hasLevels?: boolean;
  levels?: BatchLevel[];
  features?: string[];
  startDate?: string;
  endDate?: string;
  isVisible?: boolean;
    subjects?: {
    name: string;
    topics: string[];
  }[];
};

function getNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getDiscount(originalPrice: number, price: number): number {
  if (
    originalPrice <= 0 ||
    price <= 0 ||
    price >= originalPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

function formatDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLevelPricing(level: BatchLevel) {
  if (level.pricingOption === "Monthly") {
    return {
      originalPrice: level.monthlyOriginalPrice,
      price: level.monthlyPrice,
      discount:
        level.monthlyDiscountPercent ||
        getDiscount(
          level.monthlyOriginalPrice,
          level.monthlyPrice,
        ),
    };
  }

  if (level.pricingOption === "Yearly") {
    return {
      originalPrice: level.yearlyOriginalPrice,
      price: level.yearlyPrice,
      discount:
        level.yearlyDiscountPercent ||
        getDiscount(
          level.yearlyOriginalPrice,
          level.yearlyPrice,
        ),
    };
  }

  return {
    originalPrice: level.yearlyOriginalPrice,
    price: level.yearlyPrice,
    discount:
      level.yearlyDiscountPercent ||
      getDiscount(
        level.yearlyOriginalPrice,
        level.yearlyPrice,
      ),
  };
}

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 9L12 4L17 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5424ad] text-white">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 6L18 12L9 18V6Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export default function BatchDetailsPage() {
  const params = useParams();

  const batchId =
    typeof params.batchId === "string"
      ? params.batchId
      : "";

  const [batch, setBatch] =
    useState<FirestoreBatch | null>(null);

    const [openSubjectIndex, setOpenSubjectIndex] = useState<number | null>(null);

    const [comparePlansOpen, setComparePlansOpen] =
  useState(false);

  const [enrolled, setEnrolled] =
    useState(false);

    const [enrollmentSuccessOpen, setEnrollmentSuccessOpen] =
  useState(false);

const [enrolling, setEnrolling] =
  useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("Description");

  const [selectedPlan, setSelectedPlan] =
    useState("");

  const [featuresOpen, setFeaturesOpen] =
    useState(true);

  const [xpIconUrl, setXpIconUrl] =
    useState("/xp.png");

  useEffect(() => {
    if (!batchId) return;

    let cancelled = false;

    async function loadBatch() {
      try {
        setLoading(true);
        setError("");

        const batchSnapshot =
          await getDoc(
            doc(
              db,
              "batches",
              batchId,
            ),
          );

        const appearanceSnapshot =
          await getDoc(
            doc(
              db,
              "platformSettings",
              "appearance",
            ),
          );

        if (
          appearanceSnapshot.exists()
        ) {
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

        if (!batchSnapshot.exists()) {
          if (!cancelled) {
            setError("Batch not found.");
          }

          return;
        }

        const data =
          batchSnapshot.data() as FirestoreBatch;

        if (data.isVisible === false) {
          if (!cancelled) {
            setError(
              "This batch is not available.",
            );
          }

          return;
        }

        const currentUser =
          auth.currentUser;

        let isEnrolled = false;

        if (currentUser) {
          const enrollmentQuery =
            query(
              collection(
                db,
                "enrollments",
              ),
              where(
                "uid",
                "==",
                currentUser.uid,
              ),
              where(
                "batchId",
                "==",
                batchId,
              ),
            );

          const enrollmentSnapshot =
            await getDocs(
              enrollmentQuery,
            );

          isEnrolled =
            !enrollmentSnapshot.empty;
        }

        if (!cancelled) {
          const loadedLevels =
            Array.isArray(data.levels)
              ? data.levels
              : [];

          setBatch({
            ...data,
            id: batchId,
          });

          setEnrolled(
            isEnrolled,
          );

          if (
            data.hasLevels === true &&
            loadedLevels.length > 0
          ) {
            setSelectedPlan(
              loadedLevels[0].name,
            );
          }
        }
      } catch (loadError) {
        console.error(
          "Failed to load batch:",
          loadError,
        );

        if (!cancelled) {
          setError(
            "Unable to load this batch right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBatch();

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm font-medium text-[#777]">
          Loading batch...
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href="/dashboard/batches"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#5424ad] hover:underline"
        >
          <BackIcon />
          Back to batches
        </Link>

        <div className="mt-8 rounded-[18px] border border-[#e1e1e1] bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#171717]">
            {error || "Batch not found."}
          </h1>
        </div>
      </div>
    );
  }

  const levels =
    Array.isArray(batch.levels)
      ? batch.levels
      : [];

const isFreeBatch =
  batch.type?.toLowerCase() === "free" ||
  batch.paymentType?.toLowerCase() === "free";

const isMultiplePlan =
  !isFreeBatch &&
  batch.hasLevels === true &&
  levels.length > 1;

  const displayFeatures =
    Array.isArray(batch.features)
      ? batch.features
      : [];

  const selectedLevel =
    levels.find(
      (level) =>
        level.name === selectedPlan,
    ) ?? levels[0];

  const selectedLevelFeatures =
    selectedLevel &&
    Array.isArray(
      selectedLevel.features,
    )
      ? selectedLevel.features
      : [];

  const featuresToShow =
    isMultiplePlan
      ? selectedLevelFeatures
      : displayFeatures;

  const displayPricing = {
    originalPrice:
      getNumber(
        batch.originalPrice,
      ),
    price:
      getNumber(
        batch.price,
      ),
    discount:
      getNumber(
        batch.discountPercent,
      ),
  };

  const primaryPricing =
    selectedLevel
      ? getLevelPricing(
          selectedLevel,
        )
      : displayPricing;

  const tabs = [
    "Description",
    "All Classes",
    "Infinity Learning",
    "Tests",
    "Community",
  ];

  const handleFreeEnrollment = async () => {
  const currentUser = auth.currentUser;
  

  if (!currentUser || !batch.id || !isFreeBatch) {
    return;
  }

  if (enrolled || enrolling) {
    return;
  }

  try {
    setEnrolling(true);
    console.log("STARTING FIRESTORE ENROLLMENT");

    const enrollmentRef = doc(
      collection(db, "enrollments"),
    );

    await setDoc(enrollmentRef, {
      uid: currentUser.uid,
      batchId: batch.id,
      batchName: batch.name || "",
      type: "free",
      status: "active",
      enrolledAt: serverTimestamp(),
    });

    setEnrolled(true);
    setEnrollmentSuccessOpen(true);
  } catch (enrollmentError) {
    console.error(
      "Failed to enroll in free batch:",
      enrollmentError,
    );
  } finally {
    setEnrolling(false);
  }
};

  const shareBatch = async () => {
    const shareData = {
      title:
        batch.name ||
        "SigmaSprint Batch",
      text:
        `Check out ${batch.name || "this batch"} on SigmaSprint.`,
      url:
        window.location.href,
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData,
        );
      } else {
        await navigator.clipboard.writeText(
          window.location.href,
        );
      }
    } catch {
      // User cancelled sharing.
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-12">
      {/* WHITE BATCH HEADER */}
      <div className="fixed left-0 right-0 top-12 z-40 border-b border-[#e4e4e7] bg-white shadow-sm lg:left-[250px]">
        <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/batches"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#292929] transition hover:text-[#5424ad]"
          >
            <BackIcon />
            Back
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[#e1e1e4] bg-white px-3.5 py-2 shadow-sm">
            <Image
              src={xpIconUrl}
              alt="XP"
              width={23}
              height={23}
              unoptimized
              className="object-contain"
            />

            <span className="text-sm font-bold text-[#202020]">
              {getNumber(
                (
                  auth.currentUser as unknown as {
                    totalXP?: number;
                  } | null
                )?.totalXP,
              ).toLocaleString()}{" "}
              XP
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-[35px] sm:px-6 lg:px-8">
        {/* PURPLE BATCH NAME */}
        <section className="overflow-hidden rounded-t-[20px] bg-[#5424ad] shadow-sm">
          <div className="px-6 py-7 sm:px-9">
           <h1 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
  {batch.name} {batch.targetAudience && `(${batch.targetAudience})`}
</h1>
          </div>
        </section>

        {/* WHITE NAVIGATION */}
        <div className="overflow-x-auto border-b border-[#e2e2e5] bg-white">
          <div className="flex min-w-max items-center gap-1 px-4 py-2.5 sm:px-6">
            {tabs.map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#f0e9ff] text-[#5424ad]"
                      : "text-[#666] hover:bg-[#f7f7f8] hover:text-[#222]"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                void shareBatch()
              }
              className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#d9d9dc] px-3.5 py-2 text-sm font-semibold text-[#303030] transition hover:border-[#5424ad] hover:text-[#5424ad]"
            >
              <ShareIcon />
              Share Batch
            </button>
          </div>
        </div>

        {/* GAP BEFORE CONTENT */}
        <div className="h-5" />

      {/* CONTENT AREA */}
<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

  {/* LEFT CONTENT */}
  <main className="min-w-0">

    {activeTab === "Description" && (
      <>

        {/* CHOOSE PLAN + FEATURES */}
        {isMultiplePlan ? (
          <section className="rounded-[20px] border border-[#e3e3e6] bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#171717]">
                Choose a Plan
              </h2>

          <button
  type="button"
  onClick={() => {
    setComparePlansOpen(true);
  }}
  className="shrink-0 rounded-[8px] bg-[#5a4bda] px-6 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#4d40c4] active:scale-[0.98]"
>
  Compare Plans
</button>
            </div>

            {/* PLAN SELECTOR */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {levels.map((level, index) => {
                const selected =
                  selectedPlan === level.name;

                const gradients = [
                  "from-[#ede7ff] via-[#f4efff] to-[#e9ddff]",
                  "from-[#e5f4ff] via-[#eef8ff] to-[#dceeff]",
                  "from-[#e7f8ee] via-[#f0fbf4] to-[#dcf4e7]",
                ];

                return (
                  <button
                    key={level.name}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(level.name);
                    }}
                    className={`relative h-[68px] overflow-visible rounded-[10px] border bg-gradient-to-br px-3 text-left transition ${
                      gradients[index % gradients.length]
                    } ${
                      selected
                        ? "border-[#5424ad] shadow-sm"
                        : "border-[#dedee2] hover:border-[#bcb4ce]"
                    }`}
                  >
                    <div className="flex h-full items-center justify-center">
                      <h3 className="text-sm font-bold text-[#171717] sm:text-base">
                        {level.name}
                      </h3>
                    </div>

                    {/* SELECTION CIRCLE */}
                    <span
                      className={`absolute -bottom-[10px] left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-[#5424ad] bg-[#5424ad] text-white"
                          : "border-[#bcbcc1] bg-white text-transparent"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 12.5L10 17.5L19 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

 {/* FEATURES */}
<div className="mt-3 rounded-[16px] border border-[#e0e0e3] bg-[#f1f1f3]">
  <button
    type="button"
    onClick={() =>
      setFeaturesOpen(
        (value) => !value,
      )
    }
    className="flex w-full items-center justify-between px-5 py-4 text-left"
  >
    <span className="text-sm font-bold text-[#242424]">
      {selectedPlan
        ? `${selectedPlan} Includes`
        : "Plan Includes"}
    </span>

    <span className="text-[#555]">
      <ChevronIcon
        open={featuresOpen}
      />
    </span>
  </button>

  {/* ANIMATED FEATURES */}
  <div
    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
      featuresOpen
        ? "grid-rows-[1fr] opacity-100"
        : "grid-rows-[0fr] opacity-0"
    }`}
  >
    <div className="min-h-0 overflow-hidden">
      <div className="grid gap-px border-t border-[#dedee1] bg-[#dedee1] sm:grid-cols-3">
        {featuresToShow.length > 0 ? (
          featuresToShow.map(
            (feature, index) => {
              const selectedIndex =
                levels.findIndex(
                  (level) =>
                    level.name ===
                    selectedPlan,
                );

              const planIndex =
                selectedIndex >= 0
                  ? selectedIndex
                  : 0;

              const starGradients = [
                "from-[#7c3aed] via-[#a855f7] to-[#c084fc]",
                "from-[#0284c7] via-[#38bdf8] to-[#60a5fa]",
                "from-[#16a34a] via-[#4ade80] to-[#86efac]",
              ];

              return (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-center gap-3 bg-[#f1f1f3] px-4 py-5 text-base font-bold text-[#242424] sm:text-lg"
                >
                  <span
                    className={`shrink-0 bg-gradient-to-br ${
                      starGradients[
                        planIndex %
                          starGradients.length
                      ]
                    } bg-clip-text text-xl leading-none text-transparent sm:text-2xl`}
                  >
                    ★
                  </span>

                  <span className="leading-6">
                    {feature}
                  </span>
                </div>
              );
            },
          )
        ) : (
          <div className="bg-[#f1f1f3] px-4 py-5 text-sm text-[#777] sm:col-span-3">
            No features added yet.
          </div>
        )}
      </div>
    </div>
  </div>
</div>

                      {/* CALLOUT */} 
            <button 
              type="button" 
              className="mt-3 flex w-full items-center gap-3 rounded-[12px] border border-[#e1d8f4] bg-[#f7f3ff] px-4 py-3 text-left transition hover:bg-[#f0e9ff]" 
            > 
              <PlayIcon /> 
 
              <div> 
                <p className="text-sm font-bold text-[#27202f]"> 
                  Discover the benefits 
                </p> 
 
                <p className="text-xs text-[#766b80]"> 
                  Learn what this plan includes 
                </p> 
              </div> 
            </button> 
 
          </section> 
 
            ) : isFreeBatch ? (

          <section className="overflow-hidden rounded-[20px] border border-[#e3e3e6] bg-white shadow-sm">
            {/* FREE BATCH FEATURES */}
            {/* GRADIENT HEADER */} 
            <div className="relative overflow-hidden bg-gradient-to-r from-[#5424ad] via-[#7c3aed] to-[#a855f7] px-5 py-5 sm:px-6"> 
              <div className="relative z-10"> 
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/75"> 
                  Batch Features 
                </p> 
 
                <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-white"> 
                  {batch.name} Includes 
                </h2> 
              </div> 
 
              <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/10 blur-2xl" /> 
              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-3xl" /> 
            </div> 
 
            {/* FEATURES */} 
            <div className="grid gap-px bg-[#e8e8eb] sm:grid-cols-2"> 
              {displayFeatures.length > 0 ? ( 
                displayFeatures.map((feature, index) => ( 
                  <div 
                    key={`${feature}-${index}`} 
                    className="flex items-center gap-3 bg-white px-5 py-4 text-sm font-semibold text-[#242424] transition hover:bg-[#faf8ff] sm:px-6" 
                  > 
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5424ad] to-[#a855f7] text-white shadow-sm"> 
                      <CheckIcon /> 
                    </span> 
 
                    <span className="leading-6"> 
                      {feature} 
                    </span> 
                  </div> 
                )) 
              ) : ( 
                <div className="px-5 py-5 text-sm text-[#777] sm:col-span-2"> 
                  No features added yet. 
                </div> 
              )} 
            </div> 
 
          </section> 
 
        ) : null} 

        {/* DESCRIPTION + THIS BATCH INCLUDES */}
        <section className="mt-6 rounded-[20px] border border-[#e3e3e6] bg-white p-5 shadow-sm sm:p-6">

          {/* DESCRIPTION */}
          <div>
            <h2 className="text-xl font-bold text-[#5424ad]">
              Description
            </h2>

            {batch.description ? (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#555]">
                {batch.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-[#888]">
                No description available.
              </p>
            )}
          </div>

          {/* THIS BATCH INCLUDES */}
          <div className="mt-8 border-t border-[#eeeeef] pt-7">
            <h2 className="text-xl font-bold text-[#5424ad]">
              This Batch Includes
            </h2>

            <div className="mt-5 space-y-5">

              {(batch.startDate ||
                batch.endDate) && (
                <div className="flex gap-3">
                  <span className="mt-0.5 text-lg">
                    📅
                  </span>

                  <div>
                    <p className="text-sm font-bold text-[#252525]">
                      Course Duration
                    </p>

                    <p className="mt-1 text-sm text-[#666]">
                      {batch.startDate
                        ? formatDate(
                            batch.startDate,
                          )
                        : "—"}{" "}
                      -{" "}
                      {batch.endDate
                        ? formatDate(
                            batch.endDate,
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <span className="mt-0.5 text-lg">
                  ⏳
                </span>

                <div>
                  <p className="text-sm font-bold text-[#252525]">
                    Validity
                  </p>

                  <p className="mt-1 text-sm text-[#666]">
                    Valid until{" "}
                    {batch.endDate
                      ? formatDate(
                          batch.endDate,
                        )
                      : "the end of the batch"}
                  </p>
                </div>
              </div>

              {displayFeatures.length >
                0 && (
                <div className="flex gap-3">
                  <span className="mt-0.5 text-lg">
                    ⭐
                  </span>

                  <div>
                    <p className="text-sm font-bold text-[#252525]">
                      Key Features
                    </p>

                    <div className="mt-2 space-y-1.5">
                      {displayFeatures.map(
                        (feature) => (
                          <p
                            key={feature}
                            className="text-sm leading-6 text-[#666]"
                          >
                            <span className="mr-2 text-[#5424ad]">
                              ★
                            </span>
                            {feature}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

<div className="flex gap-3">
  <span className="mt-0.5 text-lg">
    📚
  </span>

  <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-[#252525]">
      Curriculum
    </p>

    {Array.isArray(batch.subjects) &&
    batch.subjects.length > 0 ? (
      <div className="mt-3 overflow-hidden rounded-xl border border-[#e8e8eb] bg-white">
        {batch.subjects.map((subject, subjectIndex) => {
          const isOpen =
            openSubjectIndex === subjectIndex;

          return (
            <div
              key={`${subject.name}-${subjectIndex}`}
              className="border-b border-[#eeeeef] last:border-b-0"
            >
              {/* Subject */}
              <button
                type="button"
                onClick={() =>
                  setOpenSubjectIndex(
                    isOpen ? null : subjectIndex,
                  )
                }
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[#fafafa]"
              >
                <span className="text-sm font-semibold text-[#252525]">
                  {subject.name}
                </span>

                {/* Arrow */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4f0ff] text-[#5424ad] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>

              {/* Topics dropdown */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="px-4 pb-4 pt-1">
                    {Array.isArray(subject.topics) &&
                    subject.topics.length > 0 ? (
                      <div className="space-y-2">
                        {subject.topics.map(
                          (topic, topicIndex) => (
                            <div
                              key={`${topic}-${topicIndex}`}
                              className="flex items-center gap-2 rounded-lg bg-[#faf8ff] px-3 py-2.5"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7c4dff]" />

                              <span className="text-sm text-[#555]">
                                {topic}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#888]">
                        Topics will be added soon.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="mt-1 text-sm leading-6 text-[#666]">
        Curriculum will be added soon.
      </p>
    )}
  </div>
</div>

            </div>
          </div>

        </section>
      </>
    )}

    {activeTab !== "Description" && (
      <section className="rounded-[20px] border border-[#e3e3e6] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-[#5424ad]">
          {activeTab}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#777]">
          This section will be built specifically for this batch.
        </p>
      </section>
    )}

  </main>

  {/* RIGHT STICKY PURCHASE CARD */}
  <aside className="lg:sticky lg:top-[124px]">
    <div className="overflow-hidden rounded-[18px] border border-[#dedee2] bg-white shadow-sm">

      <div className="relative mx-2 mt-2 aspect-[16/8] overflow-hidden rounded-[12px] border border-white bg-[#5424ad]">
        {batch.bannerUrl ? (
          <Image
            src={batch.bannerUrl}
            alt={
              batch.name ||
              "Batch banner"
            }
            fill
            unoptimized
            sizes="360px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-lg font-bold text-white">
            {batch.name}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-lg font-bold leading-tight text-white">
            {batch.name}
          </p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        {batch.targetAudience ? (
          <span className="max-w-[72%] rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-semibold leading-5 text-[#e85b19]">
            For {batch.targetAudience}
          </span>
        ) : (
          <span />
        )}

        {batch.languages?.[0] && (
          <span className="rounded-[5px] border border-[#d3d3d6] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#333]">
            {batch.languages[0]}
          </span>
        )}
      </div>

      <div className="bg-[#faf9fc] p-5">
       {isMultiplePlan &&
selectedLevel ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                 {selectedLevel?.name ?? "Plan"} Plan
                </p>

                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#111]">
                    NPR{" "}
                    {primaryPricing.price.toLocaleString()}
                  </span>

                  {primaryPricing.originalPrice >
                    0 && (
                    <span className="text-sm text-[#888] line-through">
                      NPR{" "}
                      {primaryPricing.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {primaryPricing.discount >
                  0 && (
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#e8f7ed] px-2.5 py-1.5 text-[11px] font-bold text-[#159447]">
                    <Image
                      src="/price-discount.svg"
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                    />
                    {primaryPricing.discount}% OFF
                  </span>
                )}
              </div>

              <button
                type="button"
                className="flex h-11 shrink-0 items-center justify-center rounded-[8px] bg-[#5b2bb8] px-5 text-sm font-bold text-white transition hover:bg-[#4d239c]"
              >
                {enrolled
                  ? "Enrolled"
                  : "Buy Now"}
              </button>
            </div>
          </>
   ) : isFreeBatch ? (
  enrolled ? (
    <button
      type="button"
      disabled
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-[#16a34a] text-sm font-extrabold text-white shadow-sm"
    >
      <CheckIcon />
      Enrolled
    </button>
  ) : (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#888]">
          Batch Access
        </p>

        <p className="mt-1 text-2xl font-extrabold text-[#111]">
          FREE
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          void handleFreeEnrollment();
        }}
        disabled={enrolling}
        className="flex h-11 shrink-0 items-center justify-center rounded-[8px] bg-[#5b2bb8] px-5 text-sm font-bold text-white transition hover:bg-[#4d239c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enrolling ? "Enrolling..." : "Enroll Now"}
      </button>
    </div>
  )
) : (
  <div className="flex items-end justify-between gap-3">
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-extrabold text-[#111]">
          NPR{" "}
          {displayPricing.price.toLocaleString()}
        </span>

        {displayPricing.originalPrice > 0 && (
          <span className="text-sm text-[#888] line-through">
            NPR{" "}
            {displayPricing.originalPrice.toLocaleString()}
          </span>
        )}
      </div>

      {displayPricing.discount > 0 && (
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#e8f7ed] px-2.5 py-1.5 text-[11px] font-bold text-[#159447]">
          <Image
            src="/price-discount.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
          />
          {displayPricing.discount}% OFF
        </span>
      )}
    </div>

    <button
      type="button"
      className="flex h-11 shrink-0 items-center justify-center rounded-[8px] bg-[#5b2bb8] px-5 text-sm font-bold text-white transition hover:bg-[#4d239c]"
    >
      {enrolled ? "Enrolled" : "Buy Now"}
    </button>
  </div>
)}

{isMultiplePlan &&
  selectedLevel?.pricingOption ===
    "Both" && (
    <p className="mt-3 text-xs text-[#777]">
      Monthly plan also available.
    </p>
  )}
            </div>
        </div>
      </aside>
    </div>
      
{comparePlansOpen && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[3px] sm:p-5"
    onClick={() => setComparePlansOpen(false)}
  >
    <div
      className="flex h-[80vh] w-[95vw] max-w-[1200px] flex-col overflow-hidden rounded-[16px] border border-[#2d3748] bg-[#12161e] shadow-2xl lg:w-[70vw]"
      onClick={(event) => event.stopPropagation()}
    >
      {/* =========================================================
          MODAL HEADER
      ========================================================= */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#2d3748] bg-[#12161e] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-[20px] font-bold leading-tight text-white sm:text-[22px]">
            {batch.name}
            {batch.targetAudience &&
              ` (${batch.targetAudience})`}
          </h2>

          <p className="mt-1 text-xs text-[#94a3b8] sm:text-sm">
            Compare plans and choose the one that suits you
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComparePlansOpen(false)}
          className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-2xl leading-none text-[#a0aec0] transition hover:bg-white/10 hover:text-white"
          aria-label="Close compare plans"
        >
          ×
        </button>
      </div>

      {/* =========================================================
          PLAN SELECTOR
      ========================================================= */}
      <div className="shrink-0 border-b border-[#2d3748] bg-[#12161e] px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[19px] font-bold text-white sm:text-[22px]">
            Choose a Plan
          </h3>

          <span className="hidden text-sm font-medium text-[#64748b] sm:block">
            Select a plan to compare
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {levels.map((level, index) => {
            const selected =
              selectedPlan === level.name;

            const planStyles = [
              {
                gradient:
                  "from-[#08252e] via-[#0b313d] to-[#0b1d26]",
                border:
                  "border-[#28566a]",
                selectedBorder:
                  "border-[#38bdf8]",
                text:
                  "text-[#60a5fa]",
                circle:
                  "border-[#e0a838] bg-[#e0a838]",
                wave:
                  "bg-[#0e4658]/70",
              },
              {
                gradient:
                  "from-[#0d281e] via-[#123b2a] to-[#091d16]",
                border:
                  "border-[#27583f]",
                selectedBorder:
                  "border-[#a3e635]",
                text:
                  "text-[#a3e635]",
                circle:
                  "border-[#e0a838] bg-[#e0a838]",
                wave:
                  "bg-[#175538]/70",
              },
              {
                gradient:
                  "from-[#2c2208] via-[#3a2b0a] to-[#1c1505]",
                border:
                  "border-[#7c5a18]",
                selectedBorder:
                  "border-[#f6c453]",
                text:
                  "text-[#f6c453]",
                circle:
                  "border-[#e0a838] bg-[#e0a838]",
                wave:
                  "bg-[#5b420d]/70",
              },
            ];

           

            const style =
              planStyles[index % planStyles.length];

            return (
              <button
                key={level.name}
                type="button"
                onClick={() =>
                  setSelectedPlan(level.name)
                }
                className={`relative h-[72px] overflow-visible rounded-[12px] border-2 bg-gradient-to-br px-2 text-center transition-all duration-200 sm:h-[78px] sm:px-4 ${
                  style.gradient
                } ${
                  selected
                    ? `${style.selectedBorder} shadow-[0_0_18px_rgba(163,230,53,0.12)]`
                    : `${style.border} hover:-translate-y-[1px] hover:brightness-110`
                }`}
              >
                {/* WAVE */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 overflow-hidden rounded-b-[10px]">
                  <div
                    className={`absolute -bottom-7 left-[-10%] h-14 w-[120%] rounded-[50%] border-t border-white/10 ${style.wave}`}
                  />
                </div>

                <div className="relative z-10 flex h-full items-center justify-center">
                  <span
                    className={`text-sm font-extrabold sm:text-lg ${style.text}`}
                  >
                    {level.name}
                  </span>
                </div>

                {/* =================================================
                    SELECTION CIRCLE
                    SAME OVERLAPPING STYLE AS MAIN PLAN SELECTOR
                ================================================= */}
                <span
                  className={`absolute -bottom-[11px] left-1/2 z-20 flex h-[22px] w-[22px] -translate-x-1/2 items-center justify-center rounded-full border-2 ${
                    selected
                      ? `${style.circle} text-[#12161e]`
                      : "border-[#475569] bg-[#1b222d] text-transparent"
                  }`}
                >
                  {selected && (
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12.5L10 17.5L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          COMPARISON AREA
      ========================================================= */}
      <div className="min-h-0 flex-1 overflow-auto bg-[#12161e] px-3 py-4 sm:px-6 sm:py-5">
        <div className="min-w-[700px] overflow-hidden rounded-[14px] border border-[#2d3748] bg-[#12161e]">
          {/* =====================================================
              TABLE HEADER
          ===================================================== */}
          <div className="grid grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,1fr))] border-b border-[#2d3748] bg-[#171d26]">
            <div className="flex items-center px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
                Features
              </span>
            </div>

            {levels.map((level, index) => {
              const selected =
                selectedPlan === level.name;

              const headerTextColors = [
                "text-[#60a5fa]",
                "text-[#a3e635]",
                "text-[#f6c453]",
              ];

              return (
                <div
                  key={level.name}
                  className={`flex items-center justify-center border-l border-dashed px-3 py-4 transition ${
                    selected
                      ? "border-[#a3e635]/40 bg-white/[0.04]"
                      : "border-white/10"
                  }`}
                >
                  <span
                    className={`text-sm font-extrabold ${
                      headerTextColors[
                        index %
                          headerTextColors.length
                      ]
                    }`}
                  >
                    {level.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* =====================================================
              FEATURE ROWS
          ===================================================== */}
          {(() => {
            const allFeatures = Array.from(
              new Set(
                levels.flatMap((level) =>
                  Array.isArray(level.features)
                    ? level.features
                    : [],
                ),
              ),
            );

            if (allFeatures.length === 0) {
              return (
                <div className="px-6 py-12 text-center text-sm text-[#64748b]">
                  No comparison features available.
                </div>
              );
            }

            return allFeatures.map(
              (feature, featureIndex) => (
                <div
                  key={`${feature}-${featureIndex}`}
                  className="grid grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,1fr))] border-b border-[#2d3748] last:border-b-0"
                >
                  {/* FEATURE NAME */}
                  <div className="flex items-center bg-[#12161e] px-5 py-4">
                    <span className="text-sm font-semibold leading-5 text-[#e2e8f0]">
                      {feature}
                    </span>
                  </div>

                  {/* PLAN AVAILABILITY */}
                  {levels.map((level) => {
                    const included =
                      Array.isArray(
                        level.features,
                      ) &&
                      level.features.includes(
                        feature,
                      );

                    const selected =
                      selectedPlan === level.name;

                    return (
                      <div
                        key={`${level.name}-${feature}`}
                        className={`flex items-center justify-center border-l border-dashed px-3 py-4 transition ${
                          selected
                            ? "border-[#a3e635]/30 bg-white/[0.035]"
                            : "border-white/10 bg-[#12161e]"
                        }`}
                      >
                        {included ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M5 12.5L10 17.5L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M7 7L17 17M17 7L7 17"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            );
          })()}
        </div>
      </div>

      {/* =========================================================
          BOTTOM ACTION BAR
      ========================================================= */}
      {selectedLevel && (
        <div className="shrink-0 border-t border-[#2d3748] bg-[#171d26] px-4 py-3.5 shadow-[0_-8px_25px_rgba(0,0,0,0.25)] sm:px-6 sm:py-4">
          {(() => {
            const pricing =
              getLevelPricing(
                selectedLevel,
              );

            return (
              <div className="flex items-center justify-between gap-4">
                {/* SELECTED PLAN + PRICE */}
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">
                      Selected Plan
                    </p>

                    <p className="mt-0.5 truncate text-sm font-extrabold text-white sm:text-base">
                      {selectedLevel?.name ?? "Plan"} Plan
                    </p>
                  </div>

                  <div className="hidden h-9 w-px bg-[#2d3748] sm:block" />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[19px] font-extrabold text-white sm:text-[21px]">
                        ₹{pricing.price}
                      </span>

                      {pricing.originalPrice >
                        pricing.price && (
                        <span className="text-xs font-medium text-[#64748b] line-through sm:text-sm">
                          ₹{pricing.originalPrice}
                        </span>
                      )}
                    </div>

                    {pricing.discount > 0 && (
                      <span className="mt-1 inline-flex rounded-full bg-[#123321] px-2.5 py-1 text-[10px] font-extrabold text-[#22c55e]">
                        {pricing.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* BUY */}
                <button
                  type="button"
                  onClick={() => {
                    setComparePlansOpen(false);
                  }}
                  className="shrink-0 rounded-[8px] bg-gradient-to-r from-[#e0a838] to-[#f59e0b] px-6 py-2.5 text-sm font-extrabold text-[#17120a] shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:px-8 sm:py-3"
                >
                  BUY
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  </div>
)}

{enrollmentSuccessOpen && (
  <div
    className="fixed inset-0 z-[110] bg-black/55 backdrop-blur-[2px]"
    onClick={() => setEnrollmentSuccessOpen(false)}
  >
    <div
      className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-white shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* SUCCESS ICON */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12.5L10 17.5L19 7"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* HEADING */}
        <h2 className="mt-7 text-[22px] font-extrabold tracking-[-0.02em] text-[#171717]">
          You have successfully enrolled.
        </h2>

        {/* MESSAGE */}
        <p className="mt-3 max-w-[340px] text-sm leading-6 text-[#666]">
          You are now enrolled in{" "}
          <span className="font-bold text-[#333]">
            {batch.name}
          </span>
          . You can start learning right away.
        </p>

        {/* BENEFITS */}
        <div className="mt-7 w-full max-w-[340px] space-y-3 text-left">
          <div className="flex items-center gap-3 rounded-[10px] bg-[#f7f7f8] px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
              <CheckIcon />
            </span>

            <span className="text-sm font-semibold text-[#333]">
              Full batch access
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-[10px] bg-[#f7f7f8] px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
              <CheckIcon />
            </span>

            <span className="text-sm font-semibold text-[#333]">
              Classes and learning content
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-[10px] bg-[#f7f7f8] px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
              <CheckIcon />
            </span>

            <span className="text-sm font-semibold text-[#333]">
              Tests and practice
            </span>
          </div>
        </div>

        {/* LET&apos;S STUDY */}
        <button
          type="button"
          onClick={() => {
            setEnrollmentSuccessOpen(false);
          }}
          className="mt-8 w-full max-w-[340px] rounded-[9px] bg-[#5b2bb8] px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#4d239c] active:scale-[0.98]"
        >
          Let&apos;s Study
        </button>
      </div>
    </div>
  </div>
)}

  </div>
  </div>
);
}