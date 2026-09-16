// app/dashboard/study/page.tsx

"use client";

import { useState } from "react";

export default function StudyPage() {
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState("SANKALP IOE 2084");

  const batches = [
    "SANKALP IOE 2084",
    "Foundation Batch",
    "Engineering Entrance Batch",
  ];

  return (
    <div className="min-h-full bg-[#f7f7f8]">
      {/* =========================================================
          STUDY TOP STATUS HEADER
      ========================================================= */}
      <div className="border-b border-[#eeeeee] bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-end gap-3 px-6">
          {/* Gift */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eeeeee] bg-white text-[20px] transition hover:bg-[#f7f7f7]"
            title="Rewards"
          >
            🎁
          </button>

          {/* Streak */}
          <div className="flex h-11 items-center gap-2 rounded-xl border border-[#eeeeee] bg-white px-4">
            <span className="text-[18px]">🔥</span>
            <div className="leading-tight">
              <p className="text-[11px] font-medium text-[#888888]">
                Streak
              </p>
              <p className="text-sm font-bold text-[#222222]">
                0 days
              </p>
            </div>
          </div>

          {/* XP */}
          <div className="flex h-11 items-center gap-2 rounded-xl border border-[#eeeeee] bg-white px-4">
            <span className="text-[17px]">⚡</span>
            <div className="leading-tight">
              <p className="text-[11px] font-medium text-[#888888]">
                XP
              </p>
              <p className="text-sm font-bold text-[#222222]">
                0
              </p>
            </div>
          </div>

          {/* Notification */}
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#eeeeee] bg-white text-[19px] transition hover:bg-[#f7f7f7]"
            title="Notifications"
          >
            🔔
            <span className="absolute right-[8px] top-[7px] h-2 w-2 rounded-full bg-[#5b2bb8]" />
          </button>
        </div>
      </div>

      {/* =========================================================
          BATCH SELECTOR
      ========================================================= */}
      <div className="border-b border-[#eeeeee] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
          {/* Batch selector */}
          <button
            type="button"
            onClick={() => setBatchOpen(true)}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e7e7e7] bg-white px-4 py-3 text-left transition hover:border-[#cfcfcf] hover:bg-[#fafafa]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1ebfb] text-[#5b2bb8]">
              📚
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#999999]">
                Current Batch
              </p>

              <p className="truncate text-sm font-bold text-[#222222]">
                {selectedBatch}
              </p>
            </div>

            <svg
              className="ml-3 h-4 w-4 shrink-0 text-[#666666]"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Upgrade */}
          <button
            type="button"
            className="shrink-0 rounded-xl bg-[#111111] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#292929] active:scale-[0.98]"
          >
            UPGRADE TO INFINITY
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN STUDY CONTENT
      ========================================================= */}
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Heading */}
        <div className="mb-7">
          <p className="mb-2 text-sm font-semibold text-[#5b2bb8]">
            STUDY
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#181818]">
            Continue your learning
          </h1>

          <p className="mt-2 text-sm text-[#777777]">
            Learn, practice, and prepare from your enrolled batch.
          </p>
        </div>

        {/* Quick Access */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-[#222222]">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* All Classes */}
            <button
              type="button"
              className="group rounded-2xl border border-[#e9e9e9] bg-white p-5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                📖
              </div>

              <h3 className="text-[15px] font-bold text-[#222222]">
                All Classes
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#888888]">
                Browse all available classes and lessons.
              </p>

              <span className="mt-4 block text-xs font-bold text-[#5b2bb8]">
                Start learning →
              </span>
            </button>

            {/* Practice */}
            <button
              type="button"
              className="group rounded-2xl border border-[#e9e9e9] bg-white p-5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                📝
              </div>

              <h3 className="text-[15px] font-bold text-[#222222]">
                Practice
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#888888]">
                Practice questions and improve your concepts.
              </p>

              <span className="mt-4 block text-xs font-bold text-[#5b2bb8]">
                Practice now →
              </span>
            </button>

            {/* Tests */}
            <button
              type="button"
              className="group rounded-2xl border border-[#e9e9e9] bg-white p-5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                🎯
              </div>

              <h3 className="text-[15px] font-bold text-[#222222]">
                Tests
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#888888]">
                Test your preparation with timed tests.
              </p>

              <span className="mt-4 block text-xs font-bold text-[#5b2bb8]">
                View tests →
              </span>
            </button>

            {/* My Progress */}
            <button
              type="button"
              className="group rounded-2xl border border-[#e9e9e9] bg-white p-5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                📊
              </div>

              <h3 className="text-[15px] font-bold text-[#222222]">
                My Progress
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#888888]">
                Track your learning and preparation.
              </p>

              <span className="mt-4 block text-xs font-bold text-[#5b2bb8]">
                View progress →
              </span>
            </button>
          </div>
        </section>

        {/* Subjects */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#222222]">
                Your Subjects
              </h2>

              <p className="mt-1 text-xs text-[#888888]">
                Select a subject to start studying.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Physics */}
            <button
              type="button"
              className="group overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="h-1.5 bg-[#5b2bb8]" />

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                    ⚛
                  </div>

                  <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[11px] font-semibold text-[#777777]">
                    Physics
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#222222]">
                  Physics
                </h3>

                <p className="mt-2 text-sm text-[#888888]">
                  Build strong concepts and solve entrance-level problems.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#999999]">
                    Start learning
                  </span>

                  <span className="text-sm font-bold text-[#5b2bb8] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>

            {/* Chemistry */}
            <button
              type="button"
              className="group overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="h-1.5 bg-[#5b2bb8]" />

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                    🧪
                  </div>

                  <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[11px] font-semibold text-[#777777]">
                    Chemistry
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#222222]">
                  Chemistry
                </h3>

                <p className="mt-2 text-sm text-[#888888]">
                  Learn concepts, reactions, and problem-solving techniques.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#999999]">
                    Start learning
                  </span>

                  <span className="text-sm font-bold text-[#5b2bb8] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>

            {/* Mathematics */}
            <button
              type="button"
              className="group overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#d9ccef] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              <div className="h-1.5 bg-[#5b2bb8]" />

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebfb] text-xl">
                    ∑
                  </div>

                  <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[11px] font-semibold text-[#777777]">
                    Mathematics
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#222222]">
                  Mathematics
                </h3>

                <p className="mt-2 text-sm text-[#888888]">
                  Strengthen your mathematical concepts and problem solving.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#999999]">
                    Start learning
                  </span>

                  <span className="text-sm font-bold text-[#5b2bb8] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-[#222222]">
            Continue Learning
          </h2>

          <div className="rounded-2xl border border-[#e9e9e9] bg-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-[#f1ebfb] px-3 py-1 text-[11px] font-bold text-[#5b2bb8]">
                    Physics
                  </span>

                  <span className="text-xs text-[#999999]">
                    Rotation
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#222222]">
                  Continue your previous class
                </h3>

                <p className="mt-1 text-xs text-[#888888]">
                  Pick up your learning from where you stopped.
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-xl bg-[#5b2bb8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d239c] active:scale-[0.98]"
              >
                Continue →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          BATCH SELECTOR DRAWER
      ========================================================= */}
      {batchOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close batch selector"
            onClick={() => setBatchOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer */}
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#eeeeee] px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#222222]">
                  Select your batch
                </h2>

                <p className="mt-1 text-xs text-[#888888]">
                  Choose the batch you want to study.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBatchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#777777] transition hover:bg-[#f5f5f5]"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-5">
              <div className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e5e5] px-4">
                <svg
                  className="h-4 w-4 text-[#999999]"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 13L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search for your batches"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#aaaaaa]"
                />
              </div>
            </div>

            {/* Batches */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#999999]">
                  My Batches
                </h3>

                <span className="text-xs text-[#aaaaaa]">
                  {batches.length}
                </span>
              </div>

              <div className="space-y-2">
                {batches.map((batch) => {
                  const isSelected = selectedBatch === batch;

                  return (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => setSelectedBatch(batch)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#cdb9e9] bg-[#f7f2fc]"
                          : "border-[#eeeeee] bg-white hover:bg-[#fafafa]"
                      }`}
                    >
                      {/* Radio */}
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#5b2bb8]"
                            : "border-[#cccccc]"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#5b2bb8]" />
                        )}
                      </span>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1ebfb]">
                        📚
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#222222]">
                          {batch}
                        </p>

                        <p className="mt-1 text-[11px] text-[#888888]">
                          Enrolled batch
                        </p>
                      </div>

                      <span
                        className={`text-lg ${
                          isSelected
                            ? "text-[#f1b92b]"
                            : "text-[#cccccc]"
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Continue */}
            <div className="border-t border-[#eeeeee] bg-white p-6">
              <button
                type="button"
                onClick={() => setBatchOpen(false)}
                className="w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white transition hover:bg-[#292929] active:scale-[0.99]"
              >
                Continue
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}