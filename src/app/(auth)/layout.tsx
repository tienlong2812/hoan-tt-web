import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">HOAN TT</Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
