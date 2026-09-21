"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import EmptyDppIcon from "@/components/icons/EmptyDppIcon";

import { db } from "@/lib/firebase";

type Topic = {
  id: string;
  name: string;
  content?: string;
};

type FirebaseTopic = {
  id: string;
  name: string;
  content?: string;
};

export default function TopicsPage() {
  const searchParams = useSearchParams();

  const batchId = searchParams.get("batchId") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";

  const [subjectName, setSubjectName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      if (!batchId || !subjectId) {
        setTopics([]);
        setLoading(false);
        return;
      }

      try {
        const batchSnap = await getDoc(
          doc(db, "batches", batchId),
        );

        if (!batchSnap.exists()) {
          setTopics([]);
          setLoading(false);
          return;
        }

        const data = batchSnap.data();

        const subjects = Array.isArray(data.subjects)
          ? data.subjects
          : [];

      const selectedSubject = subjects.find(
  (subject) => subject.id === subjectId,
);

        if (!selectedSubject) {
          setTopics([]);
          setLoading(false);
          return;
        }

        setSubjectName(selectedSubject.name ?? "");

 const subjectTopics: Topic[] = Array.isArray(selectedSubject.topics)
  ? selectedSubject.topics.map((topic: FirebaseTopic) => ({
      id: topic.id,
      name: topic.name,
      content: topic.content ?? "",
    }))
  : [];

        setTopics(subjectTopics);

        if (subjectTopics.length > 0) {
          setSelectedTopicId(subjectTopics[0].id);
        }
      } catch (error) {
        console.error("Failed to load topics:", error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, [batchId, subjectId]);

  const selectedTopic =
    topics.find((topic) => topic.id === selectedTopicId) ??
    topics[0];

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#202020]">
          {subjectName || "Topics"}
        </h1>

        <p className="mt-1 text-[14px] text-[#77777f]">
          Select a topic to begin learning.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-[#e8e8eb] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.035)]">
          <p className="text-[14px] text-[#77777f]">
            Loading topics...
          </p>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-[#e8e8eb] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.035)]">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f4f2ff]">
              <span className="text-[24px]">∅</span>
            </div>

            <p className="mt-4 text-[16px] font-semibold text-[#404047]">
              No topics available
            </p>

            <p className="mt-1 text-[13px] text-[#8b8b92]">
              This subject does not have any topics yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-[#e7e7ea] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.055)]">
          <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)]">
            {/* LEFT — TOPIC LIST */}
            <aside className="border-b border-[#ededf0] bg-[#fbfbfc] lg:border-b-0 lg:border-r">
             <div className="border-b border-[#ededf0] px-5 py-5">
  <p className="text-[16px] font-bold tracking-[-0.02em] text-[#202020]">
    Topics
  </p>
</div>

              <div className="p-3">
                <div className="space-y-1">
                  {topics.map((topic, index) => {
                    const isSelected =
                      topic.id === selectedTopicId;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() =>
                          setSelectedTopicId(topic.id)
                        }
                        className={`group flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-[#f1efff] shadow-[0_2px_8px_rgba(90,75,150,0.06)]"
                            : "hover:bg-[#f4f4f5]"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold transition-colors ${
                            isSelected
                              ? "bg-[#756bb0] text-white"
                              : "bg-[#eeeeef] text-[#85858d] group-hover:bg-[#e6e6e8]"
                          }`}
                        >
                          {index + 1}
                        </span>

                        <span
                          className={`min-w-0 flex-1 truncate text-[14px] font-semibold ${
                            isSelected
                              ? "text-[#4f477d]"
                              : "text-[#45454c]"
                          }`}
                        >
                          {topic.name}
                        </span>

                        <span
                          className={`text-[18px] leading-none transition-all ${
                            isSelected
                              ? "translate-x-0 text-[#756bb0]"
                              : "-translate-x-1 text-[#b5b5bb] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }`}
                        >
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* RIGHT — CONTENT */}
        <main className="relative min-w-0 bg-white">
  <div className="border-b border-[#ededf0] px-6 py-5">
    <h2 className="text-[16px] font-bold tracking-[-0.02em] text-[#202020]">
      Contents
    </h2>
  </div>

  {selectedTopic?.content ? (
    <div className="px-7 py-7">
      <div className="prose max-w-none text-[14px] leading-7 text-[#44444b]">
        {selectedTopic.content}
      </div>
    </div>
  ) : (
    <div className="flex min-h-[490px] items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center text-center">
        <EmptyDppIcon size={200} />

        <h3 className="mt-5 text-[18px] font-bold tracking-[-0.02em] text-[#202020]">
          No content available
        </h3>

        <p className="mt-2 max-w-[320px] text-[13px] leading-5 text-[#8a8a91]">
          Contents will appear here once they are added.
        </p>
      </div>
    </div>
  )}
</main>
          </div>
        </div>
      )}
    </div>
  );
}