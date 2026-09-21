"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type PricingOption = "Monthly" | "Yearly" | "Both";

type LevelPricing = {
  pricingOption: PricingOption;
  monthlyOriginalPrice: number;
  monthlyPrice: number;
  monthlyDiscountPercent: number;
  yearlyOriginalPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
};

type BatchLevel = {
  id: string;
  name: "Basic" | "Standard" | "Premium";
  featureIds: string[];
  pricing: LevelPricing;
};

type BatchSubject = {
  id: string;
  name: string;
  topics: {
    id: string;
    name: string;
  }[];
};

type FirestoreBatch = {
  id?: string;
  name?: string;
  bannerUrl?: string;
  description?: string;
  hasLevels?: boolean;
  levels?: BatchLevel[];
  pricing?: LevelPricing | null;
  featureIds?: string[];
  subjects?: BatchSubject[];
};

type BillingPeriod = "Monthly" | "Yearly";

type PriceDetails = {
  originalPrice: number;
  price: number;
  discount: number;
};

export default function BillingPage() {
  const router = useRouter();

  const [batch, setBatch] =
    useState<FirestoreBatch | null>(null);

    const [enrollmentSuccessOpen, setEnrollmentSuccessOpen] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

  const [selectedLevel, setSelectedLevel] =
    useState<BatchLevel | null>(null);

  const [batchId, setBatchId] = useState("");
  const [levelId, setLevelId] = useState("");

  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriod>("Yearly");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Read batchId and levelId from the URL.
   *
   * Examples:
   *
   * Free batch:
   * /dashboard/billing?batchId=abc123
   *
   * Single paid batch:
   * /dashboard/billing?batchId=abc123
   *
   * Multi-level batch:
   * /dashboard/billing?batchId=abc123&levelId=standard
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    setBatchId(params.get("batchId") ?? "");
    setLevelId(params.get("levelId") ?? "");
  }, []);

  /*
   * Load the selected batch from Firestore.
   */
  useEffect(() => {
    if (!batchId) {
      return;
    }

    const loadBatch = async () => {
      try {
        setLoading(true);
        setError("");

        const batchRef = doc(
          db,
          "batches",
          batchId,
        );

        const batchSnapshot = await getDoc(batchRef);

        if (!batchSnapshot.exists()) {
          setError("The selected batch could not be found.");
          return;
        }

        const batchData = {
          id: batchSnapshot.id,
          ...batchSnapshot.data(),
        } as FirestoreBatch;

        setBatch(batchData);

        /*
         * If this is a multi-level batch,
         * find the level selected on the previous page.
         */
        if (
          batchData.hasLevels === true &&
          levelId
        ) {
          const matchingLevel =
            batchData.levels?.find(
              (level) => level.id === levelId,
            ) ?? null;

          if (!matchingLevel) {
            setError(
              "The selected plan could not be found.",
            );
            return;
          }

          setSelectedLevel(matchingLevel);

          /*
           * Set the initial billing period according
           * to the pricing configuration.
           */
          if (
            matchingLevel.pricing.pricingOption ===
            "Monthly"
          ) {
            setBillingPeriod("Monthly");
          } else {
            setBillingPeriod("Yearly");
          }
        }
      } catch (loadError) {
        console.error(
          "Failed to load billing information:",
          loadError,
        );

        setError(
          "Something went wrong while loading the billing information.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadBatch();
  }, [batchId, levelId]);

  /*
   * Determine whether this is a free batch.
   *
   * A free batch:
   * - does not have levels
   * - does not have pricing
   */
  const isFree =
    batch !== null &&
    batch.hasLevels !== true &&
    batch.pricing == null;

  /*
   * For paid batches, determine which pricing object
   * should be used.
   *
   * Multi-level:
   *     selectedLevel.pricing
   *
   * Single paid:
   *     batch.pricing
   */
  const activePricing: LevelPricing | null =
    batch?.hasLevels === true
      ? selectedLevel?.pricing ?? null
      : batch?.pricing ?? null;

  /*
   * Calculate the currently displayed price.
   */
  const priceDetails: PriceDetails = useMemo(() => {
    if (isFree || !activePricing) {
      return {
        originalPrice: 0,
        price: 0,
        discount: 0,
      };
    }

    if (billingPeriod === "Monthly") {
      return {
        originalPrice:
          activePricing.monthlyOriginalPrice,
        price: activePricing.monthlyPrice,
        discount:
          activePricing.monthlyDiscountPercent,
      };
    }

    return {
      originalPrice:
        activePricing.yearlyOriginalPrice,
      price: activePricing.yearlyPrice,
      discount:
        activePricing.yearlyDiscountPercent,
    };
  }, [
    activePricing,
    billingPeriod,
    isFree,
  ]);

  /*
   * Format money consistently.
   */
  const formatPrice = (price: number) =>
    `NPR ${price.toLocaleString()}`;

  /*
   * Determine whether Monthly/Yearly options
   * are actually available.
   */
  const monthlyAvailable =
    activePricing?.pricingOption === "Monthly" ||
    activePricing?.pricingOption === "Both";

  const yearlyAvailable =
    activePricing?.pricingOption === "Yearly" ||
    activePricing?.pricingOption === "Both";


  /*
   * Enroll the logged-in student in a free batch.
   *
   * Important:
   * - This runs only from the billing page.
   * - It does not run when the billing page is opened.
   * - Paid enrollment/payment is handled separately later.
   */
const handleFreeEnrollment = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser || !batch || !batch.id || !isFree) {
    return;
  }

  setEnrolling(true);

  try {
    const enrollmentRef = doc(
      db,
      "enrollments",
      `${currentUser.uid}_${batch.id}`,
    );

    await setDoc(
      enrollmentRef,
      {
        uid: currentUser.uid,
        batchId: batch.id,
        levelId: null,
        type: "free",
        status: "active",
        enrolledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    /*
     * After successful enrollment,
     * show the enrollment success slide-over.
     */
    setEnrollmentSuccessOpen(true);
  } catch (enrollmentError) {
    console.error(
      "Failed to enroll in free batch:",
      enrollmentError,
    );

    setError(
      "Unable to complete enrollment. Please try again.",
    );
  } finally {
    setEnrolling(false);
  }
};


  /*
   * If loading, show a clean loading screen.
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f7]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm font-semibold text-[#666]">
            Loading billing information...
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error state.
   */
  if (error || !batch) {
    return (
      <main className="min-h-screen bg-[#f5f5f7]">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-5">
          <div className="w-full rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-[#111]">
              Unable to open billing
            </h1>

            <p className="mt-2 text-sm text-[#777]">
              {error ||
                "The selected batch could not be loaded."}
            </p>

            <button
              type="button"
             onClick={() => router.push("/dashboard/batches")}
              className="mt-6 rounded-xl bg-[#5b2bb8] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4d239c]"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayedName =
    selectedLevel
      ? `${batch.name ?? "Batch"} — ${selectedLevel.name} Plan`
      : batch.name ?? "Selected Batch";

  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <header className="w-full bg-[#171717]">
        <div className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center px-5 sm:px-8">
          {/* Sigma-Sprint Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/logo.png"
                alt="Sigma-Sprint"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>

            <span className="text-lg font-extrabold tracking-tight text-white">
              SIGMA-SPRINT
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
  if (batchId) {
    router.push(
      `/dashboard/batches/view?batchId=${encodeURIComponent(
        batchId,
      )}`,
    );
  } else {
    router.push("/dashboard/batches");
  }
}}
          className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#333] transition hover:text-[#5b2bb8]"
        >
          <span className="text-xl leading-none">
            ←
          </span>

          Go Back
        </button>

        {/* Two Column Layout */}
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          {/* =================================================
              LEFT COLUMN
              ================================================= */}
          <section>
            {/* Main Heading */}
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
              Order Summary
            </h1>

            {/* Cart Card */}
            <div className="mt-6 overflow-hidden rounded-xl border border-[#e7e7e7] bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  {/* Course Thumbnail */}
                  <div className="relative h-[170px] w-full shrink-0 overflow-hidden rounded-lg bg-[#eee] sm:h-[125px] sm:w-[220px]">
                    {batch.bannerUrl ? (
                     <Image
  src={batch.bannerUrl}
  alt={batch.name ?? "Batch banner"}
  width={880}
  height={500}
  unoptimized
  className="h-full w-full object-cover"
/>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#ece8f8] px-5 text-center">
                        <span className="text-sm font-bold text-[#5b2bb8]">
                          SIGMA-SPRINT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Information */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#888]">
                        Selected Course
                      </p>

                      <h2 className="mt-2 text-xl font-extrabold leading-snug text-[#111]">
                        {batch.name ??
                          "Selected Batch"}
                      </h2>

                      {selectedLevel && (
                        <p className="mt-1 text-sm font-bold text-[#5b2bb8]">
                          {selectedLevel.name} Plan
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4 sm:mt-4">
                      <span className="text-sm font-semibold text-[#777]">
                        {isFree
                          ? "Free Enrollment"
                          : billingPeriod}
                      </span>

                      <span className="text-xl font-extrabold text-[#111]">
                        {isFree
                          ? "FREE"
                          : formatPrice(
                              priceDetails.price,
                            )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                BILLING PERIOD
                ================================================= */}
            {!isFree && activePricing && (
              <div className="mt-6 rounded-xl border border-[#e7e7e7] bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-base font-extrabold text-[#111]">
                  Choose Billing Period
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {monthlyAvailable && (
                    <button
                      type="button"
                      onClick={() =>
                        setBillingPeriod(
                          "Monthly",
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        billingPeriod ===
                        "Monthly"
                          ? "border-[#5b2bb8] bg-[#f5efff]"
                          : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                      }`}
                    >
                      <p className="text-sm font-extrabold text-[#111]">
                        Monthly
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#666]">
                        {formatPrice(
                          activePricing.monthlyPrice,
                        )}
                      </p>
                    </button>
                  )}

                  {yearlyAvailable && (
                    <button
                      type="button"
                      onClick={() =>
                        setBillingPeriod(
                          "Yearly",
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        billingPeriod ===
                        "Yearly"
                          ? "border-[#5b2bb8] bg-[#f5efff]"
                          : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-[#111]">
                          Yearly
                        </p>

                        {activePricing.yearlyDiscountPercent >
                          0 && (
                          <span className="rounded-full bg-[#e8f7ed] px-2 py-1 text-[10px] font-extrabold text-[#159447]">
                            {
                              activePricing.yearlyDiscountPercent
                            }
                            % OFF
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-semibold text-[#666]">
                        {formatPrice(
                          activePricing.yearlyPrice,
                        )}
                      </p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT COLUMN
              ================================================= */}
          <aside className="space-y-5">
            {/* =================================================
                COUPON SECTION
                ================================================= */}
            <div className="rounded-xl border border-[#e7e7e7] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1efff] text-lg font-extrabold text-[#5b2bb8]">
                  %
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-[#111]">
                    Apply Code/Coupon
                  </h3>

                  <p className="mt-1 text-xs text-[#888]">
                    No coupons available
                  </p>
                </div>

                <span className="ml-auto text-xs font-extrabold uppercase text-[#aaa]">
                  Apply
                </span>
              </div>

              <div className="mt-5 border-t border-dashed border-[#ddd] pt-4">
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-between text-sm font-bold text-[#999]"
                >
                  <span>
                    Apply Coupon Code
                  </span>

                  <span className="text-lg">
                    ›
                  </span>
                </button>
              </div>
            </div>

         {/* =================================================
    PAYMENT SUMMARY
    ================================================= */}
<div className="rounded-xl border border-[#e7e7e7] bg-white p-5 shadow-sm sm:p-6">
  <h3 className="text-lg font-extrabold text-[#111]">
    Payment Summary
  </h3>

  <div className="mt-5 space-y-4 text-sm">
    {/* Price */}
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#666]">
        Price (1 item)
      </span>

      <span className="font-bold text-[#222]">
        {formatPrice(priceDetails.originalPrice)}
      </span>
    </div>

    {/* Discount */}
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#666]">
        Discount
      </span>

      <span className="font-bold text-[#159447]">
        {isFree
          ? formatPrice(0)
          : `-${formatPrice(
              Math.max(
                0,
                priceDetails.originalPrice -
                  priceDetails.price,
              ),
            )}`}
      </span>
    </div>

    {/* Delivery Charges */}
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#666]">
        Delivery Charges
      </span>

      <span className="font-bold text-[#222]">
        {formatPrice(0)}
      </span>
    </div>

    {/* Coupon Discount */}
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#666]">
        Coupon Disc.
      </span>

      <span className="font-bold text-[#222]">
        {formatPrice(0)}
      </span>
    </div>

    {/* Separator */}
    <div className="border-t border-[#e5e5e5] pt-5">
      <div className="flex items-end justify-between gap-4">
        <span className="text-base font-extrabold text-[#222]">
          Total Amount
        </span>

        <span className="text-2xl font-extrabold text-[#111]">
          {formatPrice(priceDetails.price)}
        </span>
      </div>
    </div>
  </div>

  {/* =================================================
      PRIMARY CTA
      ================================================= */}
<button
  type="button"
  disabled={isFree && enrolling}
  onClick={() => {
    if (isFree) {
      void handleFreeEnrollment();
      return;
    }

    console.log(
      "Continue from billing:",
      {
        batchId,
        levelId,
        billingPeriod,
        price: priceDetails.price,
      },
    );
  }}
  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#5c59e8] text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#4d4ad7] disabled:cursor-not-allowed disabled:opacity-70"
>
  {isFree && enrolling
    ? "Proceeding..."
    : "Proceed to Payment"}
</button>
</div>

{/* =================================================
    ITEM COUNT PREVIEW
    ================================================= */}
<div className="rounded-xl border border-[#e7e7e7] bg-white p-4 shadow-sm">
  <p className="text-xs font-bold text-[#777]">
    You are buying (1) item
  </p>

  <div className="mt-3 flex items-center gap-3">
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-[#ddd] bg-[#f3f3f3]">
      {batch.bannerUrl ? (
        <Image
          src={batch.bannerUrl}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] font-extrabold text-[#5b2bb8]">
          SIGMA
        </div>
      )}
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-[#222]">
        {displayedName}
      </p>

      <p className="mt-1 text-xs text-[#888]">
        {isFree
          ? "Free"
          : formatPrice(priceDetails.price)}
      </p>
    </div>
  </div>
</div>

{/* =================================================
    FREE ENROLLMENT SUCCESS OVERLAY
    ================================================= */}
{enrollmentSuccessOpen && (
  <div className="fixed inset-0 z-50 flex">
    {/* Dark overlay */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => {
        setEnrollmentSuccessOpen(false);
      }}
    />

    {/* Right-side success panel */}
    <aside className="relative ml-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-l-2xl bg-white shadow-2xl animate-[slideInRight_0.35s_ease-out] sm:w-[35%]">
      {/* Close button */}
      <button
        type="button"
        onClick={() => {
          setEnrollmentSuccessOpen(false);
        }}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f5] text-lg font-semibold leading-none text-[#555] transition hover:bg-[#e8e8eb] hover:text-[#222]"
      >
        ×
      </button>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
        {/* Success icon */}
        <Image
          src="/tick.png"
          alt="Successfully enrolled"
          width={90}
          height={90}
          className="h-16 w-16 object-contain"
          unoptimized
        />

        {/* Success heading */}
        <h2 className="mt-6 text-xl font-extrabold leading-tight text-[#202124]">
          You have successfully enrolled
        </h2>

        {/* My Batch message */}
        <p className="mt-4 max-w-[290px] text-sm font-medium leading-6 text-[#777]">
          You can find this batch in{" "}
          <span className="font-bold text-[#555]">
            &quot;My Batch&quot;
          </span>{" "}
          Section.
        </p>

        {/* Let's Study button */}
        <div className="mt-8 w-full">
          <button
            type="button"
            onClick={() => {
              setEnrollmentSuccessOpen(false);
            }}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#5b51d8] text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#4d45c7]"
          >
            Let&apos;s Study
          </button>
        </div>

        {/* Girls studying illustration */}
        <div className="mt-auto flex w-full justify-center pb-8 pt-8">
          <Image
            src="/girls-reading.png"
            alt="Students studying"
            width={300}
            height={250}
            className="h-auto max-h-[220px] w-[260px] object-contain"
            unoptimized
          />
        </div>
      </div>
    </aside>
  </div>
)}

</aside>
</div>
</div>
</main>
);
}