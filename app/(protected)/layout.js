import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import MainNav from '@/components/layouts/MainNav';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/logout');
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="pt-28 pb-12">
        {children}
      </main>
    </div>
  );
}
