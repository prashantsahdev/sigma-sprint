type ComingSoonProps = {
  title?: string;
};

export default function ComingSoon({
  title = "Coming Soon",
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#202020]">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          This feature is currently under development.
        </p>
      </div>
    </div>
  );
}