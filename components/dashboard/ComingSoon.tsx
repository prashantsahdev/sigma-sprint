

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1ebfb] text-3xl">
          🚀
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="mt-3 text-gray-500">
          {description ||
            "This section is currently under development."}
        </p>

        <div className="mt-6 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
          Coming Soon
        </div>
      </div>
    </div>
  );
}