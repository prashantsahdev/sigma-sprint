"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

type Topic = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
  topics: Topic[];
};

export default function SubjectsPage() {


  const searchParams = useSearchParams();
const batchId = searchParams.get("batchId") ?? "";
const router = useRouter();

const [subjects, setSubjects] = useState<Subject[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadSubjects() {
    if (!batchId) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      const batchSnap = await getDoc(doc(db, "batches", batchId));

    if (!batchSnap.exists()) {
  setSubjects([]);
  setLoading(false);
  return;
}

      const data = batchSnap.data();

      setSubjects(
        Array.isArray(data.subjects) ? data.subjects : [],
      );
    } catch (error) {
      console.error("Failed to load subjects:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  loadSubjects();
}, [batchId]);

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-6 py-8 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-[-0.035em] text-[#202020]">
          Subjects
        </h1>

        <p className="mt-1 text-[14px] text-[#77777f]">
          Explore subjects and topics available in your batch.
        </p>
      </div>

      {/* Subject cards */}
      {/* Subject cards */}
{loading ? (
  <div className="rounded-[20px] border border-[#e9e9ec] bg-white px-6 py-10 text-center">
    <p className="text-[14px] text-[#77777f]">
      Loading subjects...
    </p>
  </div>
) : subjects.length === 0 ? (
  <div className="rounded-[20px] border border-[#e9e9ec] bg-white px-6 py-10 text-center">
    <p className="text-[16px] font-semibold text-[#404047]">
      No subjects available
    </p>

    <p className="mt-1 text-[13px] text-[#8b8b92]">
      This batch does not have any subjects yet.
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
    {subjects.map((subject) => {


          return (
            <div
              key={subject.id}
              className="overflow-hidden rounded-[20px] border border-[#e9e9ec] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.045)]"
            >
             <button
  type="button"
  onClick={() => {
    if (!batchId) {
      return;
    }

  router.push(
  `/dashboard/study/subjects/topics?batchId=${encodeURIComponent(
    batchId,
  )}&subjectId=${encodeURIComponent(subject.id)}`,
);
  }}
  className="group flex w-full items-center justify-between px-5 py-5 text-left transition-all duration-200 hover:bg-[#fafafa]"
>
                <div className="min-w-0">
                  <h2 className="truncate text-[17px] font-semibold tracking-[-0.015em] text-[#202020]">
                    {subject.name}
                  </h2>

                  <p className="mt-1 text-[13px] text-[#8b8b92]">
                    {subject.topics.length} topics
                  </p>
                </div>

               <span className="ml-4 shrink-0 text-[25px] font-light leading-none text-[#9d9da3] transition-transform duration-200 group-hover:translate-x-1">
  &gt;
</span>
              </button>



            </div>
          );
        })}
      </div>
)}
    </div>
  );
}