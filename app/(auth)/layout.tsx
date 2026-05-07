export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="min-h-[calc(100vh-56px)] grid place-items-center py-20">
        {children}
      </div>
    </div>
  );
}
