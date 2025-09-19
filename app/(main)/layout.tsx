'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/navigation/sidebar';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/use-auth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <MobileNav />
          <div className="flex-1" />
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}