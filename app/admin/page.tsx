export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[#5424ad]">
          SigmaSprint Administration
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#151515]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-[15px] text-gray-500">
          Manage SigmaSprint from one place.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Students
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#151515]">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Batches
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#151515]">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Questions
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#151515]">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Announcements
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#151515]">
            0
          </p>
        </div>
      </div>
    </div>
  );
}