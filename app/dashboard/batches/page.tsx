"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type PricingOption = "Monthly" | "Yearly" | "Both";

type FirestoreBatch = {
  id: string;

  name?: string;
  bannerUrl?: string;
  planBannerText?: string;

  type?: string;
  paymentType?: string;

  targetAudience?: string;
  examGoal?: string;
  languages?: string[];

  originalPrice?: number;
  price?: number;

  monthlyOriginalPrice?: number;
  monthlyPrice?: number;
  monthlyDiscountPercent?: number;

  yearlyOriginalPrice?: number;
  yearlyPrice?: number;
  yearlyDiscountPercent?: number;

  discountPercent?: number;

  pricingOption?: PricingOption;

  pricing?: {
  pricingOption: PricingOption;
  monthlyOriginalPrice: number;
  monthlyPrice: number;
  monthlyDiscountPercent: number;
  yearlyOriginalPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
} | null;

  /*
   * Multiple-plan batch data
   */
  hasLevels?: boolean;

levels?: {
  id?: string;
  name: "Basic" | "Standard" | "Premium";

  featureIds?: string[];

  pricing?: {
    pricingOption?: "Monthly" | "Yearly" | "Both";

    monthlyOriginalPrice?: number;
    monthlyPrice?: number;
    monthlyDiscountPercent?: number;

    yearlyOriginalPrice?: number;
    yearlyPrice?: number;
    yearlyDiscountPercent?: number;
  };
}[];

  description?: string;
  subjects?: string[];
  topics?: string[];
  features?: string[];

  startDate?: string;
  endDate?: string;

  isVisible?: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
};

type Batch = {
  id: string;

  name: string;

  banner: string;

  type: "free" | "paid";

  /*
   * Automatically generated for
   * multiple-plan batches.
   *
   * Example:
   * Multiple Plans inside: Basic, Standard, Premium
   */
  planBannerText: string;

  targetAudience: string;

  examGoal: string;

  languages: string[];

  /*
   * Main/display price.
   * For multiple plans, this will be
   * taken from the Basic level.
   */
  originalPrice: number;

  price: number;

  discount: number;

  monthlyOriginalPrice: number;

  monthlyPrice: number;

  monthlyDiscountPercent: number;

  yearlyOriginalPrice: number;

  yearlyPrice: number;

  yearlyDiscountPercent: number;

  pricingOption: PricingOption;

  /*
   * Multiple-plan information.
   */
  hasLevels: boolean;

  levels: {
    name: "Basic" | "Standard" | "Premium";

    features: string[];

    pricingOption: PricingOption;

    monthlyOriginalPrice: number;

    monthlyPrice: number;

    monthlyDiscountPercent: number;

    yearlyOriginalPrice: number;

    yearlyPrice: number;

    yearlyDiscountPercent: number;
  }[];

  startDate: string;

  endDate: string;

  isVisible: boolean;

  status:
    | "Upcoming"
    | "Ongoing"
    | "Expired";

  enrolled: boolean;
};

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string",
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getNumber(value: unknown): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

/*
 * Adds st / nd / rd / th to the day.
 *
 * 1st
 * 2nd
 * 3rd
 * 4th
 * 21st
 * 22nd
 * 23rd
 * 24th
 */
function getOrdinalDay(day: number): string {
  const lastTwo = day % 100;

  if (
    lastTwo >= 11 &&
    lastTwo <= 13
  ) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;

    case 2:
      return `${day}nd`;

    case 3:
      return `${day}rd`;

    default:
      return `${day}th`;
  }
}

function formatDate(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = getOrdinalDay(
    date.getDate(),
  );

  const month = date.toLocaleDateString(
    "en-US",
    {
      month: "short",
    },
  );

  const year = date
    .getFullYear()
    .toString()
    .slice(-2);

  return `${day} ${month}'${year}`;
}

function getDiscount(
  originalPrice: number,
  price: number,
) {
  if (
    originalPrice <= 0 ||
    price <= 0 ||
    price >= originalPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) /
      originalPrice) *
      100,
  );
}

function getBatchTimingStatus(
  startDate: string,
  endDate: string,
): "Upcoming" | "Ongoing" | "Expired" {
  const now = new Date();

  const start = startDate
    ? new Date(startDate)
    : null;

  const end = endDate
    ? new Date(endDate)
    : null;

  const validStart =
    start &&
    !Number.isNaN(start.getTime());

  const validEnd =
    end &&
    !Number.isNaN(end.getTime());

  if (validEnd && end < now) {
    return "Expired";
  }

  if (validStart && start > now) {
    return "Upcoming";
  }

  return "Ongoing";
}

function getDisplayPricing(batch: Batch) {
  if (batch.type === "free") {
    return {
      originalPrice: 0,
      price: 0,
      discount: 0,
    };
  }

  if (batch.pricingOption === "Yearly") {
    return {
      originalPrice:
        batch.yearlyOriginalPrice,

      price:
        batch.yearlyPrice,

      discount:
        batch.yearlyDiscountPercent ||
        getDiscount(
          batch.yearlyOriginalPrice,
          batch.yearlyPrice,
        ),
    };
  }

  if (batch.pricingOption === "Monthly") {
    return {
      originalPrice:
        batch.monthlyOriginalPrice,

      price:
        batch.monthlyPrice,

      discount:
        batch.monthlyDiscountPercent ||
        getDiscount(
          batch.monthlyOriginalPrice,
          batch.monthlyPrice,
        ),
    };
  }

 return {
  originalPrice:
    batch.yearlyOriginalPrice > 0
      ? batch.yearlyOriginalPrice
      : batch.monthlyOriginalPrice,

  price:
    batch.yearlyPrice > 0
      ? batch.yearlyPrice
      : batch.monthlyPrice,

  discount:
    batch.yearlyDiscountPercent > 0
      ? batch.yearlyDiscountPercent
      : batch.monthlyDiscountPercent,
};
}

function BookIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function BatchesPage() {
    const router = useRouter();
  const [filter, setFilter] =
    useState<
      "all" | "free" | "enrolled"
    >("all");

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

useEffect(() => {
  let cancelled = false;

  // Listen for Firebase Auth resolution before reading Firestore
  const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch batches collection
      const batchesQuery = collection(db, "batches");
      const snapshot = await getDocs(batchesQuery);
      const loadedBatches = snapshot.docs
        .map((document): Batch | null => {
          const data = document.data() as FirestoreBatch;
          const isVisible: boolean = data.isVisible !== false;

          if (!isVisible) return null;

          const startDate = typeof data.startDate === "string" ? data.startDate : "";
          const endDate = typeof data.endDate === "string" ? data.endDate : "";
          const timingStatus = getBatchTimingStatus(startDate, endDate);

          if (timingStatus === "Expired") return null;

       const batchType: "free" | "paid" =
  data.hasLevels === true ||
  data.pricing != null
    ? "paid"
    : "free";

          const levels = Array.isArray(data.levels)
            ? data.levels
                .filter(
                  (level) =>
                    level &&
                    (level.name === "Basic" || level.name === "Standard" || level.name === "Premium")
                )
              .map((level) => ({
  name: level.name as "Basic" | "Standard" | "Premium",

  features: Array.isArray(level.featureIds)
    ? level.featureIds
    : [],

  pricingOption:
    level.pricing?.pricingOption === "Monthly" ||
    level.pricing?.pricingOption === "Yearly" ||
    level.pricing?.pricingOption === "Both"
      ? level.pricing.pricingOption
      : "Both",

  monthlyOriginalPrice: getNumber(
    level.pricing?.monthlyOriginalPrice,
  ),

  monthlyPrice: getNumber(
    level.pricing?.monthlyPrice,
  ),

  monthlyDiscountPercent: getNumber(
    level.pricing?.monthlyDiscountPercent,
  ),

  yearlyOriginalPrice: getNumber(
    level.pricing?.yearlyOriginalPrice,
  ),

  yearlyPrice: getNumber(
    level.pricing?.yearlyPrice,
  ),

  yearlyDiscountPercent: getNumber(
    level.pricing?.yearlyDiscountPercent,
  ),
}))
            : [];

          const hasLevels = data.hasLevels === true && levels.length > 1;

          const planBannerText = hasLevels
            ? `Multiple Plans inside: ${levels.map((level) => level.name).join(", ")}`
            : "";

          const basicLevel = levels.find((level) => level.name === "Basic") ?? levels[0];

       const displayOriginalPrice =
  hasLevels && basicLevel
    ? basicLevel.pricingOption === "Monthly" ||
      basicLevel.pricingOption === "Both"
      ? basicLevel.monthlyOriginalPrice
      : basicLevel.yearlyOriginalPrice
    : data.pricing
      ? data.pricing.pricingOption === "Monthly" ||
        data.pricing.pricingOption === "Both"
        ? getNumber(data.pricing.monthlyOriginalPrice)
        : getNumber(data.pricing.yearlyOriginalPrice)
      : 0;

        const displayPrice =
  hasLevels && basicLevel
    ? basicLevel.pricingOption === "Monthly" ||
      basicLevel.pricingOption === "Both"
      ? basicLevel.monthlyPrice
      : basicLevel.yearlyPrice
    : data.pricing
      ? data.pricing.pricingOption === "Monthly" ||
        data.pricing.pricingOption === "Both"
        ? getNumber(data.pricing.monthlyPrice)
        : getNumber(data.pricing.yearlyPrice)
      : 0;
    const displayDiscount =
  hasLevels && basicLevel
    ? basicLevel.pricingOption === "Monthly" ||
      basicLevel.pricingOption === "Both"
      ? basicLevel.monthlyDiscountPercent
      : basicLevel.yearlyDiscountPercent
    : data.pricing
      ? data.pricing.pricingOption === "Monthly" ||
        data.pricing.pricingOption === "Both"
        ? getNumber(data.pricing.monthlyDiscountPercent)
        : getNumber(data.pricing.yearlyDiscountPercent)
      : 0;
          return {
            id: document.id,
            name: data.name || "Untitled Batch",
            banner: data.bannerUrl || "",
            type: batchType,
            planBannerText,
            targetAudience: data.targetAudience || "",
            examGoal: data.examGoal || "",
            languages: normalizeArray(data.languages),
            originalPrice: displayOriginalPrice,
            price: displayPrice,
            discount: displayDiscount,


          monthlyOriginalPrice:
  hasLevels && basicLevel
    ? basicLevel.monthlyOriginalPrice
    : data.pricing
      ? getNumber(data.pricing.monthlyOriginalPrice)
      : 0,

monthlyPrice:
  hasLevels && basicLevel
    ? basicLevel.monthlyPrice
    : data.pricing
      ? getNumber(data.pricing.monthlyPrice)
      : 0,

monthlyDiscountPercent:
  hasLevels && basicLevel
    ? basicLevel.monthlyDiscountPercent
    : data.pricing
      ? getNumber(data.pricing.monthlyDiscountPercent)
      : 0,

yearlyOriginalPrice:
  hasLevels && basicLevel
    ? basicLevel.yearlyOriginalPrice
    : data.pricing
      ? getNumber(data.pricing.yearlyOriginalPrice)
      : 0,

yearlyPrice:
  hasLevels && basicLevel
    ? basicLevel.yearlyPrice
    : data.pricing
      ? getNumber(data.pricing.yearlyPrice)
      : 0,

yearlyDiscountPercent:
  hasLevels && basicLevel
    ? basicLevel.yearlyDiscountPercent
    : data.pricing
      ? getNumber(data.pricing.yearlyDiscountPercent)
      : 0,

pricingOption:
  hasLevels && basicLevel
    ? basicLevel.pricingOption
    : data.pricing?.pricingOption === "Monthly" ||
      data.pricing?.pricingOption === "Yearly" ||
      data.pricing?.pricingOption === "Both"
      ? data.pricing.pricingOption
      : "Both",

hasLevels,
levels,
startDate,
endDate,
isVisible,
status: timingStatus,
enrolled: false,
};
})
.filter((batch): batch is Batch => batch !== null);
      // 2. Fetch enrollment status using resolved currentUser
      if (currentUser) {
        const enrollmentQuery = query(
          collection(db, "enrollments"),
          where("uid", "==", currentUser.uid)
        );

        const enrollmentSnapshot = await getDocs(enrollmentQuery);
        const enrolledBatchIds = new Set(
          enrollmentSnapshot.docs
            .map((doc) => doc.data().batchId)
            .filter((id): id is string => typeof id === "string")
        );

        for (const batch of loadedBatches) {
          batch.enrolled = enrolledBatchIds.has(batch.id);
        }
      }

      if (!cancelled) {
        setBatches(loadedBatches);
      }
    } catch (loadError) {
      console.error("Failed to load batches:", loadError);
      if (!cancelled) {
        setError("Unable to load batches right now.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}, []);

  const filteredBatches =
    batches.filter((batch) => {
      if (filter === "free") {
        return batch.type === "free";
      }

      if (filter === "enrolled") {
        return batch.enrolled;
      }

      return true;
    });

  return (
    <div>
    {/* PAGE HEADER */}

<div>
  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5424ad]">
    Learning
  </p>

  <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#252525]">
    All Batches
  </h1>

  <p className="mt-1.5 text-sm text-[#6b7280]">
    Explore all available learning batches and find the right one for you.
  </p>
</div>

{/* FILTERS */}

<div className="mt-7 flex flex-wrap gap-2">
  {[
    {
      id: "all",
      label: "All",
    },
    {
      id: "free",
      label: "Free",
    },
    {
      id: "enrolled",
      label: "Enrolled",
    },
  ].map((item) => {
    const active =
      filter === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() =>
          setFilter(
            item.id as
              | "all"
              | "free"
              | "enrolled",
          )
        }
        className={
          active
            ? "rounded-xl bg-[#5424ad] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
            : "rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#5424ad]/30 hover:bg-[#f7f4fc] hover:text-[#5424ad]"
        }
      >
        {item.label}
      </button>
    );
  })}
</div>

      {/* LOADING */}

      {loading ? (
        <div className="mt-10 flex min-h-[360px] items-center justify-center rounded-[24px] border border-gray-100 bg-white shadow-[0_5px_25px_rgba(0,0,0,0.04)]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#5424ad]" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading batches...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="mt-10 flex min-h-[360px] items-center justify-center rounded-[24px] border border-red-100 bg-white shadow-[0_5px_25px_rgba(0,0,0,0.04)]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#252525]">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>
          </div>
        </div>
      ) : filteredBatches.length ===
        0 ? (
        <div className="mt-10 flex min-h-[360px] items-center justify-center rounded-[24px] border border-gray-100 bg-white shadow-[0_5px_25px_rgba(0,0,0,0.04)]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#252525]">
              No batches available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You haven&apos;t enrolled in any
              batches yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBatches.map(
            (batch) => {
              const pricing =
                getDisplayPricing(
                  batch,
                );

              const dateLabel =
                batch.status ===
                "Upcoming"
                  ? "Starting on"
                  : "Started on";

              return (
                <article
  key={batch.id}
  className="overflow-hidden rounded-[18px] border border-[#d9dce1] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
>
  {/* BANNER */}
  <div className="relative aspect-[16/8] overflow-hidden bg-[#eef5fb]">
    {batch.banner ? (
      <Image
        src={batch.banner}
        alt={batch.name}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400">
        Batch Banner
      </div>
    )}

    {batch.planBannerText && (
      <div className="absolute left-3 right-3 top-2">
        <span className="inline-flex max-w-full items-center gap-1.5 text-[14px] font-semibold leading-none text-[#171717]">
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#ffd900] text-[11px]"
            aria-hidden="true"
          >
            ✿
          </span>

          <span className="truncate">
            {batch.planBannerText}
          </span>
        </span>
      </div>
    )}
  </div>

  {/* CARD CONTENT */}
  <div className="px-5 pb-5 pt-4">
    {/* TARGET + LANGUAGE */}
    <div className="flex items-center justify-between gap-3">
      {batch.targetAudience ? (
        <span className="text-[17px] font-medium leading-none text-[#ff5a16]">
          {batch.targetAudience}
        </span>
      ) : (
        <span />
      )}

      {batch.languages[0] && (
        <span className="rounded-[5px] border border-[#cfd2d6] bg-white px-3 py-1.5 text-[13px] font-medium uppercase leading-none tracking-wide text-[#222]">
          {batch.languages[0]}
        </span>
      )}
    </div>

    {/* TITLE */}
    <h2 className="mt-2.5 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#171717]">
      {batch.name}
    </h2>

    {/* EXAM GOAL */}
    {batch.examGoal && (
      <div className="mt-3.5 flex items-center gap-2.5 text-[15px] font-medium leading-none text-[#262626]">
        <span className="text-[#202020]">
          <BookIcon />
        </span>

        <span>
          {batch.examGoal}
        </span>
      </div>
    )}

    {/* STATUS + DATE */}
    <div className="mt-3 flex items-center gap-2 text-[15px] leading-none">
      <span className="flex items-center gap-2 font-medium text-[#272727]">
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${
            batch.status === "Upcoming"
              ? "bg-orange-500"
              : "bg-[#d83a4b]"
          }`}
        />

        <span>
          {batch.status}
        </span>
      </span>

      <span className="text-[#777]">|</span>

      {batch.startDate && (
        <span className="whitespace-nowrap text-[#272727]">
          {dateLabel}{" "}
          {formatDate(batch.startDate)}
        </span>
      )}
    </div>

       {/* BOTTOM SECTION */}
    <div className="mt-6 flex items-center gap-2">
      {/* PRICE */}
      <div className="min-w-0 flex-1">
        {batch.type === "free" ? (
          <span className="text-[20px] font-bold leading-none text-[#111]">
            Free
          </span>
        ) : (
          <div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
             {pricing.price > 0 && (
                <span className="text-[20px] font-bold leading-none text-[#111]">
                  NPR {pricing.price.toLocaleString()}
                </span>
              )}

              {pricing.originalPrice > 0 && (
                <span className="text-[13px] leading-none text-[#777] line-through">
                  NPR {pricing.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {pricing.discount > 0 && (
              <div className="mt-2 text-[17px] font-semibold leading-none text-[#159447]">
                {pricing.discount}% OFF
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN BUTTON */}
      <button
        type="button"
        disabled={batch.enrolled}
        onClick={() => {
          if (batch.enrolled) {
            return;
          }

          router.push(
            `/billing?batchId=${encodeURIComponent(batch.id)}`,
          );
        }}
        className="flex h-[52px] min-w-[118px] items-center justify-center rounded-[7px] bg-[#202528] px-4 text-[16px] font-bold text-white transition hover:bg-[#15191b] active:scale-[0.99] disabled:cursor-default disabled:opacity-100"
      >
        {batch.enrolled
          ? "Enrolled"
          : batch.type === "free"
            ? "Enroll Now"
            : "Buy Now"}
      </button>

      {/* ARROW BUTTON */}
      <Link
        href={`/dashboard/batches/view?batchId=${batch.id}`}
        aria-label={`See details for ${batch.name}`}
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[7px] border border-[#d7dadd] bg-white text-[#202528] transition hover:bg-[#f6f6f6] hover:text-[#5424ad]"
      >
        <ArrowIcon />
      </Link>
    </div>
  </div>
</article>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}